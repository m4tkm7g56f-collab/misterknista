# AI-Act-Klassifizierer: Testfälle

Zehn erfundene, allgemein gehaltene Anwendungsfälle mit erwarteter Einstufung. Sie dienen als Regressionstest: Nach einer Änderung an Fragebogen, Referenz oder Agents zeigt ein erneuter Lauf, ob die Einstufungen noch der Erwartung entsprechen.

**Status: Hypothese, keine Referenz.** Die erwarteten Einstufungen sind eine Lesart der Referenzdatei (`plugins/ai-vendor-assessment/references/eu-ai-act.md`) und nicht juristisch geprüft. Eine Übereinstimmung misst Konsistenz mit dieser Lesart, nicht Richtigkeit.

Die maschinenlesbaren Soll-Werte stehen in [`soll.yaml`](soll.yaml).

## Fälle

Jede Beschreibung nennt einen Ort in der EU und die Herkunft des Systems. Ohne diese Angaben wird im Testmodus A2 bzw. B1 „unklar“, und das verdeckt die eigentlich getesteten Pfade.

| # | Beschreibung (Eingabe für den Klassifizierer) | Erwartete Risikoklasse des Systems | Erwartete eigene Pflichten der Organisation | Erwartete Fundstellen | Erwartete Rolle |
|---|---|---|---|---|---|
| 1 | Ein Unternehmen in Deutschland nutzt ein allgemeines Sprachmodell eines US-Anbieters, um eingehende Bewerbungen zu lesen, nach Eignung zu bewerten und eine Rangliste für die Personalabteilung zu erstellen. | Hochrisiko | KI-Kompetenz; Betreiberpflichten Art. 26; Anbieterpflichten durch Rollenwechsel | Anhang III Nr. 4 Buchst. a; Profiling (D3), daher keine Rückausnahme; Art. 25 Abs. 1 Buchst. c | Betreiber, durch Zweckänderung Anbieter |
| 2 | Ein Onlinehändler in Deutschland setzt auf seiner Website einen Chatbot eines Drittanbieters ein, der Fragen zu Lieferstatus und Rückgabe beantwortet. | Transparenzpflichten | nur KI-Kompetenz (Art. 50 Abs. 1 trifft den Anbieter) | Art. 50 Abs. 1; Art. 4 | Betreiber |
| 3 | Ein Callcenter in Deutschland analysiert mit einem zugekauften KI-System eines Drittanbieters die Stimme von Anrufenden in Echtzeit, um deren Emotionen zu erkennen und Gespräche mit verärgerten Kunden zu priorisieren. | Hochrisiko | KI-Kompetenz; Information der Betroffenen (Art. 50 Abs. 3); Betreiberpflichten Art. 26 ab 02.12.2027 | Anhang III Nr. 1 Buchst. c; Art. 50 Abs. 3 | Betreiber |
| 4 | Ein Callcenter in Deutschland analysiert mit einem zugekauften KI-System eines Drittanbieters die Stimme der eigenen Mitarbeitenden, um deren Stresslevel und Stimmung zu erkennen und in Teamberichten auszuweisen. | Verbotene Praktik | Einsatz unzulässig | Art. 5 Abs. 1 Buchst. f | Betreiber |
| 5 | Mitarbeitende einer Agentur in Deutschland nutzen einen abonnierten KI-Schreibassistenten eines Drittanbieters, um interne E-Mails und Konzeptentwürfe zu formulieren. Die Texte werden vor Verwendung von Menschen überarbeitet. | Transparenzpflichten | nur KI-Kompetenz (Art. 50 Abs. 2 trifft den Anbieter) | Art. 50 Abs. 2; Art. 4 | Betreiber |
| 6 | Eine Bank in der EU nutzt ein KI-System eines Fintech-Anbieters, um die Kreditwürdigkeit von Privatkunden bei Ratenkrediten zu bewerten. | Hochrisiko | KI-Kompetenz; Betreiberpflichten Art. 26; Grundrechte-Folgenabschätzung Art. 27 | Anhang III Nr. 5 Buchst. b; Art. 27 | Betreiber |
| 7 | Eine Marketingabteilung eines Unternehmens in Deutschland erzeugt mit einem abonnierten KI-Bildgenerator eines Drittanbieters realistische Fotos von nicht existierenden Personen für eine Werbekampagne und veröffentlicht sie. | Transparenzpflichten | KI-Kompetenz; Deepfake-Offenlegung nach Art. 50 Abs. 4 offen (siehe Unschärfen) | Art. 50 Abs. 2 (Anbieter), Art. 50 Abs. 4, Art. 3 Nr. 60 | Betreiber |
| 8 | Ein Zahlungsdienstleister in Deutschland nutzt ein zugekauftes KI-System eines Drittanbieters, um verdächtige Kartenzahlungen in Echtzeit als möglichen Betrug zu markieren. Die Prüfung übernehmen Menschen. | Keine besonderen Pflichten außer KI-Kompetenz | nur KI-Kompetenz | Anhang III Nr. 5 Buchst. b, Ausnahme Betrugserkennung; Art. 4 | Betreiber |
| 9 | Ein Unternehmen in Deutschland nutzt ein zugekauftes KI-System eines Drittanbieters für Video-Bewerbungsinterviews. Das System wertet Mimik und Stimme der Bewerbenden aus und gibt an, wie selbstsicher, nervös oder begeistert sie wirken. Die Personalabteilung nutzt diese Angaben für die Vorauswahl. | Verbotene Praktik | Einsatz unzulässig | Art. 5 Abs. 1 Buchst. f; Leitlinien C(2025) 5052 Rn. 254 (Bewerbende zählen zum Arbeitsplatz) | Betreiber |
| 10 | Ein Unternehmen in Deutschland nutzt ein zugekauftes KI-System eines Drittanbieters für Video-Bewerbungsinterviews. Das System transkribiert die Antworten der Bewerbenden und bewertet nur deren Inhalt anhand vorgegebener Anforderungen. Mimik und Stimme werden nicht ausgewertet. Die Personalabteilung nutzt die Bewertung für die Vorauswahl. | Hochrisiko | KI-Kompetenz; Betreiberpflichten Art. 26 ab 02.12.2027 | Anhang III Nr. 4 Buchst. a; Profiling (D3), daher keine Rückausnahme; Art. 5 Abs. 1 Buchst. f nicht einschlägig (Inhaltsauswertung, Leitlinien Beispiele nach Rn. 251) | Betreiber |

