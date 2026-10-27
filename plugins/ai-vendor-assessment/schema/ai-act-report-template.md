# EU-AI-Act-Ersteinschätzung: {{kurzname_anwendungsfall}}

| Feld | Wert |
|---|---|
| Anwendungsfall | {{kurzname_anwendungsfall}} |
| Bewertungsdatum | {{DD.MM.YYYY}} |
| Fragebogen-Version | {{fragebogen_version}} |
| Rechtsstand der Referenz | {{referenz_stand}}, konsolidierte Fassung CELEX {{celex_konsolidiert}} |
| Aktualität der Referenz | {{aktuell: „geprüft am DD.MM.YYYY: keine neuere konsolidierte Fassung, kein neuer Änderungsrechtsakt“ / veraltet: „geprüft am DD.MM.YYYY: neuere Fassung bzw. neuer Änderungsrechtsakt CELEX …“ / nicht geprüft: „nicht geprüft (Grund), Referenz n Monate alt“}} |
| Modus | {{Dialog / Test}} |
| Methode | Fragebogen nach `schema/ai-act-fragebogen.yaml`, Rechtsinhalte ausschließlich aus `references/eu-ai-act.md` |

## Ergebnis

<!-- Nur bei Aktualität „veraltet“ oder bei „nicht geprüft“ mit einer Referenz älter als 3 Monate, sonst weglassen -->
**Hinweis Rechtsstand:** {{Die Referenz ist veraltet: CELEX … ist seit … veröffentlicht. / Die Aktualität der Referenz konnte nicht geprüft werden, sie ist n Monate alt.}} Änderungen danach sind in dieser Einschätzung nicht berücksichtigt. Sicherheit deshalb höchstens „vorläufig“.

**{{Kopfzeile nach format_kopfzeile}}**

{{Zusammenfassung in zwei bis drei Sätzen Alltagssprache: Was bedeutet das Ergebnis, was ist als Nächstes zu tun?}}

| Ebene | Ergebnis |
|---|---|
| Risikoklasse des Systems | {{höchste zutreffende Klasse}} ({{Fundstelle}}) |
| Weitere zutreffende Klassen | {{z. B. Transparenzpflichten oder „keine“}} |
| Rolle(n) der Organisation | {{Anbieter / Betreiber / Anbieter durch Rollenwechsel / GPAI-Modellanbieter}} |
| Eigene Pflichten der Organisation | {{Kurzliste mit gilt seit/ab, z. B. „KI-Kompetenz (seit 02.02.2025)“}} |
| Pflichten anderer Akteure | {{z. B. „Kennzeichnung synthetischer Inhalte durch den Anbieter (Art. 50 Abs. 2)“ oder „keine“}} |
| Sicherheit | {{bestätigt / vorläufig / offen}}, {{n}} tragende und {{k}} ausschließende Annahmen. Begründung: {{tragende Annahmen und unklare entscheidende Antworten}} |
| Dringlichkeit | {{bereits geltende Pflichten zuerst, dann künftige mit Datum}} |

## Prüfvorbehalte

<!-- Nur wenn vorhanden, sonst „Keine“ -->

| Fundstelle | Vorbehalt | Gilt seit | Klärungsauftrag |
|---|---|---|---|
| {{Art. 5 Abs. 1 Buchst. x}} | Verbot nicht ausgeschlossen | 02.02.2025 | {{wer klärt was}} |

## Pflichten

### Eigene Pflichten der Organisation

| Pflicht | Fundstelle | Für Rolle | Gilt seit / ab |
|---|---|---|---|
| Maßnahmen zur KI-Kompetenz des Personals | Art. 4 Abs. 1 | Anbieter und Betreiber | seit 02.02.2025 |
| {{Pflicht}} | {{Fundstelle}} | {{Rolle}} | {{seit/ab DD.MM.YYYY}} |

### Pflichten anderer Akteure

<!-- Pflichten, die das System betreffen, aber nicht die Organisation in ihrer Rolle, z. B. Anbieterpflichten bei Rolle Betreiber. Sonst „Keine“. -->

