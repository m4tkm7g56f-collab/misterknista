# Changelog

Versionen des Plugins. Schema und Fragebogen haben eigene Versionsnummern, sie stehen jeweils dabei. Befund-IDs verweisen auf das [Review-Log](reviews/review-log.md).

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

- Die Cookie-Banner-Regel ist nur eine Anweisung und wurde in Testläufen nicht immer eingehalten (E07). Eine technische Begrenzung ist für S01 vorgemerkt.
- S01, S02 und S03 (technische Begrenzung von Schreibpfaden und Abrufen, Datenminimierung) sind offen.

## 0.1.1

Fragebogen 0.8.

- Emotionserkennung im Fragebogen auf biometrische Daten begrenzt (A01), neuer Testfall 11.
- Kleine Befunde aus Prüfung P1 behoben (A02, A03, K01, K02). Die README-Aussage zu S02 ist korrigiert.

## 0.1.0 (27.10.2026)

Erste öffentliche Version.
