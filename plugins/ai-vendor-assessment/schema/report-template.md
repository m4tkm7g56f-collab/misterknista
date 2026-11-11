# Vendor-Security-Assessment: {{anbieter_name}}

| Feld | Wert |
|---|---|
| Anbieter | {{anbieter_name}} |
| Bewerteter Dienst und Tarif | {{dienst}} |
| Einstiegs-URL | {{url}} |
| Bewertungsdatum | {{datum}} |
| Schema-Version | {{schema_version}} |
| Anwendungsfall | {{kurzbeschreibung oder „nicht angegeben“}} |
| Schutzbedarf | {{normal / hoch / sehr hoch}} ({{„angegeben“ / „hergeleitet“ / „Default, keine Angabe“}}) |
| Methode | Automatisierte Recherche öffentlicher Quellen, keine Anbieterbefragung |

## Gesamtergebnis

**Gesamtampel:** {{gesamtstatus}} ({{x}} von {{y}} Kernkriterien mit Einschränkung)

{{Nur falls das Ergebnis nicht stabil ist (vom Skill nach der Prüfung gesetzt): ⚠️ **Vorläufig:** Nach der letzten Prüfrunde ist offen, ob <Kriterium> <Status> bleibt oder <möglicher Status> wird. Dann wäre die Gesamtampel <mögliche Gesamtampel>. Siehe Prüfvermerk. Sonst Zeile weglassen.}}

{{Nur falls zutreffend: ⚠️ **Aussagekraft eingeschränkt:** Grund, z. B. „kein Browser verfügbar, N Quellen nicht abrufbar“. Sonst Zeile weglassen.}}

**Ausschlaggebend:** {{Kriterien und Regel, die die Gesamtampel bestimmen}}

**Herleitung Schutzbedarf:** {{zutreffende Fragen der Einstufungshilfe oder „keine Angabe, Default normal“}}

Status mit Belegstufe in Klammern: A = Primärnachweis, B = Selbstauskunft des Anbieters, C = Drittquelle.
„Kategorie“ und „Im Gesamturteil“ gelten für den oben genannten Schutzbedarf. Der Status ist davon unabhängig.

| ID | Kriterium | Kategorie | Status | Im Gesamturteil | Kernaussage |
|---|---|---|---|---|---|
| ZERT | Zertifizierungen und Attestierungen | {{kategorie}} | {{status (stufe)}} | {{wertung}} | {{kernaussage}} |
| HOST | Hosting und Datenresidenz | {{kategorie}} | {{status (stufe)}} | {{wertung}} | {{kernaussage}} |
| AVV | Auftragsverarbeitungsvertrag | {{kategorie}} | {{status (stufe)}} | {{wertung}} | {{kernaussage}} |
| AUTH | Authentifizierung und Zugriffskontrolle | {{kategorie}} | {{status (stufe)}} | {{wertung}} | {{kernaussage}} |
| KIDAT | Nutzung von Kundendaten durch KI-Funktionen | {{kategorie}} | {{status (stufe)}} | {{wertung}} | {{kernaussage}} |
| SUBP | Subprozessoren | {{kategorie}} | {{status (stufe)}} | {{wertung}} | {{kernaussage}} |
| INC | Incident-Historie und Schwachstellen | {{kategorie}} | {{status (stufe)}} | {{wertung}} | {{kernaussage}} |
| KRYPT | Verschlüsselung | {{kategorie}} | {{status (stufe)}} | {{wertung}} | {{kernaussage}} |
| VULN | Sicherheitstests und Schwachstellenmanagement | {{kategorie}} | {{status (stufe)}} | {{wertung}} | {{kernaussage}} |
| BCM | Verfügbarkeit, Datensicherung und Notfallvorsorge | {{kategorie}} | {{status (stufe)}} | {{wertung}} | {{kernaussage}} |

## Einzelbewertung

<!-- Block je Kriterium wiederholen. Optionale Felder weglassen, wenn leer. -->

### {{id}}: {{kriterium}}

**Status:** {{status (stufe)}}

