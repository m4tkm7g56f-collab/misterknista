#!/bin/sh
# Startet die Schranke (schranke.mjs). Fehlt Node.js, werden Aufrufe der Plugin-Subagents blockiert,
# alle anderen Aufrufe laufen durch. So fällt die Schranke nicht unbemerkt aus.

if command -v node >/dev/null 2>&1; then
  exec node "$(dirname "$0")/schranke.mjs"
fi

if grep -Eq '"agent_type"[[:space:]]*:[[:space:]]*"ai-vendor-assessment:'; then
  echo "Schranke des Plugins nicht aktiv, weil Node.js fehlt. Aufruf blockiert." >&2
  exit 2
fi
exit 0
