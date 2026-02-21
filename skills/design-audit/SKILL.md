---
name: design-audit
description: Measure layout aesthetics mathematically. Use when the user asks to "audit design", "measure layout", "check spacing harmony", "run design audit", "evaluate aesthetics", or discusses golden ratio compliance, WCAG contrast, modular scales, or visual rhythm.
---

# Design Audit Skill

You are performing a mathematical aesthetics audit on a web page. Follow these steps precisely.

## Prerequisites

- `playwright-cli` must be available (globally installed or via `npx playwright-cli`)

## Step 1: Extract Layout Data

Run the extraction shell script (which uses `playwright-cli` internally):

```bash
bash .claude/skills/design-audit/scripts/run-extraction.sh [URL] [WxH]
```

- Default URL: `http://localhost:3000`
- Default viewport: `1440x900`
- Output: `.claude/skills/design-audit/last-audit.json`
- Screenshot: `.claude/skills/design-audit/last-audit-screenshot.png`

If the script fails (e.g., page not running), inform the user and suggest they start the dev server first.

## Step 2: Read the Data

Read the output JSON:
- `.claude/skills/design-audit/last-audit.json`

Read the formulas reference:
- `.claude/skills/design-audit/references/aesthetic-formulas.md`

## Step 3: Apply All Metrics

Apply each of the 11 metrics from `aesthetic-formulas.md` to the extracted data. For each metric, compute:

1. **Raw score** (0.0–1.0)
2. **Status**: Pass / Warn / Fail (per thresholds in the reference)
3. **Key findings**: specific elements or values that contribute to the score
4. **Violations**: concrete items that fail the metric, with selectors

## Step 4: Compute Overall Score

Use the weighted average formula from the reference doc. Report the score as 0–100 with a letter grade.

## Step 5: Produce the Report

Format the report as:

```
# Design Audit Report
**URL:** [url]
**Date:** [timestamp]
**Viewport:** [WxH]
**Overall Score:** [score]/100 — Grade [letter]

## Per-Metric Breakdown

### [Metric Name] — [score] — [Pass/Warn/Fail]
[Key findings, violations, specific values]

... (all 11 metrics) ...

## Top 5 Actionable Improvements
1. [Highest-impact fix with specific guidance]
2. ...
3. ...
4. ...
5. ...
```

## Step 6 (Optional): Save Report

If the user requests it, save the report to:
`.claude/skills/design-audit/reports/audit-[timestamp].md`

## Notes

- Always show the screenshot to the user (read the PNG file) so they can see what was audited
- When identifying violations, include the CSS selector and the specific problematic value
- For WCAG contrast failures, include the foreground color, background color, computed ratio, and required ratio
- For modular scale outliers, suggest the nearest scale-conforming value
- Compare findings against `tailwind.config.js` when available to check if violations stem from the design system or from overrides
