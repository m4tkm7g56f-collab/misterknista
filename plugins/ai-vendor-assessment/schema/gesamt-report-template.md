# Gesamtbewertung: {{dienst}} für {{kurzname_anwendungsfall}}

| Feld | Wert |
|---|---|
| Anbieter und Dienst | {{anbieter_name}}, {{dienst}}, Tarif {{tarif}} |
| Einstiegs-URL | {{url}} |
| Anwendungsfall | {{kurzname_anwendungsfall}} |
| Bewertungsdatum | {{DD.MM.YYYY}} |
| Regelwerke | Vendor-Schema {{schema_version}}, AI-Act-Fragebogen {{fragebogen_version}}, Gesamtbild {{gesamtbild_version}}, AI-Act-Referenz Stand {{referenz_stand}} |
| Modus | {{Dialog / Test}} |

Beschreibung des Anwendungsfalls (Eingabe, wörtlich):

> {{beschreibung}}

## Gesamtbild

**{{Stufe nach gesamtbild.stufen}}**

**Ausschlaggebend:** {{Bedingung, die die Stufe ausgelöst hat}}

{{Zusammenfassung in drei bis vier Sätzen Alltagssprache: Darf das Tool für diesen Zweck eingesetzt werden, was steht dem entgegen, was ist als Nächstes zu tun?}}

| Dimension | Ergebnis | Detail-Report |
|---|---|---|
| AI Act: System | {{Risikoklasse mit Fundstelle}} | [{{dateiname}}]({{pfad}}) |
| AI Act: Pflichten der Organisation | {{Kurzliste mit gilt seit/ab}} | |
| AI Act: Sicherheit | {{bestätigt / vorläufig / offen}}, {{n}} tragende Annahmen, {{m}} Prüfvorbehalte | |
| Schutzbedarf | {{Stufe}}, {{Herkunft: hergeleitet / angegeben / angehoben wegen Hochrisiko}} | |
| Anbieter: Gesamtampel | {{Ampel mit Zählzusatz}} oder „nicht durchgeführt (Grund)“ | [{{dateiname}}]({{pfad}}) |
| Anbieter: Gesamtampel bei Schutzbedarf hoch | {{nur bei „Hochrisiko nicht ausgeschlossen“}} | |

## Herleitung des Schutzbedarfs

| Quelle | Stufe | Begründung |
|---|---|---|
| Einstufungshilfe bzw. Angabe | {{Stufe}} | {{zutreffende Fragen}} |
| AI-Act-Kopplung | {{„hoch“ oder „keine Anhebung“}} | {{Risikoklasse}} |
| **Verwendet** | **{{Stufe}}** | höhere der beiden Stufen |

## Wechselwirkungen

| ID | Feststellung | Folge |
|---|---|---|
| {{W1 bis W7}} | {{was zutrifft}} | {{Folge laut gesamtbild.yaml}} |

## Offene Punkte (priorisiert)

<!-- Nur Prioritäten aufführen, zu denen es Punkte gibt. Leere Prioritäten weglassen. -->

| Prio | Punkt | Quelle | Gilt seit / ab | Klärungsauftrag (wer, was) |
|---|---|---|---|---|
| {{1 bis 7}} | {{Punkt}} | {{AI Act / Vendor / Wechselwirkung}} | {{Datum oder „–“}} | {{wer klärt was}} |

## Nachfragen an den Anbieter

Aus beiden Modulen zusammengeführt, ohne Dubletten.

1. {{Kriterium bzw. Frage-ID}}: {{konkrete Nachfrage}}

## Anlagen

- AI-Act-Ersteinschätzung: [{{dateiname}}]({{pfad}})
- Vendor-Security-Assessment: [{{dateiname}}]({{pfad}}) oder „nicht durchgeführt (Grund)“

## Haftungshinweis

Diese Gesamtbewertung ist eine automatisierte Ersteinschätzung auf Basis öffentlicher Quellen, der Angaben zum Anwendungsfall und einer datierten Referenz zum EU AI Act. Sie ist keine Rechtsberatung und ersetzt weder eine rechtliche Prüfung noch ein vollständiges Lieferanten-Audit. „Keine Hindernisse festgestellt“ ist keine Freigabe. Die Entscheidung über den Einsatz trifft die Organisation.
