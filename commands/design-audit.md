---
description: Run mathematical aesthetics audit on a page
argument-hint: [url] [WxH]
allowed-tools: [Read, Bash, Glob, Grep, Write]
---

Run a design audit using the design-audit skill.

Parse from `$ARGUMENTS`:
- **URL**: First argument (default: `http://localhost:3000`)
- **WxH**: Second argument (default: `1440x900`)

Steps:
1. Run extraction: `bash .claude/skills/design-audit/scripts/run-extraction.sh [URL] [WxH]`
2. Read `.claude/skills/design-audit/last-audit.json`
3. Read `.claude/skills/design-audit/references/aesthetic-formulas.md`
4. Apply every metric formula and compute scores
5. Produce the full scored report with per-metric breakdown, violations, and top 5 improvements
6. Show the screenshot by reading `.claude/skills/design-audit/last-audit-screenshot.png`
