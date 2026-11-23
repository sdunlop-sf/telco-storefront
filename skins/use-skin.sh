#!/bin/bash
#
# Swap the live storefront root to a saved skin.
#
#   ./skins/use-skin.sh aai              # copy skins/aai/* over the root files
#   ./skins/use-skin.sh westpac
#   ./skins/use-skin.sh aai --dry-run    # show what would change, touch nothing
#
# A skin is the four root files: app.js, config.js, index.html, styles.css.
# Shared images live in assets/ (every skin's logos sit there side by side).
# This only changes your working copy: review with `git diff`, then commit and
# push to main to make it live on GitHub Pages (~1 min to publish).
# Before switching away from a skin you edited at root, save it back first:
#   cp app.js config.js index.html styles.css skins/<current>/
set -euo pipefail
cd "$(dirname "$0")/.."
SKIN="${1:-}"
[[ -n "$SKIN" && -d "skins/$SKIN" ]] || { echo "usage: $0 <skin> [--dry-run]; skins: $(ls -d skins/*/ | xargs -n1 basename | tr '\n' ' ')"; exit 1; }
FILES=(app.js config.js index.html styles.css)
for f in "${FILES[@]}"; do [[ -f "skins/$SKIN/$f" ]] || { echo "skins/$SKIN/$f missing"; exit 1; }; done
if grep -q "REPLACE_[A-Z]*_CONTACT_ID" "skins/$SKIN/app.js"; then
  echo "WARNING: skins/$SKIN/app.js still has REPLACE_*_CONTACT_ID placeholders (set the persona Contact Ids first)."
fi
if [[ "${2:-}" == "--dry-run" ]]; then
  for f in "${FILES[@]}"; do cmp -s "$f" "skins/$SKIN/$f" && echo "  same     $f" || echo "  changes  $f"; done
  exit 0
fi
for f in "${FILES[@]}"; do cp "skins/$SKIN/$f" "$f"; echo "  + $f <- skins/$SKIN/$f"; done
echo "Root now on skin '$SKIN'. Review: git diff --stat ; publish: commit + push main."
