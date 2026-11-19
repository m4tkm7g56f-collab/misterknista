// Tests für die Schranke (plugins/ai-vendor-assessment/hooks/schranke.mjs).
// Aufruf: node --test tests/schranke.test.mjs
// Die URL-Tests mit öffentlichen Hosts brauchen eine Internetverbindung (DNS).

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const plugin = path.join(repo, "plugins/ai-vendor-assessment");
const projekt = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "schranke-")));
fs.mkdirSync(path.join(projekt, "reports/_arbeit/anbieter_2026-11-03"), { recursive: true });
const B = "mcp__plugin_ai-vendor-assessment_browser__";

function lauf(agent, tool_name, tool_input, env = {}, nachher) {
  const eingabe = { session_id: "t", cwd: projekt, hook_event_name: "PreToolUse", tool_name, tool_input };
  if (nachher !== undefined) Object.assign(eingabe, { hook_event_name: "PostToolUse", tool_response: nachher });
  if (agent) eingabe.agent_type = agent;
  const r = spawnSync("sh", [path.join(plugin, "hooks/schranke.sh")], {
    input: JSON.stringify(eingabe),
    env: { ...process.env, CLAUDE_PLUGIN_ROOT: plugin, CLAUDE_PROJECT_DIR: projekt, ...env },
    encoding: "utf8",
  });
  if (r.status === 2) return "deny";
  assert.equal(r.status, 0, r.stderr);
  if (r.stdout.trim() === "") return "durch";
  const aus = JSON.parse(r.stdout).hookSpecificOutput;
  if (aus.hookEventName === "PostToolUse") return aus.updatedMCPToolOutput ? "ersetzt" : "durch";
  return aus.permissionDecision;
}

const R = "ai-vendor-assessment:rechercheur";
const P = "ai-vendor-assessment:pruefer";
const A = "ai-vendor-assessment:pruefer-aktualitaet";
const W = "ai-vendor-assessment:bewerter";
const arbeit = (d) => path.join(projekt, "reports/_arbeit", d);

test("Hauptagent und fremde Subagents bleiben unberührt", () => {
  assert.equal(lauf(undefined, "Read", { file_path: "/etc/passwd" }), "durch");
  assert.equal(lauf("Explore", "Write", { file_path: "/tmp/x.md" }), "durch");
  assert.equal(lauf(undefined, "WebFetch", { url: "http://127.0.0.1/" }), "durch");
});

test("Schreiben", () => {
  assert.equal(lauf(R, "Write", { file_path: arbeit("anbieter_2026-11-03/belege.md") }), "durch");
  assert.equal(lauf(R, "Write", { file_path: path.join(projekt, "reports/anbieter.md") }), "deny");
  assert.equal(lauf(R, "Write", { file_path: path.join(os.homedir(), ".zshrc") }), "deny");
  assert.equal(lauf(R, "Write", { file_path: arbeit("anbieter_2026-11-03/../../../.claude/settings.json") }), "deny");
  assert.equal(lauf(R, "Write", { file_path: arbeit("ai-act_fall_2026-11-03/x.md") }), "deny");
  assert.equal(lauf(W, "Write", { file_path: path.join(projekt, "reports/anbieter_2026-11-03.md") }), "durch");
  assert.equal(lauf(W, "Write", { file_path: path.join(projekt, "CLAUDE.md") }), "deny");
  assert.equal(lauf(W, "Edit", { file_path: path.join(projekt, "CLAUDE.md") }), "deny");
  assert.equal(lauf(A, "Write", { file_path: arbeit("ai-act_fall_2026-11-03/aktualitaet.md") }), "durch");
});

test("Schreiben über Symlink aus reports/ heraus", () => {
  const ziel = fs.mkdtempSync(path.join(os.tmpdir(), "draussen-"));
  fs.symlinkSync(ziel, arbeit("link"));
  assert.equal(lauf(R, "Write", { file_path: arbeit("link/belege.md") }), "deny");
});

