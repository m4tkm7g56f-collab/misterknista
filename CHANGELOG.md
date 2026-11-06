# Changelog

Versionen des Plugins. Schema und Fragebogen haben eigene Versionsnummern, sie stehen jeweils dabei. Befund-IDs verweisen auf das [Review-Log](reviews/review-log.md).

## 0.3.1 (05.11.2026)

Schema 0.11, Fragebogen 0.8.

### Sicherheit

- **Browser-Werkzeuge auf Liste begrenzt (S01):** Rechercheur und Prüfer dürfen nur Seite laden, Snapshot, Warten und Schließen. Jedes andere Werkzeug des Browser-Servers wird gesperrt, auch solche, die ein späteres Update mitbringt. Die anderen Subagents dürfen den Browser nicht nutzen.
- **Prüfung der geladenen Seite (S01):** Ein PostToolUse-Hook prüft nach jedem Browser-Aufruf die gemeldete Seiten-URL. Führt eine Weiterleitung auf eine gesperrte Adresse, ersetzt er die Ausgabe und löscht einen dabei geschriebenen Snapshot. 12 Tests grün.

### Bekannt und offen

- Die Ersetzung der Ausgabe ist am 05.11.2026 in einer echten Session getestet, mit einem Testhook statt einer echten Weiterleitung auf eine interne Adresse.
- Der Abruf der internen Adresse selbst wird nicht verhindert, nur die Weitergabe des Inhalts. Nachgeladene Inhalte aus dem lokalen Netz und DNS-Rebinding bleiben offen.

## 0.3.0 (03.11.2026)

Schema 0.11, Fragebogen 0.8.

### Sicherheit

- **Schranke (S01, S03):** Ein PreToolUse-Hook begrenzt die Subagents technisch, nicht nur per Anweisung. Lesen nur im Plugin-Ordner und in `reports/`, Schreiben nur in `reports/`. Rechercheur und Prüfer rufen nur öffentliche Hosts über http und https ab, die Aktualitätsprüfung nur ihre zwei festen URLs. Fehlt Node.js, blockiert der Hook die Subagents. Tests in `tests/schranke.test.mjs`.
- **Kein Klick-Werkzeug mehr für den Rechercheur (E07):** Cookie-Banner können nicht mehr akzeptiert werden. ⚠️ Text nur hinter Bannern oder in eingeklappten Bereichen bleibt dadurch eher „nicht abrufbar“.
- **Datenminimierung bei `assessment` (S02):** Der Dienstumfang für den Rechercheur besteht nur aus Produktnamen des Anbieters. Im Modus `dialog` bestätigt der Nutzer ihn. AI-Act- und Gesamt-Dateien sind für Rechercheur und Prüfer gesperrt.

### AI Act

- Art. 50 Abs. 5 in der Referenz präzisiert: keine eigene Pflicht, nur Art und Zeitpunkt der Informationen nach Abs. 1 bis 4 (A04).

### Bekannt und offen

- Die Schranke ist in einer echten Session getestet (10 von 10 Aufrufen wie erwartet), ein vollständiger Vendor-Lauf mit 0.3.0 steht aus. Offen ist vor allem, wie sich das fehlende Klick-Werkzeug auf die Belege auswirkt.
- Abfluss über URLs zu öffentlichen Domains, Umleitungen im Browser und DNS-Rebinding fängt die Schranke nicht ab.

## 0.2.0 (03.11.2026)

Schema 0.11, Fragebogen 0.8.

### Vendor-Assessment

- **AVV nach Art. 28 DSGVO (V01):** Das AVV wird an zehn Pflichtmerkmalen nach Art. 28 Abs. 3 gemessen, mit Praxisvarianten und dem Weg über die Standardvertragsklauseln. Neue Referenz `references/dsgvo-art28.md` mit deutschem und englischem Wortlaut. Regeln für Teilbelege, für die Frist bei Unterabsatz 2, für Rechte an anonymisierten Daten, für die Weitergabe an weitere Auftragsverarbeiter (Abs. 4) und für das Übermittlungsinstrument bei Drittländern.
- **Neues Kriterium BCM (V02):** Verfügbarkeit, Datensicherung und Notfallvorsorge. Ergänzend, ab Schutzbedarf sehr hoch Kernkriterium.
- **AUTH:** Der Begriff „erzwingbar“ ist definiert (E05).
- **TOM:** Der Rechercheur sucht gezielt nach veröffentlichten TOM, auf die das AVV verweist (E10).

### Ablauf und Abruf

- **Abrufregeln** für Rechercheur und Prüfer (E01, E06, E11): Bei einer Challenge wird abgebrochen, robots.txt wird beachtet. Nach HTTP 403 oder 429 ist ein Abruf per Browser erlaubt, mit Kennzeichnung und Pausen. Für Cookie-Banner gelten feste Regeln. Eine andere Darstellung derselben Seite ist nur unter Bedingungen zulässig.
- **Nachrecherche (E04):** Findet der Prüfer Lücken in der Belegliste, ergänzt sie der Rechercheur vor der Korrekturrunde. Der Bewerter korrigiert nur aus der Belegliste.
- **Eigener Browser-Server (E08):** Das Plugin bringt Playwright MCP in fester Version 0.0.83 mit, das Profil liegt nur im Speicher. Ein Chrome-Fenster ist während des Laufs sichtbar. Fehlt der Browser, weist der Skill vor dem Start darauf hin, und der Report trägt „Aussagekraft eingeschränkt“.
- ⚠️ Neue Voraussetzung: Node.js und Google Chrome.

### Bekannt und offen

- Die Cookie-Banner-Regel ist nur eine Anweisung und wurde in Testläufen nicht immer eingehalten (E07). Behoben in 0.3.0.
- S01, S02 und S03 (technische Begrenzung von Schreibpfaden und Abrufen, Datenminimierung) sind offen. Behoben in 0.3.0.

## 0.1.1

Fragebogen 0.8.

- Emotionserkennung im Fragebogen auf biometrische Daten begrenzt (A01), neuer Testfall 11.
- Kleine Befunde aus Prüfung P1 behoben (A02, A03, K01, K02). Die README-Aussage zu S02 ist korrigiert.

## 0.1.0 (27.10.2026)

Erste öffentliche Version.
