#!/bin/bash
# run-extraction.sh — Extract layout data via playwright-cli
# Usage: bash run-extraction.sh [url] [WxH]
# Output: last-audit.json + last-audit-screenshot.png in the skill directory

set -euo pipefail

if ! command -v playwright-cli &>/dev/null; then
  echo "Error: playwright-cli not found. Install with: npm i -g playwright-cli" >&2
  exit 1
fi

URL="${1:-http://localhost:3000}"
VIEWPORT="${2:-1440x900}"

if ! echo "$VIEWPORT" | grep -qE '^[0-9]+x[0-9]+$'; then
  echo "Error: Invalid viewport '${VIEWPORT}'. Expected WIDTHxHEIGHT, e.g. 1440x900." >&2
  exit 1
fi

W=$(echo "$VIEWPORT" | cut -dx -f1)
H=$(echo "$VIEWPORT" | cut -dx -f2)
SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
EXTRACT_JS="$SKILL_DIR/scripts/extract-layout.js"
OUTPUT_JSON="$SKILL_DIR/last-audit.json"
OUTPUT_SCREENSHOT="$SKILL_DIR/last-audit-screenshot.png"

echo "Extracting: $URL @ ${W}x${H}"

playwright-cli -s=design-audit open "$URL"
playwright-cli -s=design-audit resize "$W" "$H"
sleep 2

playwright-cli -s=design-audit screenshot --filename="$OUTPUT_SCREENSHOT" --full-page

playwright-cli -s=design-audit run-code "async page => {
  const fs = require('fs');
  const extractFn = fs.readFileSync('$EXTRACT_JS', 'utf8');
  const data = await page.evaluate(new Function('return (' + extractFn + ')()'));
  data.extraction = {
    tool: 'playwright-cli',
    viewportWidth: $W,
    viewportHeight: $H,
    screenshotPath: '$OUTPUT_SCREENSHOT',
    url: '$URL'
  };
  fs.writeFileSync('$OUTPUT_JSON', JSON.stringify(data, null, 2));
  return 'Extracted ' + data.elements.length + ' elements';
}"

playwright-cli -s=design-audit close

echo "Done: $OUTPUT_JSON"
