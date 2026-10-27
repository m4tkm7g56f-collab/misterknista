---
name: assessment
description: Gesamtbewertung, ob ein Software- oder Cloud-Dienst für einen bestimmten KI-Anwendungsfall eingesetzt werden kann. Führt AI-Act-Ersteinschätzung und Vendor-Security-Assessment des Projekts zusammen und erstellt einen gemeinsamen Report mit Gesamtbild, Wechselwirkungen und priorisierten offenen Punkten.
argument-hint: '<anbieter-url> "Beschreibung des Anwendungsfalls" ["Tarif"] [dialog|test]'
arguments: [url, anwendungsfall, tarif, modus]
disable-model-invocation: true
allowed-tools: Read
---

# Gesamtbewertung: Anbieter und AI Act

Eingaben:

- Anbieter-URL: $url
- Anwendungsfall: $anwendungsfall
- Tarif: $tarif
- Modus: $modus (leer = `dialog`)

## Verbindliche Regeln

1. Es gelten alle Regeln der beiden Teil-Skills unverändert: `${CLAUDE_PLUGIN_ROOT}/skills/ai-act-check/SKILL.md` und `${CLAUDE_PLUGIN_ROOT}/skills/vendor-assessment/SKILL.md`.
2. **AI-Act-Einstufung ohne Web.** Die Einstufung erstellen die Subagents `ai-act-klassifizierer` und `pruefer-referenz`, die technisch keinen Webzugriff haben. Der Hauptagent ruft in Phase 2 ebenfalls keine Webseiten ab. Einzige Ausnahme ist die Aktualitätsprüfung durch `pruefer-aktualitaet` vor der Einstufung: zwei feste Abfragen, nur Metadaten, ohne Angaben zum Anwendungsfall.
3. **Reihenfolge einhalten.** Die AI-Act-Einstufung ist abgeschlossen, geprüft und gespeichert, bevor der Rechercheur beauftragt wird. Später gelesene Webinhalte ändern die AI-Act-Einstufung nicht.
4. **Subagent-Namen:** Im Plugin tragen die Subagents den Präfix des Plugins, z. B. `ai-vendor-assessment:pruefer-aktualitaet`.
5. **Keine Zusammenrechnung zu einem Punktwert.** Das Gesamtbild folgt allein den Regeln in `${CLAUDE_PLUGIN_ROOT}/schema/gesamtbild.yaml`.

## Ablauf

### 1. Vorbereitung

- Lies `${CLAUDE_PLUGIN_ROOT}/schema/gesamtbild.yaml` und `${CLAUDE_PLUGIN_ROOT}/schema/gesamt-report-template.md` vollständig.
- Lies beide Teil-Skills. Sie beschreiben die Abläufe der Phasen 2 und 4.
- Fehlen URL oder Anwendungsfall: Modus `dialog` → nachfragen. Modus `test` → abbrechen. Für nur einen der beiden Teile auf `/vendor-assessment` bzw. `/ai-act-check` verweisen.

### 2. AI-Act-Ersteinschätzung

- Führe den Ablauf aus `ai-act-check/SKILL.md` vollständig aus, mit Beschreibung = Anwendungsfall und dem angegebenen Modus.
- Speichere den AI-Act-Report wie dort beschrieben unter `${CLAUDE_PROJECT_DIR}/reports/ai-act_…`.
- Ergibt A1 „nein“: AI-Act-Teil endet mit dieser Feststellung (`gesamtbild.yaml/ueberspringen.ai_act_ohne_ki`).

### 3. Kopplung Schutzbedarf

- Bestimme den Schutzbedarf nach `gesamtbild.yaml/kopplung`: Herleitung bzw. Angabe nach `criteria.yaml/schutzbedarf/einstufungshilfe` aus dem Anwendungsfall, angehoben auf „hoch“ bei AI-Act-Risikoklasse „hochrisiko“.
- Halte beide Stufen und die Begründung fest.

### 4. Vendor-Assessment

- Entfällt bei AI-Act-Risikoklasse „verbotene Praktik“ (`ueberspringen.vendor_bei_verbot`). Dann weiter mit Phase 5.
- Sonst: Führe den Ablauf aus `vendor-assessment/SKILL.md` aus, mit URL, Tarif, Anwendungsfall und dem Schutzbedarf aus Phase 3 als angegebenem Schutzbedarf.
- Bestimme aus dem Anwendungsfall den zu bewertenden Dienst- und Funktionsumfang (z. B. Modul und KI-Funktion) und gib ihn als „Dienstumfang“ weiter. Den Text des Anwendungsfalls erhält der Rechercheur nicht.
- Bei AI-Act-Ergebnis „hochrisiko_nicht_ausgeschlossen“: Ermittle zusätzlich die Vendor-Gesamtampel für Schutzbedarf „hoch“ aus denselben Einzelbewertungen (keine neue Recherche).
- Speichere den Vendor-Report wie dort beschrieben unter `${CLAUDE_PROJECT_DIR}/reports/<anbieter-slug>_…`.

### 5. Synthese

1. **Gesamtbild:** Prüfe die Stufen aus `gesamtbild.stufen` von oben nach unten. Die erste zutreffende gilt. Nenne die auslösende Bedingung.
2. **Wechselwirkungen:** Prüfe jede Regel W1 bis W7 aus `wechselwirkungen` und führe jeden Treffer mit Folge auf.
3. **Offene Punkte:** Führe die offenen Punkte beider Reports und die Folgen der Wechselwirkungen zusammen. Entferne Dubletten. Sortiere nach `priorisierung_offene_punkte`.
4. **Nachfragen an den Anbieter:** Führe die Nachfragen aus dem Vendor-Report mit den anbieterbezogenen Klärungsaufträgen aus dem AI-Act-Report und den Wechselwirkungen zusammen.

### 6. Report

- Erstelle den Gesamtreport nach `gesamt-report-template.md`. Er verweist auf beide Detail-Reports, statt deren Inhalte zu wiederholen.
- Ergänze unter „Methodik“: Reihenfolge der Phasen, eingesetzte Subagents mit ihren Werkzeugrechten, Ergebnis der Prüfberichte beider Module und welche Phasen übersprungen wurden.
- Speichere ihn unter `${CLAUDE_PROJECT_DIR}/reports/gesamt_<anbieter-slug>_<kurzname-slug>_<YYYY-MM-DD>.md`.
- Gib im Chat aus: Gesamtbild mit auslösender Bedingung, AI-Act-Kopfzeile, Vendor-Gesamtampel, die drei wichtigsten offenen Punkte und Links auf alle drei Reports (Pfade relativ zum Projektordner).

## Selbstprüfung vor dem Speichern

- [ ] Der AI-Act-Report wurde gespeichert, bevor der Rechercheur beauftragt wurde.
- [ ] Der verwendete Schutzbedarf ist mit beiden Quellen begründet.
- [ ] Das Gesamtbild folgt der ersten zutreffenden Regel, die auslösende Bedingung ist genannt.
- [ ] Jede zutreffende Wechselwirkung ist aufgeführt.
- [ ] Offene Punkte sind priorisiert und ohne Dubletten.
- [ ] Beide Detail-Reports sind verlinkt oder als „nicht durchgeführt (Grund)“ ausgewiesen.
- [ ] Haftungshinweis vorhanden, einschließlich „Keine Hindernisse festgestellt ist keine Freigabe“.
