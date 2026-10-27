#!/usr/bin/env ruby
# Vergleicht AI-Act-Reports mit den Soll-Werten in evals/soll.yaml.
#
# Einzelne Läufe auswerten (ohne --speichern nur Anzeige):
#   ruby evals/auswerten.rb [--speichern] [--modell NAME] FALL=REPORT [FALL=REPORT ...]
#   Beispiel: ruby evals/auswerten.rb --speichern --modell sonnet 9=reports/ai-act_x.md
#
# Übersicht über alle gespeicherten Läufe mit Trefferquote:
#   ruby evals/auswerten.rb --uebersicht
#
# Das Skript liest nur die Ergebnistabelle des Reports (Vorlage: schema/ai-act-report-template.md).
# Es bewertet nicht, ob die Begründung im Report stimmt. Das bleibt Aufgabe des Prüfers.

require "csv"
require "yaml"
require "date"

Encoding.default_external = Encoding::UTF_8

BASIS = File.expand_path("..", __dir__)
SOLL = YAML.safe_load(File.read(File.join(BASIS, "evals/soll.yaml")))
ERGEBNISSE = File.join(BASIS, "evals/ergebnisse.csv")
SPALTEN = %w[datum fall lauf modell fragebogen report soll_klasse ist_klasse klasse_treffer fundstelle_treffer sicherheit pruefvorbehalte].freeze

# Bezeichnungen laut ergebnis.risikoklassen im Fragebogen
KLASSEN = {
  "ausserhalb_anwendungsbereich" => /Außerhalb des Anwendungsbereichs/,
  "verboten" => /Verbotene Praktik/,
  "hochrisiko_nicht_ausgeschlossen" => /Hochrisiko nicht ausgeschlossen/,
  "voraussichtlich_nicht_hochriskant" => /Voraussichtlich nicht hochriskant/,
  "hochrisiko" => /Hochrisiko/,
  "transparenz" => /Transparenzpflichten/,
  "keine_besonderen" => /Keine besonderen Pflichten/
}.freeze

def tabellenzeile(text, feld)
  zeile = text.lines.find { |l| l.start_with?("| #{feld} |") }
  zeile && zeile.split("|", 3)[2].to_s.strip.chomp("|").strip
end

# Erste im Text genannte Klasse. Bei gleicher Position gewinnt die längere Bezeichnung,
# damit „Hochrisiko nicht ausgeschlossen“ nicht als „Hochrisiko“ gelesen wird.
def klasse_aus(zeile)
  treffer = KLASSEN.map do |id, muster|
    m = muster.match(zeile)
    m && [m.begin(0), -m[0].length, id]
  end.compact
  treffer.min&.last || "nicht_erkannt"
end

def lies_report(pfad)
  text = File.read(pfad)
  # Reports vor Fragebogen 0.4 nennen die Zeile nur „Risikoklasse“
  klassenzeile = tabellenzeile(text, "Risikoklasse des Systems") || tabellenzeile(text, "Risikoklasse") || ""
  kopfzeile = text.lines.find { |l| l.start_with?("**") && l.include?("Prüfvorbehalt") } || ""
  {
    klassenzeile: klassenzeile,
    klasse: klasse_aus(klassenzeile),
    datum: tabellenzeile(text, "Bewertungsdatum").to_s[/\d{2}\.\d{2}\.\d{4}/] || Date.today.strftime("%d.%m.%Y"),
    fragebogen: tabellenzeile(text, "Fragebogen-Version").to_s[/\d+\.\d+/] || "?",
    sicherheit: tabellenzeile(text, "Sicherheit").to_s[/\A(bestätigt|vorläufig|offen)/i, 1]&.downcase || "?",
    pruefvorbehalte: kopfzeile[/(\d+) Prüfvorbehalt/, 1] || "?"
  }
end

def soll_fuer(fall)
  SOLL["ai_act"].find { |f| f["fall"] == fall } or abort "Fall #{fall} fehlt in evals/soll.yaml"
end

def gespeicherte_laeufe
  File.exist?(ERGEBNISSE) ? CSV.read(ERGEBNISSE, headers: true).map(&:to_h) : []
end

