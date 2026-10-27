# Beispielreports

Unveränderte Ausgaben des Toolkits. Alle übrigen Reports bleiben lokal und sind nicht versioniert.

## AI-Act-Ersteinschätzung: Video-Bewerbungsinterviews mit inhaltlicher Bewertung

| Feld | Wert |
|---|---|
| Report | [`ai-act_video-interview-inhaltsbewertung_2026-10-27_mehrfach-a.md`](ai-act_video-interview-inhaltsbewertung_2026-10-27_mehrfach-a.md) |
| Prüfberichte | [Runde 1](_arbeit/ai-act_video-interview-inhaltsbewertung_2026-10-27_mehrfach-a/pruefbericht-1.md), [Runde 2](_arbeit/ai-act_video-interview-inhaltsbewertung_2026-10-27_mehrfach-a/pruefbericht-2.md) |
| Testfall | Fall 10 in [`evals/ai-act-testfaelle.md`](../evals/ai-act-testfaelle.md), erfundener Anwendungsfall |
| Aufruf | `/ai-act-check "<Beschreibung aus Fall 10>" test` in einer frischen Session (Blindtest), damals noch vor der Umstellung auf das Plugin. Im Plugin heißt der Befehl `/ai-vendor-assessment:ai-act-check` |
| Erzeugt am | 27.10.2026, Fragebogen 0.7, Modell Sonnet |
| Ergebnis | Hochrisiko (Anhang III Nr. 4 Buchst. a), Sicherheit vorläufig, Soll-Wert getroffen |

**Warum dieser Fall:** Er zeigt die meisten Teile des Reports: Hochrisiko mit Betreiberpflichten und Fristen, offene Punkte mit Klärungsauftrag, eine als Auslegung gekennzeichnete Abgrenzung zum Verbot der Emotionserkennung und zwei Prüfrunden durch den Subagent `pruefer-referenz`.

**Auswahl:** Von drei Läufen zu Fall 10 ist dies der mit dem besten Prüfergebnis (nach Runde 2 keine Aussage nur teilweise gedeckt). Die beiden anderen Läufe hatten nach Runde 2 vier bzw. sechs teilweise gedeckte Aussagen bei gleicher Risikoklasse. Der Report ist damit kein Durchschnittsergebnis.

**Format:** Der Report entstand vor der Festlegung des einheitlichen Prüfvermerk-Formats (Tabelle mit Runde 1 und Runde 2). Sein Prüfvermerk weicht deshalb von [`schema/ai-act-report-template.md`](../plugins/ai-vendor-assessment/schema/ai-act-report-template.md) ab.

## Warum es kein Beispiel zum Vendor-Assessment gibt

Ein Vendor-Report bewertet einen realen Anbieter. Ohne vollständige Prüfung aller Belege gegen die Quellen wäre ein veröffentlichter Report eine ungeprüfte Aussage über ein reales Unternehmen. Ein erfundener Anbieter scheidet aus, weil der Report dann keine echten Quellen hätte.

Alle Reports sind eine Ersteinschätzung und keine Rechtsberatung.
