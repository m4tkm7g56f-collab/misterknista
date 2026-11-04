// Schranke für die Subagents des Plugins (Befunde S01, S03 und S02 im Review-Log).
// PreToolUse-Hook: begrenzt Lese- und Schreibpfade sowie Abruf-URLs technisch, statt nur per Anweisung.
// Greift nur, wenn agent_type mit "ai-vendor-assessment:" beginnt. Alle anderen Aufrufe laufen unverändert durch.
// Im Zweifel wird blockiert (fail closed).

import fs from "node:fs";
import path from "node:path";
import dns from "node:dns/promises";
import net from "node:net";

const PRAEFIX = "ai-vendor-assessment:";
const WEB_AGENTS = new Set(["rechercheur", "pruefer", "pruefer-aktualitaet"]);
// Agents, die nur Vendor-Dateien sehen dürfen, nie AI-Act- oder Gesamt-Dateien (Datenminimierung, S02).
const NUR_VENDOR = new Set(["rechercheur", "pruefer"]);

// Die einzigen zwei Abrufe der Aktualitätsprüfung (S03). Muss mit agents/pruefer-aktualitaet.md übereinstimmen.
const AKTUALITAET_URLS = new Set([
  "https://publications.europa.eu/webapi/rdf/sparql?query=PREFIX+cdm%3A+%3Chttp%3A%2F%2Fpublications.europa.eu%2Fontology%2Fcdm%23%3E+SELECT+DISTINCT+%3Fcelex+WHERE+%7B+%3Fw+cdm%3Aresource_legal_id_celex+%3Fcelex+.+FILTER%28STRSTARTS%28STR%28%3Fcelex%29%2C+%2202024R1689%22%29%29+%7D+ORDER+BY+DESC%28%3Fcelex%29&format=application%2Fsparql-results%2Bjson",
  "https://publications.europa.eu/webapi/rdf/sparql?query=PREFIX+cdm%3A+%3Chttp%3A%2F%2Fpublications.europa.eu%2Fontology%2Fcdm%23%3E+SELECT+DISTINCT+%3Fcelex+%3Fdatum+WHERE+%7B+%3Ft+cdm%3Aresource_legal_id_celex+%3Ftc+.+FILTER%28STR%28%3Ftc%29%3D%2232024R1689%22%29+%3Fact+cdm%3Aresource_legal_amends_resource_legal+%3Ft+.+%3Fact+cdm%3Aresource_legal_id_celex+%3Fcelex+.+OPTIONAL+%7B+%3Fact+cdm%3Awork_date_document+%3Fdatum+%7D+%7D+ORDER+BY+DESC%28%3Fdatum%29&format=application%2Fsparql-results%2Bjson",
]);

// Hostnamen, die auf interne Netze deuten.
const INTERNE_ENDUNGEN = [".localhost", ".local", ".internal", ".intranet", ".lan", ".home", ".home.arpa", ".corp", ".localdomain"];

const BROWSER = "mcp__plugin_ai-vendor-assessment_browser__";

class Sperre extends Error {}

function sperre(grund) {
  throw new Sperre(grund);
}

// Pfad ohne Symlinks auflösen. Existiert die Datei noch nicht, zählt der nächste vorhandene Elternordner.
function echterPfad(p) {
  let rest = [];
  let aktuell = path.resolve(p);
  for (;;) {
    try {
      return path.join(fs.realpathSync(aktuell), ...rest);
    } catch {
      const eltern = path.dirname(aktuell);
      if (eltern === aktuell) return path.resolve(p);
      rest.unshift(path.basename(aktuell));
      aktuell = eltern;
    }
  }
}

function liegtIn(pfad, ordner) {
  const rel = path.relative(ordner, pfad);
  return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel));
}

function istAiActOderGesamt(pfad, berichte) {
  return path
    .relative(berichte, pfad)
    .split(path.sep)
    .some((teil) => teil.startsWith("ai-act_") || teil.startsWith("gesamt_"));
}