def auswerten(paare, modell, speichern)
  bisher = gespeicherte_laeufe
  neue = paare.map do |paar|
    fall_text, pfad = paar.split("=", 2)
    abort "Erwartet FALL=REPORT, erhalten: #{paar}" unless pfad && File.file?(pfad)
    fall = Integer(fall_text)
    soll = soll_fuer(fall)
    ist = lies_report(pfad)
    lauf = bisher.count { |z| z["fall"] == fall.to_s } + 1
    {
      "datum" => ist[:datum], "fall" => fall.to_s, "lauf" => lauf.to_s,
      "modell" => modell, "fragebogen" => ist[:fragebogen], "report" => File.basename(pfad),
      "soll_klasse" => soll["klasse"], "ist_klasse" => ist[:klasse],
      "klasse_treffer" => (ist[:klasse] == soll["klasse"] ? "ja" : "nein"),
      "fundstelle_treffer" => (ist[:klassenzeile].include?(soll["fundstelle"]) ? "ja" : "nein"),
      "sicherheit" => ist[:sicherheit], "pruefvorbehalte" => ist[:pruefvorbehalte]
    }
  end

  puts "| Fall | Soll | Ist | Klasse | Fundstelle | Sicherheit | Prüfvorbehalte | Fragebogen |"
  puts "|---|---|---|---|---|---|---|---|"
  neue.each do |z|
    puts "| #{z['fall']} | #{z['soll_klasse']} | #{z['ist_klasse']} | #{z['klasse_treffer']} | #{z['fundstelle_treffer']} | #{z['sicherheit']} | #{z['pruefvorbehalte']} | #{z['fragebogen']} |"
  end

  return unless speichern
  neu_anlegen = !File.exist?(ERGEBNISSE)
  CSV.open(ERGEBNISSE, "a") do |csv|
    csv << SPALTEN if neu_anlegen
    neue.each { |z| csv << SPALTEN.map { |s| z[s] } }
  end
  puts "\n#{neue.size} Lauf/Läufe in evals/ergebnisse.csv gespeichert."
end

def version_gilt?(fragebogen, seit)
  Gem::Version.new(fragebogen) >= Gem::Version.new(seit)
rescue ArgumentError
  false
end

def uebersicht
  laeufe = gespeicherte_laeufe
  abort "Noch keine gespeicherten Läufe in evals/ergebnisse.csv" if laeufe.empty?

  puts "Gezählt werden nur Läufe mit einer Fragebogen-Version ab „seit“ des Soll-Werts."
  puts
  puts "| Fall | Kurz | Soll | Läufe (gezählt/gesamt) | Klasse getroffen | Fundstelle getroffen | Ergebnisse |"
  puts "|---|---|---|---|---|---|---|"
  summe = { gezaehlt: 0, klasse: 0, fundstelle: 0 }
  SOLL["ai_act"].each do |soll|
    alle = laeufe.select { |z| z["fall"] == soll["fall"].to_s }
    next if alle.empty?
    gezaehlt = alle.select { |z| version_gilt?(z["fragebogen"], soll["seit"]) }
    k = gezaehlt.count { |z| z["klasse_treffer"] == "ja" }
    f = gezaehlt.count { |z| z["fundstelle_treffer"] == "ja" }
    summe[:gezaehlt] += gezaehlt.size
    summe[:klasse] += k
    summe[:fundstelle] += f
    ergebnisse = alle.map { |z| "#{z['ist_klasse']} (#{z['fragebogen']})" }.join(", ")
    puts "| #{soll['fall']} | #{soll['kurz']} | #{soll['klasse']} | #{gezaehlt.size}/#{alle.size} | #{k}/#{gezaehlt.size} | #{f}/#{gezaehlt.size} | #{ergebnisse} |"
  end
  return if summe[:gezaehlt].zero?
  quote = (100.0 * summe[:klasse] / summe[:gezaehlt]).round
  puts
  puts "Trefferquote Risikoklasse: #{summe[:klasse]} von #{summe[:gezaehlt]} gezählten Läufen (#{quote} %)."
  puts "Fundstelle genannt: #{summe[:fundstelle]} von #{summe[:gezaehlt]}."
end

if ARGV.include?("--uebersicht")
  uebersicht
else
  args = ARGV.dup
  speichern = !args.delete("--speichern").nil?
  modell = "unbekannt"
  if (i = args.index("--modell"))
    modell = args[i + 1] or abort "--modell braucht einen Namen"
    args.slice!(i, 2)
  end
  abort "Aufruf: ruby evals/auswerten.rb [--speichern] [--modell NAME] FALL=REPORT ... | --uebersicht" if args.empty?
  auswerten(args, modell, speichern)
end
