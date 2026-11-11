---
name: vendor-assessment
description: Bewertet einen Software- oder Cloud-Anbieter anhand öffentlicher Quellen nach dem Ampel-Schema des Projekts (Zertifizierungen, Hosting, Subprozessoren, AVV, Authentifizierung, Incidents, Verschlüsselung, Schwachstellenmanagement, Notfallvorsorge, KI-Datennutzung) und erstellt einen geprüften, auditfesten Report mit Quellen inline. Arbeitet mit den Subagents rechercheur, bewerter und pruefer.
argument-hint: <anbieter-url> [normal|hoch|sehr_hoch] ["Anwendungsfall"] ["Tarif"]
arguments: [url, schutzbedarf, anwendungsfall, tarif]
disable-model-invocation: true
allowed-tools: Read
---

# Vendor-Security-Assessment

Eingaben:

- Anbieter-URL: $url
- Schutzbedarf: $schutzbedarf
- Anwendungsfall: $anwendungsfall
- Tarif: $tarif

Leere Eingaben gelten als „nicht angegeben“.

## Grundregeln

1. **Nur öffentlich zugängliche Quellen.** Keine Logins, keine Zugangsdaten, keine Zugangsformulare, keine Challenges oder CAPTCHAs, robots.txt wird beachtet. Wehrt eine Seite nur das Abrufwerkzeug ab (HTTP 403 oder 429 ohne Challenge), ist ein Abruf per Browser erlaubt und wird gekennzeichnet. Die Einzelheiten stehen in `${CLAUDE_PLUGIN_ROOT}/skills/vendor-assessment/abrufregeln.md` und gelten für Rechercheur und Prüfer.
2. **Nichts erfinden, nichts raten.** Jede Aussage im Report braucht eine Quelle mit URL und Abrufdatum. Fehlt ein Beleg, lautet der Status `nicht belegt`. Plausibilität ersetzt keinen Beleg.
3. **Report-Stil:** sachlich, auditfest, keine Werbesprache. Quelle direkt bei der Aussage. Datumsformat DD.MM.YYYY.
4. **Datenminimierung:** Angaben zum Anwendungsfall und zum Schutzbedarf gelangen nicht in Suchanfragen.
5. **Keine Rechtsberatung.** Das Ergebnis ist eine Ersteinschätzung, kein Audit und kein Gutachten.

## Rollen

Dieser Skill führt die Arbeit nicht selbst aus, sondern beauftragt drei Subagents mit getrennten Rechten (Funktionstrennung):

| Subagent | Aufgabe | Webzugriff |
|---|---|---|
| `rechercheur` | Belege sammeln, Belegliste schreiben | ja |
| `bewerter` | nur aus der Belegliste bewerten, Report schreiben | nein |
| `pruefer` | Deckung jeder Aussage prüfen, tragende Quellen erneut abrufen | ja, nur Abruf |

Im Plugin tragen die Subagents den Präfix des Plugins, z. B. `ai-vendor-assessment:rechercheur`.

Der Hauptagent recherchiert und bewertet nicht selbst. Er übergibt Aufträge, wartet auf jedes Ergebnis, bevor er die nächste Phase startet, und gibt dem Rechercheur weder Anwendungsfall noch Schutzbedarf weiter (Datenminimierung).

## Ablauf

### 1. Vorbereitung

- Lies `${CLAUDE_PLUGIN_ROOT}/schema/criteria.yaml` (Abschnitt `schutzbedarf`).
- Fehlt die URL, frage danach und brich ab.
- **Tarif:** Ohne Angabe gilt der kleinste kostenpflichtige Business- bzw. Team-Tarif.
- **Dienstumfang:** Hat der Auftraggeber einen Dienstumfang mitgegeben (z. B. Modul und KI-Funktion), übernimm ihn. Sonst: das zur URL passende Hauptprodukt.
- **Schutzbedarf:**
  - angegeben → übernehmen, Herkunft „angegeben“.
  - nicht angegeben, aber Anwendungsfall beschrieben → mit der `einstufungshilfe` herleiten, Herkunft „hergeleitet“, zutreffende Fragen festhalten. Nicht beantwortbare Fragen gelten als nicht zutreffend und werden als offener Punkt vermerkt.
  - weder noch → `normal`, Herkunft „Default, keine Angabe“.
- **Browser:** Prüfe, ob das Werkzeug `mcp__plugin_ai-vendor-assessment_browser__browser_navigate` verfügbar ist (Werkzeugliste, sonst ToolSearch). Fehlt es, sage dem Auftraggeber vor dem Start: Ohne Browser sind Seiten, die per JavaScript laden oder das Abrufwerkzeug abwehren, nicht abrufbar, und das Ergebnis enthält dann deutlich mehr „nicht belegt“. Häufige Ursache ist fehlendes Node.js oder Google Chrome, siehe README. Frage, ob trotzdem gestartet werden soll. Bei Aufruf aus `/assessment` im Modus `test` nicht fragen, sondern weitermachen.
- **Lauf-ID:** `<anbieter-slug>_<YYYY-MM-DD>`. Existiert `${CLAUDE_PROJECT_DIR}/reports/<lauf-id>.md` bereits, hänge einen sprechenden Zusatz an. Arbeitsordner: `${CLAUDE_PROJECT_DIR}/reports/_arbeit/<lauf-id>/`.