| Pflicht | Fundstelle | Trifft | Gilt seit / ab | Bedeutung für die Organisation |
|---|---|---|---|---|
| {{Pflicht}} | {{Fundstelle}} | {{z. B. Anbieter}} | {{seit/ab}} | {{z. B. „beim Anbieter nachfragen, ob umgesetzt“}} |

## Antworten im Einzelnen

<!-- Block je Fragenblock wiederholen. Nicht gestellte Fragen (übersprungen) mit Grund nennen. -->

### Block {{A bis F}}: {{Name}}

| Frage | Antwort | Zustand | Begründung bzw. Zitat aus der Beschreibung | Fundstelle |
|---|---|---|---|---|
| {{ID}} | {{ja / nein / unklar / übersprungen}} | {{bestätigt / angenommen / unklar}} | {{„Zitat“ oder Begründung}} | {{Art. …}} |

## Annahmen

Reihenfolge: tragende, dann ausschließende, dann nicht entscheidende Annahmen. Tragend = begründet die ermittelte Klasse. Ausschließend = schließt eine strengere Klasse aus.

| Frage | Angenommene Antwort | Wirkung | Grundlage in der Beschreibung |
|---|---|---|---|
| {{ID}} | {{ja / nein}} | {{tragend / ausschließend / nicht entscheidend}} | „{{wörtliches Zitat}}“ |

## Offene Punkte

| Nr. | Frage | Warum offen | Klärungsauftrag (wer, was) | Auswirkung bei Klärung |
|---|---|---|---|---|
| 1 | {{ID}} | {{Grund}} | {{z. B. Anbieter um Dokumentation nach Art. 6 Abs. 4 bitten}} | {{welche Klasse sich ändern könnte}} |

## Nicht geprüft

- Inhalte, die laut `references/eu-ai-act.md` Abschnitt 8 nicht ausgewertet sind, u. a. Anbieterpflichten im Detail (Art. 8 bis 22), Sanktionen, Leitlinien der Kommission, nationale Vorschriften.
- Datenschutz, Arbeitsrecht und weitere Rechtsgebiete.
- Aktualität: Die Aktualitätsprüfung erfasst nur konsolidierte Fassungen und Änderungsrechtsakte der Verordnung, keine Leitlinien der Kommission, Berichtigungen ohne neue konsolidierte Fassung, delegierten Rechtsakte, Normen oder nationalen Vorschriften.

## Prüfvermerk

<!-- Wird nach der Prüfung durch den Subagent pruefer-referenz vom Skill ergänzt. Format fest, damit evals/ die Prüfbefunde auswerten kann: Zeilen und Spalten nicht umbenennen, keine weiteren einfügen. Runde 2 = „–“, wenn keine Korrekturrunde nötig war. -->

Geprüft durch den Subagent `pruefer-referenz` gegen `references/eu-ai-act.md`, Stand {{DD.MM.YYYY}}. Maßgeblich ist die letzte Runde.

| Befund | Runde 1 | Runde 2 |
|---|---|---|
| gedeckt | {{n}} | {{n / –}} |
| teilweise gedeckt | {{n}} | {{n / –}} |
| nicht gedeckt | {{n}} | {{n / –}} |
| nicht ausgewertet | {{n}} | {{n / –}} |
| Summe | {{n}} | {{n / –}} |

**Verbliebene Befunde mit Handlungsbedarf (letzte Runde):**

{{Nummerierte Liste: Fundstelle, Abschnitt im Report, Befund, Begründung in einem Satz. Sonst „Keine“.}}

Prüfberichte: [Runde 1]({{reports/_arbeit/<lauf-id>/pruefbericht-1.md}}), [Runde 2]({{reports/_arbeit/<lauf-id>/pruefbericht-2.md}})

## Haftungshinweis

Diese Ersteinschätzung beruht auf den Angaben zum Anwendungsfall und einer datierten Referenz zum EU AI Act. Sie ist keine Rechtsberatung und ersetzt keine rechtliche Prüfung. Ändert sich der Anwendungsfall oder die Rechtslage, ist die Einschätzung zu wiederholen.
