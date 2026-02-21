---
name: design-audit
description: Measure layout aesthetics mathematically. Use when the user asks to "audit design", "measure layout", "check spacing harmony", "run design audit", "evaluate aesthetics", or discusses golden ratio compliance, WCAG contrast, modular scales, or visual rhythm.
---

# Design Audit Skill

Perform a mathematical aesthetics audit on a web page.

## Prerequisites

- `playwright-cli` must be available globally or via `npx`

## Step 1: Extract Layout Data

```bash
bash .claude/skills/design-audit/scripts/run-extraction.sh [URL] [WxH]
```

- Default URL: `http://localhost:3000`
- Default viewport: `1440x900`
- Output: `.claude/skills/design-audit/last-audit.json`
- Screenshot: `.claude/skills/design-audit/last-audit-screenshot.png`

If the script fails, tell the user to start their dev server first.

## Step 2: Read the Data

Read `.claude/skills/design-audit/last-audit.json` and `.claude/skills/design-audit/references/aesthetic-formulas.md`.

## Step 3: Apply All Metrics

Apply each of the 11 metrics from `aesthetic-formulas.md`. For each, compute:
1. Raw score (0.0-1.0)
2. Status: Pass / Warn / Fail
3. Key findings with specific elements and values
4. Violations with selectors

## Step 4: Compute Overall Score

Weighted average per the reference doc. Report as 0-100 with letter grade.

## Step 5: Produce the Report

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
```

## Notes

- Show the screenshot to the user so they can see what was audited
- Include CSS selectors and specific values in violations
- For WCAG failures, include foreground color, background color, computed ratio, and required ratio
- Compare against `tailwind.config.js` when available
