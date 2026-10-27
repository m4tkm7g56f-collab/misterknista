---
name: ai-act-check
description: Ersteinschätzung eines KI-Anwendungsfalls nach dem EU AI Act. Führt durch den Fragebogen des Projekts (Anwendungsbereich, Rolle, Verbote, Hochrisiko, Transparenz, Betreiberpflichten) und erstellt einen geprüften Report mit Risikoklasse, Pflichten und offenen Punkten. Rechtsinhalte ausschließlich aus der datierten Referenzdatei. Arbeitet mit den Subagents ai-act-klassifizierer und pruefer-referenz.
argument-hint: '"Beschreibung des Anwendungsfalls" [dialog|test]'
arguments: [beschreibung, modus]
disable-model-invocation: true
allowed-tools: Read
disallowed-tools: WebSearch WebFetch
---

# EU-AI-Act-Ersteinschätzung

Eingaben:

- Beschreibung des Anwendungsfalls: $beschreibung
- Modus: $modus (leer = `dialog`)

## Rollen

| Subagent | Aufgabe | Webzugriff |
|---|---|---|
| `ai-act-klassifizierer` | Fragebogen auswerten, Report schreiben | nein (technisch) |
| `pruefer-referenz` | Deckung jeder rechtlichen Aussage durch die Referenz prüfen | nein (technisch) |

Der Hauptagent stuft nicht selbst ein. Er führt den Dialog mit dem Nutzer, beauftragt die Subagents und wartet auf jedes Ergebnis, bevor er die nächste Phase startet. Websuche und Webabruf sind für diesen Skill zusätzlich gesperrt.

## Ablauf

### 1. Vorbereitung

- Lies `${CLAUDE_PROJECT_DIR}/schema/ai-act-fragebogen.yaml` (für Leitfragen, Hilfen und Beispiele im Dialog).
- Ist die Beschreibung leer: Modus `dialog` → zeige die `leitfragen` und bitte um eine Beschreibung. Modus `test` → abbrechen.
- **Lauf-ID:** `ai-act_<kurzname-slug>_<YYYY-MM-DD>`, bei vorhandener Datei mit sprechendem Zusatz. Arbeitsordner: `reports/_arbeit/<lauf-id>/`.

### 2. Einstufung

Beauftrage den Subagent `ai-act-klassifizierer` mit: Beschreibung (wörtlich), Modus, Bewertungsdatum, Zielpfad `reports/<lauf-id>.md`.

### 3. Dialog (nur Modus `dialog`)

- Lies den Report. Lege dem Nutzer die tragenden Annahmen als kurze Liste vor (Frage, angenommene Antwort, Zitat) und frage, ob sie stimmen.
- Stelle die unklaren Fragen mit `AskUserQuestion`, höchstens 4 je Aufruf, Optionen `ja`, `nein`, `unklar`. In die Frage kommt die `hilfe`, in die Optionsbeschreibungen das Ja- bzw. Nein-Beispiel aus dem Fragebogen. Freitext-Antworten einer Option zuordnen, sonst `unklar`.
- Hat der Nutzer etwas bestätigt oder korrigiert: Beauftrage den `ai-act-klassifizierer` erneut mit derselben Beschreibung und der Liste `Frage-ID: Antwort` als bestätigte Antworten. Er überschreibt den Report. Ergeben sich daraus neue unklare Fragen, höchstens eine weitere Dialogrunde.

### 4. Prüfung mit einer Korrekturrunde

1. Beauftrage den Subagent `pruefer-referenz` mit: Pfad des Reports, Runde 1, Zielpfad `reports/_arbeit/<lauf-id>/pruefbericht-1.md`.
2. Bei Befunden mit Handlungsbedarf (`teilweise gedeckt`, `nicht gedeckt`, `nicht ausgewertet`): Korrekturrunde durch den `ai-act-klassifizierer` mit dem Prüfbericht und denselben bestätigten Antworten, dann `pruefer-referenz` Runde 2 (`pruefbericht-2.md`). Keine weitere Runde.
3. Ergänze am Ende des Reports, vor dem Haftungshinweis, den Abschnitt „Prüfvermerk“ genau im Format von `schema/ai-act-report-template.md` (feste Tabelle mit Runde 1 und Runde 2, verbliebene Befunde, Links auf die Prüfberichte).

### 5. Ausgabe im Chat

Kopfzeile, Zusammenfassung in Alltagssprache, Prüfvorbehalte (falls vorhanden), Ergebnis der Prüfung und Links auf Report und Prüfberichte, mit Pfaden relativ zum Projektordner.
