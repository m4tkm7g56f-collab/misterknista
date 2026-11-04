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

function lauf(agent, tool_name, tool_input, env = {}) {
  const eingabe = { session_id: "t", cwd: projekt, hook_event_name: "PreToolUse", tool_name, tool_input };
  if (agent) eingabe.agent_type = agent;
  const r = spawnSync("sh", [path.join(plugin, "hooks/schranke.sh")], {
    input: JSON.stringify(eingabe),
    env: { ...process.env, CLAUDE_PLUGIN_ROOT: plugin, CLAUDE_PROJECT_DIR: projekt, ...env },
    encoding: "utf8",
  });
  if (r.status === 2) return "deny";
  assert.equal(r.status, 0, r.stderr);
  if (r.stdout.trim() === "") return "durch";
  return JSON.parse(r.stdout).hookSpecificOutput.permissionDecision;
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
