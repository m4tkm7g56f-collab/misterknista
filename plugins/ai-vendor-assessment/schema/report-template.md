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

<!-- Wird nach der Prüfung durch den Subagent pruefer vom Skill ergänzt. Format fest, damit evals/ die Prüfbefunde auswerten kann: Zeilen und Spalten nicht umbenennen, keine weiteren einfügen. Runde 2 = „–“, wenn keine Korrekturrunde nötig war. -->

Geprüft durch den Subagent `pruefer` gegen die Belegliste und erneut abgerufene Quellen, Stand {{DD.MM.YYYY}}. Maßgeblich ist die letzte Runde.

| Befund | Runde 1 | Runde 2 |
|---|---|---|
| gedeckt | {{n}} | {{n / –}} |
| teilweise gedeckt | {{n}} | {{n / –}} |
| nicht gedeckt | {{n}} | {{n / –}} |
| Belegstelle nicht gefunden | {{n}} | {{n / –}} |
| nicht erreichbar | {{n}} | {{n / –}} |
| Summe | {{n}} | {{n / –}} |

Erneut abgerufen: {{n}} tragende Q-Nummern (Runde 1), {{n / –}} (Runde 2).

**Verbliebene Befunde mit Handlungsbedarf (letzte Runde):**

{{Nummerierte Liste: Kriterium, Q-Nummer, Befund, Begründung in einem Satz. Sonst „Keine“.}}

Prüfberichte: [Runde 1]({{reports/_arbeit/<lauf-id>/pruefbericht-1.md}}), [Runde 2]({{reports/_arbeit/<lauf-id>/pruefbericht-2.md}})

## Haftungshinweis

Dieser Report ist eine automatisierte Ersteinschätzung und keine Rechtsberatung. Er ersetzt kein vollständiges Lieferanten-Audit. Alle Angaben sind vor einer Verwendung fachlich zu prüfen.