function pruefeLesen(agent, datei, ctx) {
  if (typeof datei !== "string" || datei === "") sperre("Lesen ohne Pfad.");
  const p = echterPfad(datei);
  if (agent === "pruefer-aktualitaet") {
    if (!liegtIn(p, ctx.plugin)) sperre(`Lesen nur im Plugin-Ordner erlaubt: ${datei}`);
    return;
  }
  if (!liegtIn(p, ctx.plugin) && !liegtIn(p, ctx.berichte)) {
    sperre(`Lesen nur im Plugin-Ordner und in reports/ erlaubt: ${datei}`);
  }
  if (NUR_VENDOR.has(agent) && liegtIn(p, ctx.berichte) && istAiActOderGesamt(p, ctx.berichte)) {
    sperre(`AI-Act- und Gesamt-Dateien sind für ${agent} gesperrt (Datenminimierung): ${datei}`);
  }
}

function pruefeSchreiben(agent, datei, ctx) {
  if (typeof datei !== "string" || datei === "") sperre("Schreiben ohne Pfad.");
  const p = echterPfad(path.isAbsolute(datei) ? datei : path.join(ctx.projekt, datei));
  const arbeit = path.join(ctx.berichte, "_arbeit");
  if (WEB_AGENTS.has(agent)) {
    if (!liegtIn(p, arbeit) || p === arbeit) sperre(`Schreiben nur in reports/_arbeit/ erlaubt: ${datei}`);
  } else if (!liegtIn(p, ctx.berichte) || p === ctx.berichte) {
    sperre(`Schreiben nur in reports/ erlaubt: ${datei}`);
  }
  if (NUR_VENDOR.has(agent) && istAiActOderGesamt(p, ctx.berichte)) {
    sperre(`AI-Act- und Gesamt-Dateien sind für ${agent} gesperrt: ${datei}`);
  }
  return p;
}

function istOeffentlicheIPv4(ip) {
  const [a, b, c] = ip.split(".").map(Number);
  if (a === 0 || a === 10 || a === 127 || a >= 224) return false;
  if (a === 100 && b >= 64 && b <= 127) return false;
  if (a === 169 && b === 254) return false;
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 192 && b === 168) return false;
  if (a === 192 && b === 0 && (c === 0 || c === 2)) return false;
  if (a === 198 && (b === 18 || b === 19)) return false;
  if (a === 198 && b === 51 && c === 100) return false;
  if (a === 203 && b === 0 && c === 113) return false;
  return true;
}

function istOeffentlicheIP(ip) {
  if (net.isIPv4(ip)) return istOeffentlicheIPv4(ip);
  const klein = ip.toLowerCase();
  const gemappt = klein.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (gemappt) return istOeffentlicheIPv4(gemappt[1]);
  // Nur globale Unicast-Adressen (2000::/3), ohne Dokumentationsbereich.
  if (!/^[23]/.test(klein)) return false;
  if (klein.startsWith("2001:db8:") || klein.startsWith("2001:0db8:")) return false;
  return true;
}

