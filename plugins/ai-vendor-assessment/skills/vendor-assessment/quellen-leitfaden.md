# Quellen-Leitfaden

Typische Fundorte je Kriterium. Hinweise für die Suche, kein Beleg. Was hier steht, ist für den konkreten Anbieter immer erst durch Abruf zu bestätigen.

## Allgemeine Einstiegspunkte

- Trust Center bzw. Security-Seite: Pfade wie `/trust`, `/security`, `/compliance`, Subdomains wie `trust.<domain>`, `security.<domain>`
- Rechtliches: `/legal`, `/privacy`, `/dpa`, `/terms`
- `https://<domain>/.well-known/security.txt`
- Suchanfragen nach dem Muster `"<Anbieter>" <Begriff>`, z. B. `"<Anbieter>" DPA`, `"<Anbieter>" subprocessors`, `"<Anbieter>" SOC 2`

## ZERT

- Trust Center, Compliance-Seite, Zertifikatsdokumente (PDF)
- Register der Zertifizierungsstellen, sofern öffentlich durchsuchbar (Belegstufe A)
- Beim BSI C5 den Prüfbericht bzw. die Bescheinigung des Anbieters
- Auf Geltungsbereich (Scope), Zertifizierungsstelle und Gültigkeit achten

## HOST

- Dokumentation zu Datenresidenz, Rechenzentren, Regionen
- AVV/DPA (Abschnitte zu Verarbeitungsorten und Übermittlungen)
- Subprozessorenliste (Standorte)
- Support-Bedingungen (Drittlandzugriff durch Support)

## SUBP

- Seite „Subprocessors“ bzw. „Unterauftragsverarbeiter“, oft im Legal- oder Trust-Bereich
- Abo-Möglichkeit für Änderungen (Formular, RSS, E-Mail)

## AVV

- DPA bzw. AVV als Webseite oder PDF
- Nutzungsbedingungen (Einbeziehung per Click-Through)
- Hinweise, dass das DPA nur auf Anfrage oder nur in bestimmten Tarifen gilt

## AUTH

- Produktdokumentation bzw. Help Center: „SSO“, „SAML“, „SCIM“, „two-factor“, „MFA“, „enforce“
- Preisseite (Tarifbindung von SSO)

## INC

Reihenfolge laut Schema (`quellen_reihenfolge`), alle Stufen abarbeiten:

1. **Anbieter:** Statusseite (häufig `status.<domain>`), Security-Advisories, Security-Blog, Post-Mortems
2. **Behörden:**
   - CISA KEV als JSON-Feed abrufen und nach dem Anbieternamen in `vendorProject`, `product`, `vulnerabilityName` und `shortDescription` filtern. `catalogVersion` als Stand angeben:
     `https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json`
     (Die Suchfunktion der KEV-Webseite filtert bei Abruf ohne Browser nicht zuverlässig.)
   - Entscheidungen von Datenschutzbehörden (Suche `"<Anbieter>" Datenschutzbehörde Bußgeld` bzw. `"<Anbieter>" DPA fine`)
   - Bei börsennotierten US-Unternehmen: SEC-Meldungen zu Cybersecurity-Vorfällen
3. **NVD**, Stichwortsuche per API (JSON):
   `https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=<Anbieter>&pubStartDate=<YYYY-MM-DD>T00:00:00.000&pubEndDate=<YYYY-MM-DD>T23:59:59.999`
   - Zeitraum der API höchstens 120 Tage je Abfrage, für 36 Monate daher ohne Datumsfilter abfragen und nach Veröffentlichungsdatum filtern
   - Stichwortsuche liefert Fremdtreffer (Wort im Beschreibungstext). Nur CVEs zählen, deren betroffenes Produkt (CPE oder Beschreibung) eindeutig dem Anbieter gehört
   - Im Report jede zugeordnete CVE auf ihre Detailseite verlinken: `https://nvd.nist.gov/vuln/detail/<CVE-ID>`
4. **Presse und Forschung:** `"<Anbieter>" breach`, `"<Anbieter>" security incident`, `"<Anbieter>" vulnerability`, `"<Anbieter>" Datenleck`, jeweils mit Jahresangaben im Betrachtungszeitraum (Belegstufe C)

Jede Anfrage ins Suchprotokoll, mit Stufe.

## KRYPT

- Security-Whitepaper, Trust Center, Dokumentation zu „encryption at rest“ und „in transit“
- Hinweise auf BYOK, CMK, „customer-managed keys“

## VULN

- `security.txt`, Seite „Responsible Disclosure“ bzw. „Vulnerability Disclosure Policy“
- Bug-Bounty-Plattformen (Programmseiten des Anbieters)
- Trust Center (Aussagen zu Pentests, Häufigkeit, externe Prüfer)

## KIDAT

- Seiten zu KI-Funktionen, „AI“, „Trust“, „Data usage“, „Model training“
- Datenschutzerklärung und DPA (Abschnitte zu KI, Training, Aufbewahrung)
- Subprozessorenliste (externe KI-Anbieter)
- Unterschiede zwischen Free-, Business- und Enterprise-Tarifen beachten
