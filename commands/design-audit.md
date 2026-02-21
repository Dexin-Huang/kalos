---
description: Run mathematical aesthetics audit on a page
argument-hint: [url] [WxH]
allowed-tools: [Read, Bash, Glob, Grep, Write]
---

Run a design audit using the design-audit skill.

Parse the following from `$ARGUMENTS`:
- **URL**: First argument (default: `http://localhost:3000`)
- **WxH**: Second argument, viewport dimensions (default: `1440x900`)

Steps:
1. Run the extraction script: `bash .claude/skills/design-audit/scripts/run-extraction.sh [URL] [WxH]`
2. Read the output from `.claude/skills/design-audit/last-audit.json`
3. Read the formulas from `.claude/skills/design-audit/references/aesthetic-formulas.md`
4. Apply every metric formula to the extracted data and compute scores
5. Produce the full scored report with per-metric breakdown, violations, and top 5 improvements
6. Show the screenshot to the user by reading `.claude/skills/design-audit/last-audit-screenshot.png`