## Was die Fälle prüfen

| Pfad | Fälle |
|---|---|
| Profiling schließt Rückausnahme aus | 1 |
| Rollenwechsel nach Art. 25 | 1 |
| Abgrenzung Verbot vs. Hochrisiko bei Emotionserkennung | 3, 4 |
| Emotionserkennung bei Bewerbenden (Arbeitsplatz) vs. reine Inhaltsauswertung | 9, 10 |
| Nur Transparenz | 2, 7 |
| Grundrechte-Folgenabschätzung | 6 |
| Ausdrückliche Ausnahme in Anhang III | 8 |
| Keine besonderen Pflichten | 5, 8 |
| Geltungsbeginn: Verbot seit 02.02.2025, Transparenz seit 02.08.2026, Hochrisiko ab 02.12.2027 | 4, 2, 1 |

## Bekannte Unschärfen

- Fall 9: Die Erwartung stützt sich auf die Leitlinien der Kommission, die nicht verbindlich sind. Fall 10 prüft die Gegenrichtung: Ein Video allein macht ein System nicht zur Emotionserkennung. Dass die Inhaltsauswertung transkribierter Antworten nicht unter Art. 5 Abs. 1 Buchst. f fällt, ist eine in der Referenz gekennzeichnete eigene Auslegung.
- Fall 7: Ob realistische Bilder nicht existierender Personen ein „Deepfake“ sind, hängt an Art. 3 Nr. 60: Der Inhalt muss „wirklichen Personen … ähneln“ und fälschlicherweise als echt erscheinen. Ob eine erfundene, aber fotorealistische Person „wirklichen Personen ähnelt“, ist nach dem Wortlaut nicht eindeutig. Erwartet wird, dass der Klassifizierer Art. 50 Abs. 4 als offenen Punkt ausweist und nicht selbst entscheidet.
- Fall 1: Ob die Nutzung eines allgemeinen Sprachmodells für die Bewerberbewertung ein Rollenwechsel nach Art. 25 Abs. 1 Buchst. c ist, hängt davon ab, ob das Unternehmen die Zweckbestimmung „verändert“. Die erwartete Einstufung Hochrisiko gilt unabhängig davon.
- Fall 4: Ein Prüfvorbehalt zu Social Scoring (C4) ist vertretbar, weil die Beschreibung offenlässt, ob Beschäftigte einzeln und über längere Zeit bewertet werden. Er ändert die Klasse nicht.

## Ausführen und auswerten

1. Jeden Fall in einer frischen Session im Modus `test` ausführen, damit frühere Läufe das Ergebnis nicht beeinflussen.
2. Reports mit den Soll-Werten vergleichen:

```bash
ruby evals/auswerten.rb FALL=REPORT [FALL=REPORT ...]
ruby evals/auswerten.rb --speichern --modell NAME FALL=REPORT   # Lauf in evals/ergebnisse.csv festhalten
ruby evals/auswerten.rb --uebersicht                            # Trefferquote über alle gespeicherten Läufe
```

Das Skript liest nur die Ergebnistabelle des Reports. Ob die Begründung stimmt, prüft der Subagent `pruefer-referenz` im Lauf selbst.