test("Lesen", () => {
  assert.equal(lauf(R, "Read", { file_path: path.join(plugin, "skills/vendor-assessment/abrufregeln.md") }), "durch");
  assert.equal(lauf(R, "Read", { file_path: arbeit("anbieter_2026-11-03/belege.md") }), "durch");
  assert.equal(lauf(R, "Read", { file_path: path.join(os.homedir(), ".ssh/id_ed25519") }), "deny");
  assert.equal(lauf(R, "Read", { file_path: path.join(projekt, "reports/ai-act_fall_2026-11-03.md") }), "deny");
  assert.equal(lauf(R, "Read", { file_path: arbeit("ai-act_fall_2026-11-03/aktualitaet.md") }), "deny");
  assert.equal(lauf(P, "Read", { file_path: path.join(projekt, "reports/gesamt_anbieter_fall.md") }), "deny");
  assert.equal(lauf(P, "Read", { file_path: path.join(projekt, "reports/anbieter_2026-11-03.md") }), "durch");
  assert.equal(lauf(W, "Read", { file_path: path.join(projekt, ".env") }), "deny");
  assert.equal(lauf(A, "Read", { file_path: path.join(plugin, "references/eu-ai-act.md") }), "durch");
  assert.equal(lauf(A, "Read", { file_path: path.join(projekt, "reports/anbieter_2026-11-03.md") }), "deny");
});

test("Browser-Dateien", () => {
  assert.equal(lauf(R, `${B}browser_snapshot`, {}), "durch");
  assert.equal(lauf(R, `${B}browser_snapshot`, { filename: arbeit("anbieter_2026-11-03/snapshots/a.md") }), "durch");
  assert.equal(lauf(R, `${B}browser_snapshot`, { filename: "a.md" }), "deny");
  assert.equal(lauf(R, `${B}browser_snapshot`, { filename: "/tmp/a.md" }), "deny");
});

test("URLs für Rechercheur und Prüfer", () => {
  assert.equal(lauf(R, "WebFetch", { url: "https://example.com/trust", prompt: "x" }), "durch");
  assert.equal(lauf(P, `${B}browser_navigate`, { url: "https://example.com/" }), "durch");
  assert.equal(lauf(R, `${B}browser_navigate`, { url: "about:blank" }), "durch");
  for (const url of [
    "about:blank",
    "file:///etc/passwd",
    "http://localhost:3000/",
    "http://127.0.0.1/",
    "http://169.254.169.254/latest/meta-data/",
    "http://[::1]/",
    "http://192.168.178.1/",
    "http://fritz.box.local/",
    "http://intranet/",
    "https://example.com:8443/",
    "https://user:pw@example.com/",
    "https://gibt-es-nicht-schranke-test.invalid/",
  ]) {
    assert.equal(lauf(R, "WebFetch", { url, prompt: "x" }), "deny", url);
  }
});

