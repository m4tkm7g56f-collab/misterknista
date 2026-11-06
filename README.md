# AI Vendor Assessment

> Status: Version 0.2.0. Beide Module und der gemeinsame Einstiegspunkt sind lauffähig und in Blindtests erprobt. Eine erste Gegenprüfung durch ein anderes KI-Modell ist im [Review-Log](reviews/review-log.md) dokumentiert, mit offenen Befunden. Eine fachliche Prüfung durch Menschen steht aus. **Keine Rechtsberatung**, siehe [Haftungshinweis](#haftungshinweis).

Ein Plugin für [Claude Code](https://code.claude.com/docs) mit zwei Aufgaben aus der Informationssicherheit und AI Governance:

1. **Vendor-Security-Assessment:** bewertet einen Software- oder Cloud-Anbieter anhand öffentlicher Quellen nach einem Ampel-Schema. Jede Aussage im Report ist mit Quelle und wörtlicher Belegstelle verlinkt. Ohne Beleg lautet der Status „nicht belegt“.
2. **EU-AI-Act-Ersteinschätzung:** ordnet einen KI-Anwendungsfall per Fragebogen einer Risikoklasse zu und listet die Pflichten der Organisation mit Geltungsbeginn sowie offene Punkte. Rechtsinhalte stammen ausschließlich aus einer datierten Referenz zur konsolidierten Fassung des AI Act, einschließlich des Digital Omnibus on AI (Verordnung (EU) 2026/1744).

Der Einstiegspunkt `assessment` verbindet beide Module zu einer Frage: *Kann dieser Dienst für diesen Anwendungsfall eingesetzt werden?* Er erzeugt einen gemeinsamen Report mit einem vierstufigen Gesamtbild (nicht zulässig, zwingend zu klären, mit Klärungen möglich, keine Hindernisse festgestellt), den Wechselwirkungen zwischen beiden Modulen und priorisierten offenen Punkten.

Ein unveränderter Beispielreport mit beiden Prüfberichten liegt unter [`examples/`](examples/).

## Installation

Voraussetzungen:

- Claude Code (Terminal, Desktop-App oder IDE-Erweiterung). In Cloud-Sessions werden lokal installierte Plugins nicht geladen.
- Node.js (für `npx`) und Google Chrome. Das Plugin bringt einen eigenen Browser-Server mit (Playwright MCP, feste Version 0.0.83, Profil nur im Speicher). Während eines Laufs öffnet sich ein Chrome-Fenster, in dem man sieht, was Rechercheur und Prüfer abrufen. Ohne Fenster (headless) erkennt der Bot-Schutz mancher Anbieter den Browser leichter und blockt ihn. Rechercheur und Prüfer brauchen ihn für Seiten, die per JavaScript laden oder das Abrufwerkzeug abwehren. Ein separates Playwright-Plugin ist nicht nötig.
- ⚠️ Ohne Node.js oder Chrome startet der Browser-Server nicht. Der Skill weist dann vor dem Start darauf hin, und der Report trägt den Hinweis „Aussagekraft eingeschränkt“. Bei Anbietern, die das Abrufwerkzeug abwehren, bleiben dann viele Kriterien „nicht belegt“. Das ist eine Grenze des Werkzeugs, kein Befund über den Anbieter. Statt Chrome lässt sich über die Umgebungsvariable `PLAYWRIGHT_MCP_BROWSER` ein anderer Browser wählen (`msedge`, `firefox`, `webkit`), Firefox und WebKit brauchen dann einmalig `npx playwright install`.

In einer Claude-Code-Session:

```text
/plugin marketplace add m4tkm7g56f-collab/misterknista
/plugin install ai-vendor-assessment@ai-vendor-assessment
```

Oder in der Shell:

```bash
claude plugin marketplace add m4tkm7g56f-collab/misterknista
```

```bash
claude plugin install ai-vendor-assessment@ai-vendor-assessment
```

Vor der Installation zeigt `/plugin` an, was das Plugin mitbringt: drei Skills, sechs Subagents, einen MCP-Server (`browser`) und einen Hook (Schranke, siehe Sicherheitshinweise). Der Hook startet bei jedem Lese-, Schreib- und Abrufaufruf und nach jedem Aufruf des Plugin-Browsers kurz Node.js, auch in Sessions ohne Plugin-Lauf. Er greift aber nur bei den Subagents des Plugins. Beim ersten Start lädt `npx` den Browser-Server aus npm. Laut `claude plugin details` kostet das Plugin etwa 690 Tokens in jeder Session, in der es aktiv ist. Jeder Aufruf eines Skills oder Subagents kostet zusätzlich etwa 600 bis 1.300 Tokens für dessen Anweisungen, dazu kommt die eigentliche Arbeit (Recherche, Bewertung, Prüfung).

Aktualisieren: Automatische Updates sind für Marktplätze außerhalb von Anthropic standardmäßig aus. Sie lassen sich in `/plugin` im Reiter **Marketplaces** einschalten. Manuell:

```bash
claude plugin update ai-vendor-assessment@ai-vendor-assessment
```

Entfernen:

```bash
claude plugin marketplace remove ai-vendor-assessment
```

Das entfernt den Marktplatz und deinstalliert das Plugin. Bereits erzeugte Reports bleiben in den Projektordnern liegen.

## Nutzung

Die Skills tragen den Namen des Plugins als Präfix. Claude Code im eigenen Projektordner starten, dann:

**Gesamtbewertung (beide Module):**

```text
/ai-vendor-assessment:assessment <anbieter-url> "Beschreibung des Anwendungsfalls" ["Tarif"] [dialog|test]
```

- Die AI-Act-Einstufung läuft zuerst, danach das Vendor-Assessment.
- Ergibt der AI Act „Hochrisiko“, wird der Schutzbedarf für die Anbieterbewertung auf mindestens „hoch“ gesetzt.
- Bei einer verbotenen Praktik entfällt das Vendor-Assessment.
- Regeln: [`schema/gesamtbild.yaml`](plugins/ai-vendor-assessment/schema/gesamtbild.yaml).

**Vendor-Assessment allein:**

```text
/ai-vendor-assessment:vendor-assessment <anbieter-url> [normal|hoch|sehr_hoch] ["Anwendungsfall"] ["Tarif"]
```

Beispiele:

```text
/ai-vendor-assessment:vendor-assessment https://www.example.com
/ai-vendor-assessment:vendor-assessment https://www.example.com "" "Personalverwaltung inkl. Krankheitsdaten"
/ai-vendor-assessment:vendor-assessment https://www.example.com hoch "" "Business"
```

- Ohne Schutzbedarf und Anwendungsfall gilt „normal“.
- Mit Anwendungsfall, aber ohne Schutzbedarf, leitet der Skill den Schutzbedarf her und legt die Herleitung offen.
- Ohne Tarif wird der kleinste kostenpflichtige Business-Tarif bewertet.

**AI-Act-Ersteinschätzung allein:**

```text
/ai-vendor-assessment:ai-act-check "Beschreibung des Anwendungsfalls" [dialog|test]
```

- Im Modus `dialog` (Standard) leitet der Skill ab, was aus der Beschreibung hervorgeht, legt die Annahmen zur Bestätigung vor und fragt den Rest mit Auswahloptionen ab.
- Im Modus `test` stellt er keine Rückfragen. Was sich nicht ableiten lässt, wird „unklar“.

### Wo die Ergebnisse landen

Alle Ergebnisse bleiben auf dem eigenen Rechner, im Projektordner, in dem Claude Code gestartet wurde:

| Pfad | Inhalt |
|---|---|
| `reports/<lauf-id>.md` | Report |
| `reports/_arbeit/<lauf-id>/` | Zwischenergebnisse: Belegliste, Aktualitätsprüfung, Prüfberichte |
| `reports/_arbeit/_browser/` | Protokolle und Snapshots, die der Browser-Server von sich aus anlegt (öffentliche Seiten). Für die Subagents gesperrt. Ab Plugin 0.3.2, vorher `.playwright-mcp/` im Projektordner |

Das Plugin lädt nichts hoch und schreibt nichts in dieses Repository. Wer den eigenen Projektordner mit Git versioniert, sollte `reports/` in die `.gitignore` aufnehmen (bei Läufen mit älteren Versionen auch `.playwright-mcp/`), sonst landen Reports und Browser-Protokolle beim nächsten Push im eigenen Repository.

## Wie die Bewertung funktioniert

Das Schema in [`criteria.yaml`](plugins/ai-vendor-assessment/schema/criteria.yaml) trennt zwei Ebenen:

- **Einzelbewertung:** zehn Kriterien, unabhängig vom Anwendungsfall: Zertifizierungen, Hosting und Datenresidenz, Subprozessoren, Auftragsverarbeitung, Authentifizierung, Incidents, Verschlüsselung, Schwachstellenmanagement, Verfügbarkeit und Notfallvorsorge, Nutzung von Kundendaten durch KI. Status Grün, Gelb, Rot, nicht belegt oder nicht anwendbar, jeweils mit Belegstufe (A Primärnachweis, B Selbstauskunft des Anbieters, C Drittquelle).
- **Gesamturteil:** abhängig vom Schutzbedarf des Anwendungsfalls (normal, hoch, sehr hoch, angelehnt an den BSI IT-Grundschutz). Ein höherer Schutzbedarf macht mehr Kriterien zu Kernkriterien und verschärft die Anforderungen. Schließt der Vertrag des Anbieters eine Datenart aus, die der Anwendungsfall enthält, ist das Ergebnis „Rot – vertraglich unzulässig“.

Rot setzt einen belegten Mangel voraus. Fehlende Informationen ergeben „nicht belegt“, nicht Rot.

Beim Auftragsverarbeitungsvertrag prüft das Schema die zehn Pflichtmerkmale nach Art. 28 Abs. 3 DSGVO einzeln, jeweils mit Fundstelle im Vertrag. Übliche Ausgestaltungen, etwa ein Prüfrecht vorrangig über Zertifikate und Prüfberichte, gelten als erfüllt, solange der Kern gewahrt ist. Bezieht ein DPA die Standardvertragsklauseln der Kommission ein, genügt der Beleg dafür. Rechtsgrundlage und Auslegung stehen in [`references/dsgvo-art28.md`](plugins/ai-vendor-assessment/references/dsgvo-art28.md).

Der AI-Act-Fragebogen in [`ai-act-fragebogen.yaml`](plugins/ai-vendor-assessment/schema/ai-act-fragebogen.yaml) trennt drei Ebenen:

- **Einstufung:** Anwendungsbereich, Rolle, Verbote, Hochrisiko, Transparenz. Jede Antwort mit Fundstelle.
- **Sicherheit:** bestätigt, vorläufig oder offen, je nachdem, ob die tragenden Antworten bestätigt, aus der Beschreibung abgeleitet oder unklar sind.
- **Dringlichkeit:** welche Pflichten bereits gelten und welche erst ab einem Datum.

„Unklar“ wird nie als „nein“ gewertet und führt nicht automatisch zur strengeren Klasse, sondern zu einem offenen Punkt mit Klärungsauftrag. Jede Frage hat eine Erklärung in Alltagssprache und je ein Ja- und Nein-Beispiel, damit auch Fachabteilungen ohne Vorwissen den Fragebogen beantworten können.

## Architektur: Funktionstrennung mit Subagents

Ablauf von `assessment`. `ai-act-check` und `vendor-assessment` führen jeweils nur ihren Teil aus.

```mermaid
flowchart TD
    E["assessment<br/>Anbieter-URL und Anwendungsfall"] --> A

    subgraph AI["AI Act"]
        A["pruefer-aktualitaet<br/>zwei feste Abfragen, nur Metadaten"] --> K
        K["ai-act-klassifizierer<br/>Fragebogen und datierte Referenz, kein Web"] --> PR["pruefer-referenz<br/>Deckung jeder rechtlichen Aussage, kein Web"]
        PR -. "Befunde: eine Korrekturrunde" .-> K
    end

    PR --> V{"Verbotene Praktik?"}
    V -- "ja: Vendor-Teil entfällt" --> S
    V -- nein --> SB["Schutzbedarf koppeln<br/>Hochrisiko: mindestens hoch"]
    SB --> R

    subgraph VA["Vendor-Assessment"]
        R["rechercheur<br/>Web, ohne Anwendungsfall"] --> B["bewerter<br/>nur Belegliste, kein Web"]
        B --> P["pruefer<br/>tragende Quellen erneut abrufen"]
        P -. "Hinweise zur Belegliste: Nachrecherche" .-> R
        P -. "Befunde: eine Korrekturrunde" .-> B
    end

    P --> S["Synthese<br/>Gesamtbild in vier Stufen, Wechselwirkungen"]
    S --> REP["Gemeinsamer Report mit Prüfvermerk"]
```

Die Skills führen die Arbeit nicht selbst aus. Sie beauftragen Subagents mit getrennten Werkzeugrechten, nach dem Prinzip der geringsten Rechte. Die Rechte stehen im Feld `tools` der jeweiligen Datei und gelten technisch, nicht nur als Anweisung. Zusätzlich begrenzt ein Hook (Schranke) Lese- und Schreibpfade, Abruf-URLs und Browser-Werkzeuge, siehe Sicherheitshinweise.

| Subagent | Aufgabe | Webzugriff | Datei |
|---|---|---|---|
| `pruefer-aktualitaet` | Prüfen, ob die AI-Act-Referenz dem neuesten veröffentlichten Rechtsstand entspricht | nur Abruf, technisch auf zwei feste URLs begrenzt | [`pruefer-aktualitaet.md`](plugins/ai-vendor-assessment/agents/pruefer-aktualitaet.md) |
| `ai-act-klassifizierer` | AI-Act-Einstufung nach Fragebogen | nein | [`ai-act-klassifizierer.md`](plugins/ai-vendor-assessment/agents/ai-act-klassifizierer.md) |
| `pruefer-referenz` | Deckung jeder rechtlichen Aussage durch die Referenz prüfen | nein | [`pruefer-referenz.md`](plugins/ai-vendor-assessment/agents/pruefer-referenz.md) |
| `rechercheur` | Belege zum Anbieter sammeln, mit wörtlicher Belegstelle | ja, ohne Klick-Werkzeug | [`rechercheur.md`](plugins/ai-vendor-assessment/agents/rechercheur.md) |
| `bewerter` | Ampel je Kriterium, nur aus der Belegliste | nein | [`bewerter.md`](plugins/ai-vendor-assessment/agents/bewerter.md) |
| `pruefer` | Deckung jeder Aussage prüfen, tragende Quellen erneut abrufen | nur Abruf | [`pruefer.md`](plugins/ai-vendor-assessment/agents/pruefer.md) |

- Der Rechercheur erhält weder den Text des Anwendungsfalls noch den Schutzbedarf. AI-Act- und Gesamt-Dateien kann er technisch nicht lesen. ⚠️ Bei `assessment` erhält er aber den daraus abgeleiteten Dienstumfang und darf ihn in Suchanfragen verwenden. Der Dienstumfang besteht laut Skill nur aus Produkt-, Modul- und Funktionsnamen des Anbieters, im Modus `dialog` bestätigt der Nutzer ihn vorher. Die Ableitung macht das Sprachmodell. Im Modus `test` prüft sie niemand.
- Der Bewerter kann nicht nachrecherchieren. Was nicht in der Belegliste steht, ist „nicht belegt“. Findet der Prüfer beim erneuten Abruf eine fehlende oder fehlerhafte Belegstelle, meldet er sie als Hinweis zur Belegliste. Der Rechercheur ruft die Stelle dann selbst ab und ergänzt die Belegliste, erst danach korrigiert der Bewerter. Der Prüfbericht ist für den Bewerter nie eine Quelle.
- Die Prüfer ändern keinen Report. Bei Befunden gibt es genau eine Korrekturrunde, danach werden verbliebene Befunde im Report als Prüfvermerk ausgewiesen.
- Die Zwischenergebnisse unter `reports/_arbeit/` machen jeden Schritt nachvollziehbar.

## Aktualität der Rechtsgrundlage

Die AI-Act-Einstufung stützt sich nur auf [`references/eu-ai-act.md`](plugins/ai-vendor-assessment/references/eu-ai-act.md), Stand 26.10.2026, ergänzt 27.10.2026 und 03.11.2026 (konsolidierte Fassung CELEX `02024R1689-20260727`). Damit ein Report nicht unbemerkt auf veraltetem Recht beruht, fragt der Subagent `pruefer-aktualitaet` vor jeder Einstufung beim SPARQL-Dienst des Amts für Veröffentlichungen der EU ab, ob es eine neuere konsolidierte Fassung oder einen neuen Änderungsrechtsakt gibt. Die Beschreibung des Anwendungsfalls erhält er nicht.

| Ergebnis | Folge im Report |
|---|---|
| `aktuell` | Zeile „Aktualität der Referenz“ mit Prüfdatum |
| `veraltet` | Hinweis zum Rechtsstand vor der Kopfzeile, Sicherheit höchstens „vorläufig“, erster offener Punkt: Referenz aktualisieren und Einstufung wiederholen |
| `nicht_geprueft` (Abfrage fehlgeschlagen) | Zeile mit Grund und Alter der Referenz. Ist die Referenz älter als drei Monate, zusätzlich der Hinweis und Sicherheit höchstens „vorläufig“ |

Der Lauf bricht in keinem Fall ab. Grenzen der Prüfung:

- Sie erkennt nur neue konsolidierte Fassungen und Änderungsrechtsakte der Verordnung. Leitlinien der Kommission, Berichtigungen ohne neue konsolidierte Fassung, delegierte Rechtsakte, Normen und nationale Vorschriften erfasst sie nicht.
- Sie sagt, *dass* sich etwas geändert hat, nicht *was*. Die Referenz aktualisiert der Maintainer von Hand, mit Recherche und neuem Stand-Datum.

## Sicherheitshinweise

- **Webzugriff ohne Einzelbestätigung.** Rechercheur und Prüfer rufen während eines Laufs Webseiten und Suchen ab. Abgerufene Inhalte gelten laut Anweisung als Daten, nicht als Anweisungen. Ein verlässlicher Schutz gegen Prompt Injection ist das nicht. Deshalb begrenzt die Schranke, was eine eingeschleuste Anweisung bewirken kann.
- **Schranke.** Ein PreToolUse-Hook des Plugins ([`hooks/schranke.mjs`](plugins/ai-vendor-assessment/hooks/schranke.mjs)) prüft jeden Aufruf der sechs Subagents, bevor er ausgeführt wird, und blockiert:
  - Lesen außerhalb des Plugin-Ordners und `reports/`, z. B. SSH-Schlüssel oder `.env`-Dateien.
  - Schreiben außerhalb von `reports/`, für die Subagents mit Webzugriff außerhalb von `reports/_arbeit/`. Symlinks werden aufgelöst.
  - Für Rechercheur und Prüfer: Abrufe außer http und https, IP-Adressen, interne Hostnamen, Hosts mit privater Adresse laut DNS, andere Ports als 80 und 443, URLs mit Zugangsdaten. Dazu AI-Act- und Gesamt-Dateien.
  - Für Rechercheur und Prüfer jedes Browser-Werkzeug außer Seite laden, Snapshot, Warten und Schließen. Klicken, Tippen, JavaScript und Werkzeuge, die ein Update des Browser-Servers neu mitbringt, sind damit gesperrt. Die anderen Subagents dürfen den Browser gar nicht nutzen.
  - Für die Aktualitätsprüfung jeden Abruf außer den zwei festen URLs.
  - Lesen und Schreiben im Ausgabeordner des Browser-Servers (`reports/_arbeit/_browser/`). Dort legt der Server auch Snapshots von Seiten ab, die die Schranke nach dem Laden sperrt.
  - Nach jedem Browser-Aufruf prüft der Hook die tatsächlich geladene Seiten-URL nach denselben Regeln (PostToolUse). Hat eine Weiterleitung auf eine gesperrte Adresse geführt, ersetzt er die Ausgabe durch eine Sperrmeldung und löscht die dabei geschriebenen Snapshots.
  - Fehlt Node.js, blockiert der Hook alle Aufrufe der Subagents, statt unbemerkt auszufallen. Bei einem internen Fehler blockiert er ebenfalls.
  - Tests: `node --test tests/schranke.test.mjs`.
- ⚠️ **Grenzen der Schranke.**
  - Sie hindert Rechercheur und Prüfer nicht daran, öffentliche Adressen beliebiger Domains abzurufen. Daten, die sie lesen dürfen, könnten über eine präparierte URL nach außen gelangen. Lesen dürfen sie nur den Plugin-Ordner und die Vendor-Dateien in `reports/`. Der Vendor-Report enthält die Kurzbeschreibung des Anwendungsfalls, der Prüfer liest ihn.
  - Die Prüfung nach dem Laden verhindert den Abruf nicht. Bei einer Weiterleitung auf eine interne Adresse hat der Browser sie schon aufgerufen. Der Hook verhindert nur, dass der Inhalt beim Subagent ankommt. Inhalte, die eine Seite aus dem lokalen Netz nachlädt (Bilder, Skripte, Frames), sieht er nicht, DNS-Rebinding fängt er ebenfalls nicht ab.
  - Dass Claude Code die ersetzte Ausgabe übernimmt, ist in einer echten Session getestet (05.11.2026). Eine echte Weiterleitung auf eine interne Adresse ließ sich dabei nicht nachstellen, diesen Fall decken nur die Tests des Hooks ab.
  - Der Hook kennt die Subagents nur am Namen (`ai-vendor-assessment:…`). Wer sie unter anderem Namen kopiert, ist nicht geschützt. Für den Hauptagent gilt er nicht.
- ⚠️ **Webabruf im AI-Act-Teil.** Eine Werkzeugsperre im Skill (`disallowed-tools`) gilt auch für alle Subagents, die er beauftragt. Weil die Aktualitätsprüfung Webabruf braucht, sperrt `ai-act-check` nur die Websuche. Dass der Hauptagent selbst keine Webseiten abruft, ist damit nur eine Anweisung, keine technische Sperre. Klassifizierer und Referenz-Prüfer haben technisch keinen Webzugriff. Die Aktualitätsprüfung ist technisch auf die zwei festen URLs begrenzt (Schranke).
- **Browser-Server mit fester Version.** Das Plugin startet Playwright MCP in Version 0.0.83, nicht `@latest`. Eine neue, möglicherweise kompromittierte Version läuft also nicht automatisch, Updates kommen nur mit einer neuen Plugin-Version. Der Browser hält sein Profil nur im Speicher: Cookies und Einwilligungen bleiben nicht über den Lauf hinaus erhalten. Vom eigenen Browser ist er vollständig getrennt.
- **Cookie-Banner.** Rechercheur und Prüfer haben kein Klick-Werkzeug und können deshalb nicht in Tracking einwilligen. Bis Version 0.2.0 hatte der Rechercheur es, und in Testläufen hat er trotz gegenteiliger Anweisung einen Banner akzeptiert. ⚠️ Folge: Liegt Text nur hinter einem Banner oder in eingeklappten Bereichen, bleibt er „nicht abrufbar“, außer es gibt eine andere Darstellung derselben Seite. Auch ohne Einwilligung sehen Anbieter beim Abruf die IP-Adresse. Im Firmennetz können sie so erkennen, welche Organisation sie gerade prüft.
- ⚠️ **Abruf nach Abwehr.** Rechercheur und Prüfer lösen keine Challenges oder CAPTCHAs, nutzen keine Logins oder Zugangsformulare und beachten robots.txt. Wehrt eine Seite nur das Abrufwerkzeug ab (HTTP 403 oder 429 ohne Challenge), rufen sie sie per Browser ab, bei 429 mit Pausen. Das ist eine bewusst eingegangene Grauzone: Der Betreiber zeigt damit, dass er keine automatisierten Abrufe will, und auch der Browser ist automatisiert. Ohne diesen Weg blieben viele Anbieter weitgehend „nicht belegt“. Jeder so gewonnene Beleg ist in der Belegliste gekennzeichnet, der Report nennt die Domains unter „Methodik und Grenzen“. Ist eine Seite nicht lesbar (z. B. eingeklappter Text), dürfen sie eine andere Darstellung desselben Inhalts abrufen, etwa eine JSON-Fassung auf demselben Host, nur bei erlaubtem Pfad und ohne Login oder Schlüssel. Die Regeln stehen in [`abrufregeln.md`](plugins/ai-vendor-assessment/skills/vendor-assessment/abrufregeln.md).
- **Datenminimierung.** Suchanfragen enthalten Anbieter, Dienstumfang und Kriterium, aber nicht den Text des Anwendungsfalls. Bei `assessment` wird der Dienstumfang aus dem Anwendungsfall abgeleitet, nur aus Produktnamen des Anbieters und im Modus `dialog` mit Bestätigung, siehe Abschnitt Architektur. Im beruflichen Kontext kann schon die Information „Anbieter X wird geprüft“ vertraulich sein.
- **Beschreibungen sind Daten.** Die Beschreibung des Anwendungsfalls wird als Daten behandelt, nicht als Anweisung. Vertrauliche Details gehören trotzdem nicht hinein: Sie werden an das Sprachmodell übertragen und stehen im Report.

## Qualitätssicherung

### Eval-Suite für den AI-Act-Teil

Elf erfundene Testfälle mit Soll-Einstufung in [`evals/ai-act-testfaelle.md`](evals/ai-act-testfaelle.md), Soll-Werte in [`evals/soll.yaml`](evals/soll.yaml). Jeder Fall läuft als Blindtest in einer frischen Session. Ein Skript vergleicht den Report mit dem Soll-Wert:

```bash
ruby evals/auswerten.rb 9=reports/<report>.md
```

| Stand 27.10.2026 | Ergebnis |
|---|---|
| Gezählte Läufe während der Entwicklung | 15 von 15 Risikoklassen getroffen, 15 von 15 mit Fundstelle |
| Grenzfälle Verbot und Hochrisiko (Fälle 4, 9, 10) | je 3 Läufe, 9 von 9 getroffen |
| Läufe mit dem installierten Plugin | Fall 2 (Transparenz), Fall 9 (verboten) und Fall 10 (Hochrisiko), alle getroffen, nach der Korrekturrunde keine Aussage „teilweise“ oder „nicht gedeckt“ |

Was die Zahlen nicht aussagen:

- Die Soll-Werte sind eigene Hypothesen und nicht juristisch geprüft. Gemessen wird Übereinstimmung mit dieser Lesart, nicht Richtigkeit.
- Nur die Grenzfälle liefen mehrfach. Die übrigen Fälle liefen je einmal, teils auf älteren Fragebogen-Versionen und einem anderen Modell.
- Die Klasse ist stabil, die Begründung nicht: Die Zahl der nur teilweise gedeckten Aussagen schwankt zwischen Läufen desselben Falls (z. B. 0 gegenüber 6).

### Vendor-Assessment und Gesamtbewertung

- **Vendor-Assessment:** Während der Entwicklung liefen Tests mit drei realen Anbietern und allen drei Schutzbedarfsstufen, mit dem installierten Plugin ein weiterer Lauf (gleiches Ergebnis wie im Vorlauf). Die Ergebnisse sind nicht veröffentlicht und nicht gegen die Quellen geprüft. Mehrfachläufe fehlen, weil jeder Lauf eine vollständige Web-Recherche braucht.
- **Gesamtbewertung:** zwei Läufe zu einem Fall vor der Umstellung auf das Plugin. Lauf 1 traf die Erwartung, Lauf 2 lag bei der vorab als vertretbar festgelegten Abweichung. ⚠️ Mit dem installierten Plugin ist `assessment` noch nicht eigens getestet. Es nutzt dieselben Subagents wie die beiden getesteten Skills.

## Projektstruktur

| Pfad | Inhalt |
|---|---|
| [`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json) | Marktplatz mit diesem einen Plugin |
| [`plugins/ai-vendor-assessment/`](plugins/ai-vendor-assessment/) | Das Plugin |
| ↳ [`.mcp.json`](plugins/ai-vendor-assessment/.mcp.json) | Browser-Server (Playwright MCP, feste Version) |
| ↳ [`skills/`](plugins/ai-vendor-assessment/skills/) | `assessment`, `vendor-assessment` (mit Quellen-Leitfaden und Abrufregeln), `ai-act-check` |
| ↳ [`agents/`](plugins/ai-vendor-assessment/agents/) | Die sechs Subagents |
| ↳ [`hooks/`](plugins/ai-vendor-assessment/hooks/) | Schranke für die Subagents (Pfade, Abruf-URLs, Browser-Werkzeuge) |
| ↳ [`schema/`](plugins/ai-vendor-assessment/schema/) | Kriterien, Fragebogen, Regeln für das Gesamtbild, Report-Vorlagen |
| ↳ [`references/eu-ai-act.md`](plugins/ai-vendor-assessment/references/eu-ai-act.md) | Datierte Referenz zum AI Act, einzige Rechtsgrundlage der Einstufung |
| ↳ [`references/dsgvo-art28.md`](plugins/ai-vendor-assessment/references/dsgvo-art28.md) | Datierte Referenz zu Art. 28 DSGVO und den Standardvertragsklauseln, Grundlage des Kriteriums AVV |
| [`evals/`](evals/) | Testfälle, Soll-Werte, Auswertungsskript |
| [`tests/`](tests/) | Tests der Schranke |
| [`examples/`](examples/) | Beispielreport mit Prüfberichten und Hinweis zur Auswahl |
| [`reviews/`](reviews/) | Review-Log mit Befunden externer Prüfungen und Prüfauftrag |
| [`CHANGELOG.md`](CHANGELOG.md) | Änderungen je Plugin-Version |
| [`.claude/hooks/`](.claude/hooks/) | Hook für Mitwirkende, siehe [CONTRIBUTING](CONTRIBUTING.md) |

## Mitwirken

Hinweise zu Änderungen, Tests und dem Hook für den YAML-Kopf: [CONTRIBUTING.md](CONTRIBUTING.md).

## Haftungshinweis

Dieses Plugin liefert eine automatisierte Ersteinschätzung auf Basis öffentlich zugänglicher Informationen. Es ist **keine Rechtsberatung** und ersetzt weder eine juristische Prüfung noch ein vollständiges Lieferanten-Audit.

- Ergebnisse können unvollständig, falsch oder veraltet sein und sind vor jeder Verwendung fachlich zu prüfen.
- Die AI-Act-Einstufung beruht ausschließlich auf der datierten Referenz in [`references/eu-ai-act.md`](plugins/ai-vendor-assessment/references/eu-ai-act.md). Die Aktualitätsprüfung erkennt neue Fassungen der Verordnung, aber keine neuen Leitlinien der Kommission und keine nationalen Vorschriften. Eigene Auslegungen sind in der Referenz als solche gekennzeichnet.
- Die Soll-Werte der Eval-Suite sind nicht juristisch geprüft.
- Dieses Repository enthält keine Bewertung namentlich genannter Anbieter. Mit dem Plugin erzeugte Reports sind keine Aussage des Maintainers über den jeweiligen Anbieter.

## Lizenz

[MIT](LICENSE) © 2026 Clemens Fetzer
