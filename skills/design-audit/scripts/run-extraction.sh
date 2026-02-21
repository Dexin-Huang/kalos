#!/bin/bash
# run-extraction.sh — Shell wrapper for design-audit extraction via playwright-cli
#
# Usage: bash .claude/skills/design-audit/scripts/run-extraction.sh [url] [WxH]
#
# Defaults:
#   url: http://localhost:3000
#   viewport: 1440x900
#
# Output:
#   .claude/skills/design-audit/last-audit.json
#   .claude/skills/design-audit/last-audit-screenshot.png

set -euo pipefail

URL="${1:-http://localhost:3000}"
VIEWPORT="${2:-1440x900}"
W=$(echo "$VIEWPORT" | cut -dx -f1)
H=$(echo "$VIEWPORT" | cut -dx -f2)
SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
EXTRACT_JS="$SKILL_DIR/scripts/extract-layout.js"
OUTPUT_JSON="$SKILL_DIR/last-audit.json"
OUTPUT_SCREENSHOT="$SKILL_DIR/last-audit-screenshot.png"

echo "Design Audit Extraction"
echo "  URL: $URL"
echo "  Viewport: ${W}x${H}"
echo "  Output: $OUTPUT_JSON"

# Use a dedicated session so it doesn't conflict with other browser work
playwright-cli -s=design-audit open "$URL"
playwright-cli -s=design-audit resize "$W" "$H"
sleep 2  # Let animations settle

# Screenshot
playwright-cli -s=design-audit screenshot --filename="$OUTPUT_SCREENSHOT" --full-page

# Run extraction: load the JS file, evaluate in page, write JSON output
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

# Clean up session
playwright-cli -s=design-audit close

echo "Output: $OUTPUT_JSON"
echo "Screenshot: $OUTPUT_SCREENSHOT"