**Befund:** {{sachliche Feststellung, jede Aussage mit Quelle inline im Format ([Titel](URL), Qn, X), z. B. ([Data Processing Addendum](https://example.com/dpa), Q16, A)}}

**Begründung der Einstufung:** {{Bezug auf die Ampel-Definition im Schema, ggf. gleichwertiger oder kompensierender Nachweis}}

**Abweichung von Regel:** {{optional: Regelstatus, vergebener Status, Begründung}}

**Praxiseinordnung:** {{optional: Einordnung des Befunds, ohne Einfluss auf den Status}}

**Wirkung im Gesamturteil:** {{optional, nur wenn abweichend vom Status: nicht erfüllte Zusatzanforderung oder unberücksichtigte Aufwertung}}

**Offene Punkte:** {{was nicht belegt werden konnte}}

## Offene Punkte und Nachfragen an den Anbieter

1. {{Kriterium-ID}}: {{konkrete Nachfrage}}

## Methodik und Grenzen

- Grundlage sind ausschließlich öffentlich zugängliche Quellen zum Bewertungsdatum.
- Browser: {{verfügbar / nicht verfügbar laut Belegliste, mit Grund}}.
- Abruf per Browser, nachdem die Seite das Abrufwerkzeug abgewehrt hatte (HTTP 403 oder 429, ohne Challenge): {{Domains mit Q-Nummern laut Belegliste, sonst „keiner“}}.
- Status „Nicht belegt“ bedeutet: keine Quelle gefunden. Er trifft keine Aussage über Erfüllung oder Mangel.
- Abweichungen von der Regelbewertung sind auf eine Stufe begrenzt und einzeln begründet.
- Der Schutzbedarf beeinflusst nur das Gesamturteil. Für einen anderen Anwendungsfall kann das Gesamturteil bei identischen Einzelbefunden abweichen.
- Keine Prüfung vor Ort, keine Einsicht in vertrauliche Unterlagen, keine Anbieterbefragung.

## Quellenverzeichnis

Jede Q-Nummer steht für genau eine Belegstelle. Mehrere Belegstellen derselben Seite erhalten eigene Q-Nummern.

| Nr. | Quelle | Abgerufen am | Belegstufe | Belegstelle |
|---|---|---|---|---|
| Q1 | [{{titel}}]({{url}}) | {{DD.MM.YYYY}} | {{A/B/C}} | {{wörtliches Zitat, höchstens zwei Sätze}} |

## Suchprotokoll Incident-Historie und Schwachstellen

Betrachtungszeitraum: {{DD.MM.YYYY}} bis {{DD.MM.YYYY}}

| Stufe | Suchanfrage bzw. Quelle | Datum | Relevante Treffer |
|---|---|---|---|
| Anbieter | {{Advisory-, Blog- bzw. Status-URL}} | {{DD.MM.YYYY}} | {{keine / Verweis auf Qn}} |
| Behörden | [CISA KEV]({{Such-URL}}) | {{DD.MM.YYYY}} | {{keine / Verweis auf Qn}} |
| NVD | [NVD-Suche]({{API- bzw. Such-URL}}) | {{DD.MM.YYYY}} | {{Anzahl Treffer, davon dem Anbieter zuzuordnen, Verweis auf Qn}} |
| Presse | {{Suchanfrage}} | {{DD.MM.YYYY}} | {{keine / Verweis auf Qn}} |

## Prüfvermerk

<!-- Wird nach der Prüfung durch den Subagent pruefer vom Skill ergänzt. Format fest, damit evals/ die Prüfbefunde auswerten kann: Zeilen und Spalten nicht umbenennen, keine weiteren einfügen. Runde 2 = „–“, wenn keine Korrekturrunde nötig war, Runde 3 = „–“, wenn kein Kipppunkt nach Runde 2 bestand. Runde 3 prüft nur die betroffenen Kriterien, ihre Zahlen beziehen sich nur auf diese. „Letzte Runde“ heißt je Kriterium: Runde 3 für die betroffenen Kriterien, sonst Runde 2. -->

Geprüft am {{DD.MM.YYYY}} durch den Subagent `pruefer` gegen die Belegliste und erneut abgerufene Quellen. Maßgeblich ist die letzte Runde.

| Befund | Runde 1 | Runde 2 | Runde 3 |
|---|---|---|---|
| gedeckt | {{n}} | {{n / –}} | {{n / –}} |
| teilweise gedeckt | {{n}} | {{n / –}} | {{n / –}} |
| nicht gedeckt | {{n}} | {{n / –}} | {{n / –}} |
| Belegstelle nicht gefunden | {{n}} | {{n / –}} | {{n / –}} |
| nicht erreichbar | {{n}} | {{n / –}} | {{n / –}} |
| Summe | {{n}} | {{n / –}} | {{n / –}} |

Erneut abgerufen: {{n}} tragende Q-Nummern (Runde 1), {{n / –}} (Runde 2), {{n / –}} (Runde 3).

Runde 3: {{„nicht nötig“ oder „für <Kriterien>, weil <Eintrag> die Gesamtampel ändern konnte“}}

**Verbliebene Befunde mit Handlungsbedarf (letzte Runde):**

{{Nummerierte Liste: Kriterium, Q-Nummer, Befund, Begründung in einem Satz, „Kann Status ändern“ wörtlich. Sonst „Keine“.}}

**Offene Hinweise zur Belegliste, die einen Status ändern können (letzte Runde):**

{{Nummerierte Liste: Kriterium, Fundstelle, „Kann Status ändern“ wörtlich. Nur Einträge mit `ja`. Sonst „Keine“.}}

{{Nur falls das Ergebnis nicht stabil ist: ⚠️ **Ergebnis nicht stabil:** Welcher Eintrag welche Änderung der Gesamtampel auslösen könnte, in einem Satz je Eintrag. Ein Mensch muss diese Stelle an der Quelle prüfen. Sonst Block weglassen.}}

Prüfberichte: [Runde 1]({{_arbeit/<lauf-id>/pruefbericht-1.md, relativ zum Report}}), [Runde 2]({{_arbeit/<lauf-id>/pruefbericht-2.md, relativ zum Report}}), [Runde 3]({{_arbeit/<lauf-id>/pruefbericht-3.md, nur falls gelaufen}})

## Haftungshinweis

Dieser Report ist eine automatisierte Ersteinschätzung und keine Rechtsberatung. Er ersetzt kein vollständiges Lieferanten-Audit. Alle Angaben sind vor einer Verwendung fachlich zu prüfen.