async function pruefeUrl(agent, url, ctx) {
  if (typeof url !== "string" || url === "") sperre("Abruf ohne URL.");
  if (agent === "pruefer-aktualitaet") {
    if (!AKTUALITAET_URLS.has(url)) sperre("Die Aktualitätsprüfung darf nur die zwei festen Abfrage-URLs abrufen.");
    return;
  }
  // Prüfung, ob der Browser läuft (rechercheur.md, Vorab).
  if (url === "about:blank" && ctx.werkzeug === `${BROWSER}browser_navigate`) return;
  let u;
  try {
    u = new URL(url);
  } catch {
    sperre(`Keine gültige URL: ${url}`);
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") sperre(`Nur http und https erlaubt: ${url}`);
  if (u.username || u.password) sperre("URLs mit Zugangsdaten sind gesperrt.");
  if (u.port !== "" && u.port !== "80" && u.port !== "443") sperre(`Nur Standard-Ports erlaubt: ${url}`);
  const host = u.hostname.replace(/^\[|\]$/g, "").toLowerCase().replace(/\.$/, "");
  if (net.isIP(host)) sperre(`IP-Adressen statt Hostnamen sind gesperrt: ${url}`);
  if (!host.includes(".") || host === "localhost" || INTERNE_ENDUNGEN.some((e) => host.endsWith(e))) {
    sperre(`Interne Hostnamen sind gesperrt: ${host}`);
  }
  let adressen;
  try {
    adressen = await Promise.race([
      dns.lookup(host, { all: true }),
      new Promise((_, nein) => setTimeout(() => nein(new Error("Zeitüberschreitung")), 3000)),
    ]);
  } catch (e) {
    sperre(`Host nicht auflösbar (${e.message}): ${host}`);
  }
  if (adressen.length === 0) sperre(`Host nicht auflösbar: ${host}`);
  for (const { address } of adressen) {
    if (!istOeffentlicheIP(address)) sperre(`Host zeigt auf eine nicht öffentliche Adresse: ${host}`);
  }
}

async function pruefe(eingabe) {
  const agent = eingabe.agent_type.slice(PRAEFIX.length);
  const werkzeug = eingabe.tool_name;
  const input = eingabe.tool_input ?? {};
  const pluginRoh = process.env.CLAUDE_PLUGIN_ROOT;
  const projekt = process.env.CLAUDE_PROJECT_DIR || eingabe.cwd;
  if (!pluginRoh || !projekt) sperre("CLAUDE_PLUGIN_ROOT oder Projektordner unbekannt.");
  const ctx = {
    werkzeug,
    plugin: echterPfad(pluginRoh),
    projekt: echterPfad(projekt),
    berichte: echterPfad(path.join(projekt, "reports")),
  };

  switch (werkzeug) {
    case "Read":
      return pruefeLesen(agent, input.file_path, ctx);
    case "Write":
    case "Edit":
    case "MultiEdit":
    case "NotebookEdit":
      return void pruefeSchreiben(agent, input.file_path ?? input.notebook_path, ctx);
    case "WebFetch":
    case `${BROWSER}browser_navigate`:
      return pruefeUrl(agent, input.url, ctx);
    case `${BROWSER}browser_snapshot`:
    case `${BROWSER}browser_take_screenshot`:
      if (input.filename !== undefined) {
        const p = pruefeSchreiben(agent, input.filename, ctx);
        if (!liegtIn(p, path.join(ctx.berichte, "_arbeit"))) sperre("Browser-Dateien nur in reports/_arbeit/.");
      }
      return;
    default:
      return;
  }
}

function antworte(entscheidung, grund) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: entscheidung,
        permissionDecisionReason: grund,
      },
    }),
  );
}

let roh = "";
process.stdin.setEncoding("utf8");
for await (const teil of process.stdin) roh += teil;

let eingabe;
try {
  eingabe = JSON.parse(roh);
} catch {
  // Ohne lesbare Eingabe nur blockieren, wenn sie nach einem Plugin-Agent aussieht.
  if (roh.includes(`"${PRAEFIX}`)) {
    process.stderr.write("Schranke: Eingabe nicht lesbar, Aufruf blockiert.\n");
    process.exit(2);
  }
  process.exit(0);
}

if (typeof eingabe.agent_type !== "string" || !eingabe.agent_type.startsWith(PRAEFIX)) process.exit(0);

try {
  await pruefe(eingabe);
} catch (e) {
  const grund = e instanceof Sperre ? e.message : `interner Fehler (${e.message}), Aufruf vorsorglich blockiert`;
  antworte("deny", `Schranke des Plugins: ${grund}`);
  process.exit(0);
}
process.exit(0);
