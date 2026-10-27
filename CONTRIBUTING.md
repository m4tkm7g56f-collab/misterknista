# Mitwirken

Beiträge sind willkommen, als Issue oder Pull Request. Dieses Dokument beschreibt die Regeln, die für jede Änderung gelten, und wie man Änderungen testet.

## Grundregeln

1. **Nur öffentliche oder erfundene Daten.** Keine internen Dokumente von Arbeitgebern oder Kunden, keine echten Zugangsdaten, keine personenbezogenen Daten in Testfällen oder Beispielen.
2. **Nichts erfinden, nichts raten.** Jede Aussage in einem Report braucht einen Beleg. Fehlt er, lautet der Status „nicht belegt“ bzw. „unklar“. Das gilt auch für Änderungen an Kriterien, Fragebogen und Vorlagen: Sie dürfen diesen Status nicht umgehen.
3. **Rechtsinhalte nie aus dem Gedächtnis.** Änderungen an [`references/eu-ai-act.md`](plugins/ai-vendor-assessment/references/eu-ai-act.md) nur nach Recherche in der Primärquelle (EUR-Lex bzw. Amtsblatt), mit Fundstelle und neuem Stand-Datum. Eigene Auslegungen als solche kennzeichnen.
4. **Report-Stil:** sachlich, auditfest, Quellen inline, keine Werbesprache. Datumsformat DD.MM.YYYY.
5. **Keine Bewertung namentlich genannter Anbieter im Repository.** Testläufe mit realen Anbietern bleiben lokal.

## Plugin lokal testen

Für eine einzelne Session, ohne Installation:

```bash
claude --plugin-dir ./plugins/ai-vendor-assessment
```

Oder so, wie ein Nutzer es installiert, über den lokalen Marktplatz:

```bash
claude plugin marketplace add ./
```

```bash
claude plugin install ai-vendor-assessment@ai-vendor-assessment
```

Testläufe gehören in einen eigenen, leeren Ordner außerhalb dieses Repositorys. Die Skills schreiben Reports in den Ordner, in dem Claude Code gestartet wurde.

Vor jedem Commit:

```bash
claude plugin validate .
```

```bash
ruby .claude/hooks/check-frontmatter.rb --alle
```

## Der Hook für den YAML-Kopf

[`.claude/hooks/check-frontmatter.rb`](.claude/hooks/check-frontmatter.rb) prüft den YAML-Kopf jeder `SKILL.md` und jeder Agent-Datei. Hintergrund: Ist der Kopf ungültig, verwirft Claude Code ihn ohne Fehlermeldung. Werkzeugsperren wie `disallowed-tools` oder `tools` wirken dann nicht mehr, und `claude plugin validate` erkennt das nicht.

- Wer Claude Code in diesem Repository startet, bekommt den Hook über [`.claude/settings.json`](.claude/settings.json) automatisch. Er läuft nach jeder Änderung durch Claude an einer Skill- oder Agent-Datei.
- Manuell: `ruby .claude/hooks/check-frontmatter.rb --alle`.
- Er braucht nur Ruby aus der Standardinstallation (getestet mit Ruby 2.6).
- Der Hook gehört nicht zum Plugin. Nutzer des Plugins bekommen ihn nicht.

## Werkzeugrechte der Subagents

Die Funktionstrennung hängt an den Feldern `tools` in den Agent-Dateien. Wer einem Subagent ein Werkzeug hinzufügt, begründet das im Pull Request.

Beim Testen gefunden: Eine Sperre per `disallowed-tools` in einer `SKILL.md` gilt auch für alle Subagents, die dieser Skill beauftragt. Werkzeuge, die nur ein Subagent haben darf, lassen sich deshalb nicht im Skill sperren. Sie fehlen stattdessen im Feld `tools` der anderen Subagents.

## Testfälle und Soll-Werte

- Neue Testfälle für den AI-Act-Teil in [`evals/ai-act-testfaelle.md`](evals/ai-act-testfaelle.md), Soll-Wert in [`evals/soll.yaml`](evals/soll.yaml). Nur erfundene Anwendungsfälle.
- Jeder Testfall läuft als Blindtest in einer frischen Session im Modus `test`, danach:

```bash
ruby evals/auswerten.rb <fall>=<pfad-zum-report>
```

- Mit `--speichern` schreibt das Skript das Ergebnis in `evals/ergebnisse.csv`. Die Datei ist von der Versionierung ausgenommen.
- Wer einen Soll-Wert ändert, begründet das mit Fundstelle.

## Referenz zum AI Act aktualisieren

Meldet die Aktualitätsprüfung `veraltet`, gibt es eine neue konsolidierte Fassung oder einen neuen Änderungsrechtsakt.

1. Neue Fassung in der Primärquelle lesen und die Änderungen in die Abschnitte der Referenz einarbeiten, mit Fundstelle.
2. Im Kopf der Referenz „Stand-Datum“, „Rechtsstand“ (CELEX der konsolidierten Fassung) und „Bekannte Änderungsrechtsakte“ anpassen. Die Aktualitätsprüfung vergleicht genau diese Felder.
3. `referenz_stand` in [`ai-act-fragebogen.yaml`](plugins/ai-vendor-assessment/schema/ai-act-fragebogen.yaml) anpassen und prüfen, ob Fragen oder Hilfetexte betroffen sind.
4. Testfälle erneut laufen lassen, mindestens die Grenzfälle 4, 9 und 10.
5. `version` in [`plugin.json`](plugins/ai-vendor-assessment/.claude-plugin/plugin.json) erhöhen, sonst erhalten Nutzer die Änderung nicht als Update.

## Sicherheitslücken

Schwachstellen bitte nicht als öffentliches Issue melden, sondern über die Funktion „Report a vulnerability“ des Repositorys auf GitHub.