test("Aktualitätsprüfung nur mit den zwei festen URLs aus der Agent-Datei", () => {
  const md = fs.readFileSync(path.join(plugin, "agents/pruefer-aktualitaet.md"), "utf8");
  const urls = [...md.matchAll(/`(https:\/\/publications\.europa\.eu\/webapi\/rdf\/sparql\?[^`]+)`/g)].map((m) => m[1]);
  assert.equal(urls.length, 2);
  for (const url of urls) assert.equal(lauf(A, "WebFetch", { url, prompt: "x" }), "durch");
  assert.equal(lauf(A, "WebFetch", { url: urls[0] + "&x=1", prompt: "x" }), "deny");
  assert.equal(lauf(A, "WebFetch", { url: "https://eur-lex.europa.eu/", prompt: "x" }), "deny");
});

test("Ohne Node.js blockiert der Wrapper nur Plugin-Agents", () => {
  const env = { PATH: "/usr/bin:/bin" };
  const ohneNode = spawnSync("sh", ["-c", "command -v node"], { env, encoding: "utf8" }).status !== 0;
  if (!ohneNode) return; // node liegt hier in /usr/bin, Test nicht aussagekräftig
  assert.equal(lauf(R, "Read", { file_path: path.join(plugin, "README.md") }, env), "deny");
  assert.equal(lauf(undefined, "Read", { file_path: "/etc/hosts" }, env), "durch");
});

test("Fehlende Umgebung blockiert", () => {
  assert.equal(lauf(R, "Read", { file_path: path.join(plugin, "x.md") }, { CLAUDE_PLUGIN_ROOT: "" }), "deny");
});

test("Nur freigegebene Browser-Werkzeuge", () => {
  for (const name of ["browser_navigate", "browser_snapshot", "browser_wait_for", "browser_close"]) {
    assert.equal(lauf(R, `${B}${name}`, name === "browser_navigate" ? { url: "https://example.com/" } : {}), "durch", name);
  }
  for (const name of ["browser_click", "browser_type", "browser_evaluate", "browser_run_code_unsafe", "browser_file_upload", "browser_tabs", "browser_neu_nach_update"]) {
    assert.equal(lauf(R, `${B}${name}`, {}), "deny", name);
  }
  assert.equal(lauf(W, `${B}browser_navigate`, { url: "https://example.com/" }), "deny");
  assert.equal(lauf(undefined, `${B}browser_click`, {}), "durch");
});

const seite = (url) => [{ type: "text", text: `### Ran Playwright code\n\`\`\`js\nawait page.goto('x');\n\`\`\`\n### Page\n- Page URL: ${url}\n- Page Title: T\n### Snapshot\n- [Snapshot](a.yml)` }];

test("Geladene Seite nach dem Abruf", () => {
  const nav = `${B}browser_navigate`;
  assert.equal(lauf(R, nav, { url: "https://example.com/" }, {}, seite("https://example.com/")), "durch");
  assert.equal(lauf(R, nav, { url: "about:blank" }, {}, seite("about:blank")), "durch");
  assert.equal(lauf(R, nav, { url: "https://example.com/" }, {}, seite("http://127.0.0.1/admin")), "ersetzt");
  assert.equal(lauf(P, nav, { url: "https://example.com/" }, {}, seite("http://169.254.169.254/latest/")), "ersetzt");
  assert.equal(lauf(R, nav, { url: "https://example.com/" }, {}, seite("file:///etc/passwd")), "ersetzt");
  assert.equal(lauf(R, nav, { url: "https://example.com/" }, {}, "### Page\n- Page URL: http://intranet/\n"), "ersetzt");
  // Seiteninhalt ohne erkennbare URL: zurückhalten. Reine Fehlermeldung: durchlassen.
  assert.equal(lauf(R, nav, { url: "https://example.com/" }, {}, [{ type: "text", text: "### Snapshot\n- x" }]), "ersetzt");
  assert.equal(lauf(R, nav, { url: "https://example.com/" }, {}, [{ type: "text", text: "Error: net::ERR_NAME_NOT_RESOLVED" }]), "durch");
  assert.equal(lauf(undefined, nav, { url: "https://example.com/" }, {}, seite("http://127.0.0.1/")), "durch");
});

test("Gesperrter Snapshot wird gelöscht", () => {
  const datei = arbeit("anbieter_2026-11-03/snapshots/intern.yml");
  fs.mkdirSync(path.dirname(datei), { recursive: true });
  fs.writeFileSync(datei, "geheim");
  assert.equal(lauf(R, `${B}browser_snapshot`, { filename: datei }, {}, seite("http://10.0.0.5/")), "ersetzt");
  assert.equal(fs.existsSync(datei), false);
  const gut = arbeit("anbieter_2026-11-03/snapshots/ok.yml");
  fs.writeFileSync(gut, "ok");
  assert.equal(lauf(R, `${B}browser_snapshot`, { filename: gut }, {}, seite("https://example.com/")), "durch");
  assert.equal(fs.existsSync(gut), true);
});

test("Ausgabeordner des Browser-Servers", () => {
  const ablage = path.join(projekt, "reports/_arbeit/_browser");
  fs.mkdirSync(ablage, { recursive: true });
  const auto = path.join(ablage, "page-2026-11-06T07-32-20-496Z.yml");
  fs.writeFileSync(auto, "intern");
  assert.equal(lauf(R, "Read", { file_path: auto }), "deny");
  assert.equal(lauf(P, "Read", { file_path: auto }), "deny");
  assert.equal(lauf(R, "Write", { file_path: path.join(ablage, "x.md") }), "deny");
  const antwort = (url) => [{ type: "text", text: `### Page\n- Page URL: ${url}\n### Snapshot\n- [Snapshot](reports/_arbeit/_browser/page-2026-11-06T07-32-20-496Z.yml)` }];
  assert.equal(lauf(R, `${B}browser_navigate`, { url: "https://example.com/" }, {}, antwort("https://example.com/")), "durch");
  assert.equal(fs.existsSync(auto), true);
  assert.equal(lauf(R, `${B}browser_navigate`, { url: "https://example.com/" }, {}, antwort("http://10.1.2.3/")), "ersetzt");
  assert.equal(fs.existsSync(auto), false);
});

// --- Belegliste in der Nachrecherche (E17) ---

const KOPF = "| Nr. | Kriterium | Aussage (sachlich, ohne Bewertung) | Titel | URL | Abgerufen am | Belegstufe | Belegstelle (wörtlich) |\n|---|---|---|---|---|---|---|---|";
const zeile = (q, aussage, stelle = "We encrypt data at rest.") =>
  `| ${q} | VERS | ${aussage} | Security | https://example.com/security | 09.11.2026 | B | „${stelle}“ |`;
const liste = (...belege) =>
  `# Belegliste: Anbieter, Dienst\n\n## Belege\n\n${KOPF}\n${belege.join("\n")}\n\n## Nicht gefunden\n\n| Kriterium | Prüffrage | Gesucht in bzw. mit |\n|---|---|---|\n| HOST | Rechenzentrum | Website, Suche |\n`;

function laufMitGrund(agent, tool_name, tool_input) {
  const eingabe = { session_id: "t", cwd: projekt, hook_event_name: "PreToolUse", tool_name, tool_input, agent_type: agent };
  const r = spawnSync("sh", [path.join(plugin, "hooks/schranke.sh")], {
    input: JSON.stringify(eingabe),
    env: { ...process.env, CLAUDE_PLUGIN_ROOT: plugin, CLAUDE_PROJECT_DIR: projekt },
    encoding: "utf8",
  });
  if (r.stdout.trim() === "") return { entscheidung: "durch", grund: "" };
  const aus = JSON.parse(r.stdout).hookSpecificOutput;
  return { entscheidung: aus.permissionDecision, grund: aus.permissionDecisionReason };
}

function lauford(name, mitPruefbericht = true) {
  const ordner = arbeit(name);
  fs.mkdirSync(ordner, { recursive: true });
  const datei = path.join(ordner, "belege.md");
  fs.writeFileSync(datei, liste(zeile("Q1", "Daten verschlüsselt."), zeile("Q2", "TLS 1.2.")));
  if (mitPruefbericht) fs.writeFileSync(path.join(ordner, "pruefbericht-1.md"), "# Prüfbericht");
  return datei;
}

test("Belegliste: nur der Rechercheur schreibt sie", () => {
  const datei = lauford("nur-rechercheur", false);
  assert.equal(lauf(W, "Write", { file_path: datei, content: "x" }), "deny");
  assert.equal(lauf(P, "Write", { file_path: datei, content: "x" }), "deny");
  assert.equal(lauf(W, "Write", { file_path: path.join(path.dirname(datei), "notiz.md"), content: "x" }), "durch");
});

test("Belegliste: Erstrecherche darf frei überschreiben", () => {
  const datei = lauford("erstrecherche", false);
  assert.equal(lauf(R, "Write", { file_path: datei, content: liste(zeile("Q1", "Ganz anders.")) }), "durch");
});

test("Belegliste: Nachrecherche mit unveränderten Zeilen und neuen Belegen", () => {
  const datei = lauford("nachrecherche-ok");
  const neu = liste(
    zeile("Q1", "Daten verschlüsselt. korrigiert durch Q3"),
    zeile("Q2", "TLS 1.2."),
    zeile("Q3", "Daten mit AES-256 verschlüsselt."),
  ) + "\n## Nachrecherche\n\n| Hinweis | Ergebnis |\n|---|---|\n| 1 | Q3 |\n";
  assert.equal(lauf(R, "Write", { file_path: datei, content: neu }), "durch");
  // Andere Spaltenausrichtung und Leerraum zählen nicht.
  const breit = liste(zeile("Q1", "Daten   verschlüsselt."), zeile("Q2", "TLS 1.2.")).replace("| Q2 |", "|   Q2   |");
  assert.equal(lauf(R, "Write", { file_path: datei, content: breit }), "durch");
  // Formen aus bisherigen Läufen: Klammer, Begründung, Vermerk in die schließende Klammer gezogen.
  for (const [vorher, nachher] of [
    ["Daten verschlüsselt.", "Daten verschlüsselt. (korrigiert durch Q3)"],
    ["Daten verschlüsselt.", "Daten verschlüsselt (fehlerhaft, korrigiert durch Q3: AES-256)"],
    ["Daten verschlüsselt.", "Daten verschlüsselt; korrigiert durch Q3 und Q4 (eigene URL)."],
  ]) {
    fs.writeFileSync(datei, liste(zeile("Q1", vorher), zeile("Q2", "TLS 1.2.")));
    assert.equal(lauf(R, "Write", { file_path: datei, content: liste(zeile("Q1", nachher), zeile("Q2", "TLS 1.2."), zeile("Q3", "Neu.")) }), "durch", nachher);
  }
  fs.writeFileSync(datei, liste(zeile("Q1", "TOM (zehn Positionen)"), zeile("Q2", "TLS 1.2.")));
  assert.equal(lauf(R, "Write", { file_path: datei, content: liste(zeile("Q1", "TOM (zehn Positionen; korrigiert durch Q3: 17 Positionen)"), zeile("Q2", "TLS 1.2.")) }), "durch");
});

test("Belegliste: Nachrecherche sperrt Änderungen an bisherigen Zeilen", () => {
  const datei = lauford("nachrecherche-sperre");
  let r = laufMitGrund(R, "Write", { file_path: datei, content: liste(zeile("Q1", "Daten verschlüsselt.", "We encrypt all data."), zeile("Q2", "TLS 1.2.")) });
  assert.equal(r.entscheidung, "deny");
  assert.match(r.grund, /Q1: Spalte „Belegstelle“ geändert/);
  r = laufMitGrund(R, "Write", { file_path: datei, content: liste(zeile("Q1", "Daten verschlüsselt.")) });
  assert.equal(r.entscheidung, "deny");
  assert.match(r.grund, /Q2 fehlt/);
  r = laufMitGrund(R, "Write", { file_path: datei, content: liste(zeile("Q1", "Daten verschlüsselt, auch Backups."), zeile("Q2", "TLS 1.2.")) });
  assert.equal(r.entscheidung, "deny");
  assert.match(r.grund, /Q1: Spalte „Aussage“ geändert/);
  // Zusatz ohne Q-Nummer oder Text verändert und Vermerk nur angehängt: gesperrt.
  r = laufMitGrund(R, "Write", { file_path: datei, content: liste(zeile("Q1", "Daten verschlüsselt. korrigiert durch die nächste Zeile"), zeile("Q2", "TLS 1.2.")) });
  assert.equal(r.entscheidung, "deny");
  r = laufMitGrund(R, "Write", { file_path: datei, content: liste(zeile("Q1", "Daten teils verschlüsselt. korrigiert durch Q3"), zeile("Q2", "TLS 1.2.")) });
  assert.equal(r.entscheidung, "deny");
  r = laufMitGrund(R, "Write", { file_path: datei, content: liste(zeile("Q1", "Daten verschlüsselt."), zeile("Q2", "TLS 1.2."), zeile("Q2", "Doppelt.")) });
  assert.equal(r.entscheidung, "deny");
  assert.match(r.grund, /Q2 kommt mehrfach vor/);
  const ohneNichtGefunden = liste(zeile("Q1", "Daten verschlüsselt."), zeile("Q2", "TLS 1.2.")).replace("| HOST | Rechenzentrum | Website, Suche |\n", "");
  r = laufMitGrund(R, "Write", { file_path: datei, content: ohneNichtGefunden });
  assert.equal(r.entscheidung, "deny");
  assert.match(r.grund, /Zeile fehlt oder wurde geändert: \| HOST/);
  assert.equal(lauf(R, "Edit", { file_path: datei, old_string: "TLS", new_string: "SSL" }), "deny");
  assert.equal(lauf(R, "Write", { file_path: datei }), "deny");
});
