#!/usr/bin/env ruby
# Prüft den YAML-Kopf von Skill- und Agent-Dateien.
#
# Als Hook (PostToolUse nach Write/Edit): liest den Hook-Aufruf als JSON von stdin
# und prüft die geänderte Datei, falls sie eine SKILL.md oder Agent-Datei ist.
# Manuell: ruby .claude/hooks/check-frontmatter.rb --alle
#
# Hintergrund: Ein ungültiger YAML-Kopf (z. B. ein argument-hint, der mit "[" beginnt)
# lässt Claude Code den Kopf stillschweigend verwerfen. Werkzeugsperren wie
# disallowed-tools wirken dann nicht mehr. `claude plugin validate` erkennt das nicht.
#
# Exit 0 = in Ordnung oder nicht zuständig, Exit 2 = Fehler (Meldung auf stderr an Claude).

require "json"
require "yaml"

Encoding.default_external = Encoding::UTF_8

PROJEKT = ENV["CLAUDE_PROJECT_DIR"] || File.expand_path("../..", __dir__)
WERKZEUG_FELDER = %w[allowed-tools disallowed-tools tools disallowedTools].freeze

# Skills und Agents liegen im Plugin unter plugins/<name>/skills und plugins/<name>/agents
def zustaendig?(pfad)
  pfad.match?(%r{/plugins/[^/]+/skills/[^/]+/SKILL\.md\z}) || pfad.match?(%r{/plugins/[^/]+/agents/[^/]+\.md\z})
end

def erwarteter_name(pfad)
  if pfad.end_with?("/SKILL.md")
    File.basename(File.dirname(pfad))
  else
    File.basename(pfad, ".md")
  end
end

def pruefe(pfad)
  fehler = []
  text = File.read(pfad)
  kopf = text[/\A---\n(.*?)\n---\n/m, 1]
  return ["kein YAML-Kopf zwischen --- und --- am Dateianfang"] if kopf.nil?

  begin
    daten = YAML.safe_load(kopf)
  rescue Psych::Exception => e
    return ["YAML-Kopf ist ungültig: #{e.message.lines.first.strip}"]
  end
  return ["YAML-Kopf ist keine Schlüssel-Wert-Liste"] unless daten.is_a?(Hash)

  %w[name description].each do |feld|
    wert = daten[feld]
    fehler << "Pflichtfeld '#{feld}' fehlt oder ist leer" unless wert.is_a?(String) && !wert.strip.empty?
  end

  name = erwarteter_name(pfad)
  if daten["name"].is_a?(String) && daten["name"] != name
    fehler << "name '#{daten['name']}' passt nicht zum Datei- bzw. Ordnernamen '#{name}'"
  end

  WERKZEUG_FELDER.each do |feld|
    next unless daten.key?(feld)
    wert = daten[feld]
    gueltig = wert.is_a?(String) || (wert.is_a?(Array) && wert.all? { |w| w.is_a?(String) })
    fehler << "Feld '#{feld}' muss Text oder eine Liste von Texten sein, ist aber #{wert.class}" unless gueltig
  end

  fehler
end

pfade =
  if ARGV.first == "--alle"
    Dir.glob(File.join(PROJEKT, "plugins/*/skills/*/SKILL.md")) + Dir.glob(File.join(PROJEKT, "plugins/*/agents/*.md"))
  elsif ARGV.any?
    ARGV.map { |p| File.expand_path(p) }
  else
    eingabe = JSON.parse($stdin.read) rescue {}
    datei = eingabe.dig("tool_input", "file_path")
    datei ? [datei] : []
  end

befunde = {}
pfade.select { |p| zustaendig?(p) && File.file?(p) }.each do |p|
  f = pruefe(p)
  befunde[p] = f unless f.empty?
end

if befunde.empty?
  puts "YAML-Kopf in Ordnung (#{pfade.size} Datei(en) geprüft)" if ARGV.any?
  exit 0
end

befunde.each do |p, f|
  warn "YAML-Kopf fehlerhaft in #{p.sub("#{PROJEKT}/", '')}:"
  f.each { |z| warn "  - #{z}" }
end
warn "Bitte korrigieren. Mit fehlerhaftem Kopf ignoriert Claude Code u. a. Werkzeugsperren."
exit 2
