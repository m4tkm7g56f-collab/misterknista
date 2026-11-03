# Abrufregeln für Rechercheur und Prüfer

Gelten für jeden Abruf einer Webseite, mit WebFetch und mit den Browser-Werkzeugen. Die Regeln werden von oben nach unten geprüft, die erste zutreffende gilt.

## 1. Abbruch

Die Seite gilt als „nicht abrufbar“ (Rechercheur) bzw. „nicht erreichbar“ (Prüfer), wenn:

- eine Challenge erscheint: CAPTCHA, „Verify you are human“, „Checking your browser“, „Just a moment…“ oder eine andere Zwischenseite, auch wenn sie sich selbst lösen würde. Nicht lösen, nicht abwarten, nicht erneut versuchen.
- ein Login, ein Zugangsformular (z. B. E-Mail für Dokumentenzugang) oder eine NDA verlangt wird.
- robots.txt den Pfad verbietet (Abschnitt 2).
- der Browser dieselbe Abwehr zeigt wie WebFetch (z. B. „Access denied“, HTTP 403).

## 2. robots.txt

- Vor dem ersten Abruf einer Domain `https://<domain>/robots.txt` abrufen, mit WebFetch. Wehrt WebFetch ab, einmal per Browser.
- Maßgeblich ist die Gruppe für `Claude-User`. Gibt es keine, gilt die Gruppe für `*`. Verbote nur für andere Agenten (z. B. `ClaudeBot`, `GPTBot`) gelten nicht.
- Ist robots.txt nicht abrufbar: bei HTTP 4xx (auch 403 und 429) keine Einschränkung durch robots.txt, bei HTTP 5xx oder Netzwerkfehler die Domain nicht abrufen (RFC 9309). Ob die Seiten selbst abrufbar sind, entscheiden Abschnitt 1 und 3.

## 3. Abwehr nur des Abrufwerkzeugs

Liefert WebFetch HTTP 403 oder 429 und greift Abschnitt 1 nicht:

- **403:** ein Abruf per Browser je URL.
- **429:** Abrufrate senken. Zwischen zwei Abrufen dieser Domain mindestens 10 Sekunden warten (`browser_wait_for` mit Zeitangabe), auch per Browser. Höchstens ein erneuter Versuch je URL.
- Hat eine Domain WebFetch einmal abgewehrt, dürfen weitere URLs dieser Domain direkt per Browser abgerufen werden, ohne neuen Versuch mit WebFetch. Das vermeidet zusätzliche Abrufe auf einer Domain, die schon abwehrt. Bei 429 gelten die Pausen weiter.
- Jeder so gewonnene Beleg wird gekennzeichnet (Abschnitt 5).

## 4. Cookie-Banner

- Nicht anklicken, wenn der Seiteninhalt im Snapshot lesbar ist.
- Sonst nur „Ablehnen“, „Nur notwendige“ oder eine gleichwertige Schaltfläche wählen.
- Gibt es sie nicht: Einstellungen öffnen, keine Kategorie anhaken, speichern.
- Ist nicht eindeutig, welche Schaltfläche ein Klick auslöst, nicht klicken. Die Seite gilt dann als „nicht abrufbar“ bzw. „nicht erreichbar“, mit Grund.

## 5. Kennzeichnung

- Rechercheur: Abschnitt „Abruf per Browser nach Abwehr“ in der Belegliste, je Domain mit Art der Abwehr (403 oder 429), Ergebnis der robots.txt-Prüfung und Q-Nummern.
- Prüfer: Abschnitt „Abruf per Browser nach Abwehr“ im Prüfbericht, je Domain mit Art der Abwehr und Q-Nummern.
- Seiten, die nur per JavaScript Inhalt laden (WebFetch liefert eine leere Seite, keine Abwehr), werden ohne Kennzeichnung per Browser abgerufen.

## 6. Andere Darstellung derselben Seite

Ist der Inhalt einer abgerufenen Seite nicht lesbar (z. B. eingeklappte Bereiche, ein Banner überlagert den Text), darf eine andere Darstellung desselben Inhalts abgerufen werden, etwa eine JSON-Schnittstelle, eine Druck- oder PDF-Fassung. Voraussetzungen:

- Sie liegt auf demselben Host oder ist von der Seite selbst verlinkt.
- robots.txt verbietet den Pfad nicht (Abschnitt 2).
- Sie verlangt keinen Login, keinen API-Schlüssel und kein Token.
- Abschnitt 1 greift für die Seite nicht. Eine andere Darstellung darf nie dazu dienen, eine Abwehr nach Abschnitt 1 zu umgehen.

Als Quelle gilt die URL der Seite. Die tatsächlich abgerufene URL steht im Vermerk: beim Rechercheur in der Spalte Aussage der Belegzeile, beim Prüfer beim Befund im Prüfbericht.