### 2. Recherche

Beauftrage den Subagent `rechercheur` mit: Anbieter-URL, Dienstumfang, Tarif, Bewertungsdatum, Pfad `${CLAUDE_PROJECT_DIR}/reports/_arbeit/<lauf-id>/belege.md`. Keine Angaben zum Anwendungsfall oder Schutzbedarf.

### 3. Bewertung

Beauftrage den Subagent `bewerter` mit: Pfad der Belegliste, Schutzbedarf mit Herkunft und Herleitung, Anwendungsfall, Tarif, Bewertungsdatum, Zielpfad `${CLAUDE_PROJECT_DIR}/reports/<lauf-id>.md`. Falls der Auftraggeber (z. B. `/assessment`) eine zusätzliche Gesamtampel für einen anderen Schutzbedarf verlangt, gib das mit.

### 4. Prüfung mit Korrekturrunde

1. Beauftrage den Subagent `pruefer` mit: Pfad des Reports, Pfad der Belegliste, Runde 1, Zielpfad `${CLAUDE_PROJECT_DIR}/reports/_arbeit/<lauf-id>/pruefbericht-1.md`.
2. Enthält der Prüfbericht Befunde mit Handlungsbedarf (`teilweise gedeckt`, `nicht gedeckt`, `Belegstelle nicht gefunden`) oder Einträge unter „Hinweise zur Belegliste“:
   - Gibt es Hinweise zur Belegliste, beauftrage zuerst den `rechercheur` mit einer Nachrecherche: Pfad der Belegliste, Pfad des Prüfberichts, Bewertungsdatum. Er ergänzt oder korrigiert nur die genannten Belege.
   - Beauftrage den `bewerter` mit einer Korrekturrunde: zusätzlich Pfad des Prüfberichts.
   - Beauftrage den `pruefer` mit Runde 2, Zielpfad `pruefbericht-2.md`.
3. **Kipppunkt nach Runde 2:** Sieh in `pruefbericht-2.md` die Spalte „Kann Status ändern“ in beiden Tabellen (Befunde mit Handlungsbedarf, Hinweise zur Belegliste) an. Prüfe für jeden Eintrag mit `ja`, ob der dort genannte mögliche Status die Gesamtampel ändern würde. Wende dazu nur die Regeln aus `gesamtbewertung` in `criteria.yaml` auf die Statustabelle des Reports an (Kern oder ergänzend steht dort), ohne eigene fachliche Bewertung. Das gilt in beide Richtungen. Beispiele: Kernkriterium Gelb → Rot bei Gesamtampel Gelb ändert die Gesamtampel. Einziges rotes Kernkriterium Rot → Gelb bei Gesamtampel Rot ändert sie ebenfalls. Nennt ein Eintrag mehrere mögliche Status, zählt jeder.
   - Ändert mindestens ein Eintrag die Gesamtampel, folgt Runde 3, nur für die betroffenen Kriterien: Nachrecherche durch den `rechercheur` mit Pfad von `pruefbericht-2.md` und den betroffenen Kriterien (nur wenn es zu ihnen Hinweise zur Belegliste gibt), Korrekturrunde durch den `bewerter` mit Pfad von `pruefbericht-2.md` und den betroffenen Kriterien, `pruefer` mit Runde 3, den betroffenen Kriterien und Zielpfad `pruefbericht-3.md`.
   - Sonst keine weitere Runde. Nach Runde 3 nie eine weitere Runde.
4. **Stabilität:** Prüfe die letzte Runde wie in Schritt 3. Ändert danach noch ein Eintrag die Gesamtampel, gilt das Ergebnis als nicht stabil: Setze im Report direkt unter die Zeile „Gesamtampel“ die Zeile „⚠️ **Vorläufig:** …“ aus der Vorlage und fülle im Prüfvermerk den Block „Ergebnis nicht stabil“.
5. Ergänze am Ende des Reports, vor dem Haftungshinweis, den Abschnitt „Prüfvermerk“ genau im Format von `${CLAUDE_PLUGIN_ROOT}/schema/report-template.md` (feste Tabelle mit Runde 1 bis 3, verbliebene Befunde mit Handlungsbedarf, offene Hinweise zur Belegliste mit `ja`, Links auf die Prüfberichte). Nach einer Runde 3 gilt für die betroffenen Kriterien `pruefbericht-3.md`, für alle anderen weiter `pruefbericht-2.md`. Befunde und Hinweise wörtlich übernehmen, nicht umdeuten. Kommentare der Vorlage (`<!-- … -->`) nicht in den Report übernehmen.

### 5. Ausgabe im Chat

Gesamtampel mit Zählzusatz, ausschlaggebende Kriterien mit je einer verlinkten Hauptquelle, Anzahl „nicht belegt“, Ergebnis der Prüfung (Befunde der letzten Runde, ob Runde 3 lief, ob das Ergebnis stabil ist), Links auf Report, Belegliste und Prüfberichte, mit Pfaden relativ zum Projektordner.
