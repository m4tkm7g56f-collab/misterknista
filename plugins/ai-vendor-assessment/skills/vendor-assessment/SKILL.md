---
name: vendor-assessment
description: Bewertet einen Software- oder Cloud-Anbieter anhand öffentlicher Quellen nach dem Ampel-Schema des Projekts (Zertifizierungen, Hosting, Subprozessoren, AVV, Authentifizierung, Incidents, Verschlüsselung, Schwachstellenmanagement, KI-Datennutzung) und erstellt einen geprüften, auditfesten Report mit Quellen inline. Arbeitet mit den Subagents rechercheur, bewerter und pruefer.
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

1. **Nur öffentlich zugängliche Quellen.** Keine Logins, keine Zugangsdaten, kein Umgehen von Zugangsbeschränkungen oder Bot-Schutz.
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
- **Lauf-ID:** `<anbieter-slug>_<YYYY-MM-DD>`. Existiert `${CLAUDE_PROJECT_DIR}/reports/<lauf-id>.md` bereits, hänge einen sprechenden Zusatz an. Arbeitsordner: `${CLAUDE_PROJECT_DIR}/reports/_arbeit/<lauf-id>/`.

### 2. Recherche

Beauftrage den Subagent `rechercheur` mit: Anbieter-URL, Dienstumfang, Tarif, Bewertungsdatum, Pfad `${CLAUDE_PROJECT_DIR}/reports/_arbeit/<lauf-id>/belege.md`. Keine Angaben zum Anwendungsfall oder Schutzbedarf.

### 3. Bewertung

Beauftrage den Subagent `bewerter` mit: Pfad der Belegliste, Schutzbedarf mit Herkunft und Herleitung, Anwendungsfall, Tarif, Bewertungsdatum, Zielpfad `${CLAUDE_PROJECT_DIR}/reports/<lauf-id>.md`. Falls der Auftraggeber (z. B. `/assessment`) eine zusätzliche Gesamtampel für einen anderen Schutzbedarf verlangt, gib das mit.

### 4. Prüfung mit einer Korrekturrunde

1. Beauftrage den Subagent `pruefer` mit: Pfad des Reports, Pfad der Belegliste, Runde 1, Zielpfad `${CLAUDE_PROJECT_DIR}/reports/_arbeit/<lauf-id>/pruefbericht-1.md`.
2. Enthält der Prüfbericht Befunde mit Handlungsbedarf (`teilweise gedeckt`, `nicht gedeckt`, `Belegstelle nicht gefunden`):
   - Beauftrage den `bewerter` mit einer Korrekturrunde: zusätzlich Pfad des Prüfberichts.
   - Beauftrage den `pruefer` mit Runde 2, Zielpfad `pruefbericht-2.md`.
   - Keine weitere Runde.
3. Ergänze am Ende des Reports, vor dem Haftungshinweis, den Abschnitt „Prüfvermerk“ genau im Format von `${CLAUDE_PLUGIN_ROOT}/schema/report-template.md` (feste Tabelle mit Runde 1 und Runde 2, verbliebene Befunde mit Handlungsbedarf, Links auf die Prüfberichte). Befunde wörtlich übernehmen, nicht umdeuten. Kommentare der Vorlage (`<!-- … -->`) nicht in den Report übernehmen.

### 5. Ausgabe im Chat

Gesamtampel mit Zählzusatz, ausschlaggebende Kriterien mit je einer verlinkten Hauptquelle, Anzahl „nicht belegt“, Ergebnis der Prüfung (Befunde der letzten Runde), Links auf Report, Belegliste und Prüfberichte, mit Pfaden relativ zum Projektordner.
