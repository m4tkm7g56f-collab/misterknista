# Review-Log

Befunde aus externen Prüfungen und wie mit ihnen umgegangen wurde. Jeder Befund wird vor der Übernahme gegen die Dateien geprüft. Die Spalte „Eigene Prüfung“ hält das Ergebnis fest.

Menschliche Reviewer werden ohne Namen geführt (R1, R2, …).

## Prüfungen

| Nr. | Datum | Prüfer | Art | Stand | Auftrag |
|---|---|---|---|---|---|
| P1 | 27.10.2026 | Codex (OpenAI), mit Lesezugriff auf das Repository | statisch: Dateien gelesen, Plugin nicht ausgeführt. Rechtsstichprobe gegen die konsolidierte Fassung über das Amt für Veröffentlichungen der EU | Commit `e7a8816` | [`pruefauftrag.md`](pruefauftrag.md) |

## Befunde aus P1

Schwere: kritisch / hoch / mittel / niedrig / Hinweis. „kritisch“ heißt: falsche Risikoklasse, falsche Ampel oder Sicherheitsproblem.

| ID | Prüffeld | Befund (Kurzfassung) | Schwere laut Prüfer | Eigene Prüfung | Schwere nach eigener Prüfung | Status |
|---|---|---|---|---|---|---|
| R01 | Rechtsgrundlage | Stichprobe von Art. 5 Abs. 1 Buchst. f, Art. 6 Abs. 3, Art. 25 bis 27, Art. 50, Art. 113 und Anhang III ohne Abweichung | Hinweis | Ergebnis einer Stichprobe durch ein einzelnes Modell, kein juristisches Review | Hinweis | zur Kenntnis |
| A01 | Fragebogen | Emotionserkennung wird nicht durchgängig auf biometrische Daten begrenzt (C7, D2.1, E3) | kritisch | Teilweise bestätigt. C7 begrenzt in der Hilfe auf Körpermerkmale und schließt Text aus. D2.1 und E3 haben keine solche Begrenzung | hoch | umgesetzt: C7, D2.1 und E3 nennen die biometrische Grundlage, neuer Testfall 11. Testlauf ausstehend |
| A02 | Fragebogen | Für „unklar“ bei D2 ist keine Wirkung festgelegt | hoch | Teilweise bestätigt. Allgemeine Regel und Klasse „Hochrisiko nicht ausgeschlossen“ decken den Fall ab, die Zuordnung bei D2 fehlte aber | mittel | erledigt |
| A03 | Soll-Werte | Fall 1 erwartet einen Rollenwechsel zum Anbieter, den die Beschreibung nicht belegt | hoch | Bestätigt. Widerspricht der eigenen Hilfe zu B3 („im Zweifel unklar“). Risikoklasse unberührt | mittel | erledigt |
| A04 | Soll-Werte | Fall 2 ist korrekt: Art. 50 Abs. 5 begründet keine eigene Pflicht des Betreibers. Fälle 4, 9, 10 vertretbar | Hinweis | Bestätigt den Soll-Wert. Ein Testlauf vom 27.10.2026 nannte Art. 50 Abs. 5 als Betreiberpflicht. Ob die Referenz das klarer fassen muss, ist an der Primärquelle zu prüfen | niedrig | offen |
| V01 | Vendor-Kriterien | AVV kann Grün werden, ohne dass die Pflichtinhalte nach Art. 28 Abs. 3 DSGVO belegt sind | kritisch | Bestätigt | hoch | offen |
| V02 | Vendor-Kriterien | Kein Kriterium für Verfügbarkeit, Notfallmanagement und Wiederherstellung | hoch | Bestätigt, fachliche Einschätzung | mittel | offen, Entscheidung des Maintainers |
| S01 | Sicherheit | Schutz gegen Prompt Injection nur als Anweisung, keine technische Begrenzung von Schreibpfaden und Abruf-URLs | hoch | Bestätigt, in der README bereits benannt. Lösungsweg: Hook im Plugin, der nach Subagent unterscheidet | hoch | offen |
| S02 | Sicherheit | Datenminimierung umgehbar: `assessment` gibt den aus dem Anwendungsfall abgeleiteten Dienstumfang an den Rechercheur | hoch | Bestätigt. Die README-Aussage, Angaben zum Anwendungsfall könnten nicht in Suchanfragen gelangen, war zu stark | mittel | README korrigiert, Skill offen |
| S03 | Sicherheit | Beschränkung der Aktualitätsprüfung auf zwei URLs nicht technisch erzwungen | mittel | Bestätigt, in der README benannt. Lösungsweg wie S01 | mittel | offen |
| K01 | Konsistenz | `soll.yaml` nennt Fragebogen 0.6, ausgeliefert wird 0.7 | mittel | Teilweise bestätigt. Das Feld war veraltet, das Auswertungsskript nutzt es nicht. Es zählt je Fall nach „seit“ und je Lauf nach der tatsächlichen Version | niedrig | erledigt |
| K02 | Konsistenz | Kopf des Fragebogens sagt „Testläufe ausstehend“ | niedrig | Bestätigt | niedrig | erledigt |
| D01 | Darstellung | Haftungshinweis ist klar | Hinweis | – | Hinweis | zur Kenntnis |
