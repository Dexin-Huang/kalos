# design-audit-cli

[![npm version](https://img.shields.io/npm/v/design-audit-cli.svg)](https://www.npmjs.com/package/design-audit-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node >=18](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)
[![CI](https://github.com/dexinhuang/design-audit-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/dexinhuang/design-audit-cli/actions/workflows/ci.yml)

> Mathematical aesthetics audit for any web page — installable as a Claude Code skill.

`design-audit-cli` quantifies design quality across 11 mathematical metrics: WCAG contrast, modular type scales, 8pt spacing harmony, golden ratio proportions, alignment axes, Birkhoff aesthetic measure, and more. It works on **any** web page — local dev servers, staging environments, or live production URLs.

The tool installs as a [Claude Code](https://docs.anthropic.com/en/docs/claude-code) skill, so you can run `/design-audit https://yoursite.com` in your Claude Code session and receive a full scored report with a screenshot and top 5 actionable improvements.

---

## Install

```bash
npm install -g design-audit-cli
```

**Prerequisites:**

```bash
# Required peer dependency
npm install -g playwright-cli
```

---

## Quick Start

```bash
# Step 1: Install the Claude Code skill into your project
cd your-project/
design-audit install --skills

# Step 2: Open Claude Code and run a design audit
/design-audit https://yoursite.com
# or with a custom viewport:
/design-audit https://yoursite.com 1920x1080
```

Claude will open the page via playwright-cli, extract layout data, compute all 11 metrics, and produce a full scored report with a screenshot.

---

## Full CLI Usage

```
design-audit install --skills     Copy skill files into .claude/skills/ and .claude/commands/
design-audit run [url] [WxH]      Run layout extraction directly (outputs JSON + screenshot)
design-audit --help               Show this help message
design-audit --version            Show version number

Arguments:
  url     Full URL including scheme (default: http://localhost:3000)
  WxH     Viewport dimensions as WIDTHxHEIGHT (default: 1440x900)

Examples:
  design-audit install --skills
  design-audit run http://localhost:3000
  design-audit run https://example.com 1920x1080
```

---

## Metrics Overview

`design-audit-cli` computes an overall aesthetic score (0–100, grade A–F) from 10 weighted metrics plus 1 bonus metric:

| # | Metric | Weight | What It Checks |
|---|--------|--------|----------------|
| 1 | Modular Scale Consistency | 15% | Font size ratios follow a named typographic scale (Perfect Fourth, Golden Ratio, etc.) |
| 2 | Spacing Harmony | 15% | Margins/padding align to an 8pt grid and follow a geometric progression |
| 3 | Vertical Rhythm | 10% | Line heights align to a consistent base unit (4px or 8px) |
| 4 | WCAG Contrast | 20% | Text/background contrast meets AA (4.5:1) and AAA (7:1) standards |
| 5 | Golden Ratio Proximity | 10% | Layout proportions and section spacing approximate φ = 1.618 |
| 6 | Gestalt Proximity | 5% | Related sibling elements are grouped (inter-group gap ≥ 2× intra-group gap) |
| 7 | Alignment Score | 10% | Elements share alignment axes within 2px tolerance |
| 8 | Line Length | 5% | Text blocks fall in the 45–75 chars/line readability sweet spot |
| 9 | Visual Weight Balance | 5% | Visual center of mass aligns with optical center of page |
| 10 | Birkhoff Aesthetic Measure | 5% | Order-to-complexity ratio (alignment axes / distinct values) |
| 11 | Animation Timing | bonus | Transitions use Material Design standard duration tokens |

**Grade scale:**

| Score | Grade | Meaning |
|-------|-------|---------|
| 90–100 | A | Exceptional harmony |
| 80–89 | B | Strong design system adherence |
| 70–79 | C | Good with notable gaps |
| 60–69 | D | Significant inconsistencies |
| < 60 | F | Needs systematic design review |

---

## Example Output

```
# Design Audit Report
**URL:** https://example.com
**Date:** 2025-02-21T14:00:00Z
**Viewport:** 1440x900
**Overall Score:** 74/100 — Grade C

## Per-Metric Breakdown

### WCAG Contrast — 0.91 — Pass
- 94% of text elements pass AA (4.5:1)
- 3 violations: .nav-link (3.8:1 against #f5f5f5 bg), .caption (3.1:1)
- 67% pass AAA (7:1)

### Modular Scale — 0.82 — Pass
- Detected scale: Perfect Fourth (1.333 ratio)
- Font sizes: 12, 14, 16, 21.3, 28.4, 37.9px — consistent
- 1 outlier: .tag at 13px (does not fit the scale)

### Spacing Harmony — 0.68 — Warn
- 72% of spacing values are 8pt-grid compliant
- Non-compliant: 6px, 10px, 14px (suggest: 8px, 8px, 16px)

...

## Top 5 Actionable Improvements
1. Fix 3 WCAG contrast failures — change .nav-link color to #555 (ratio 5.1:1)
2. Replace 6px/10px spacings with 8px to achieve full 8pt grid compliance
3. Standardize .tag font size to 14px (nearest Perfect Fourth scale value)
4. Add line-height: 1.6 to all <p> elements to lock vertical rhythm to 8px grid
5. Set transition-duration: 200ms on hover states (currently using 180ms)
```

See [`examples/example-report.md`](examples/example-report.md) for a full sample report.

---

## How It Works

1. `design-audit install --skills` copies `SKILL.md`, `extract-layout.js`, `run-extraction.sh`, and `aesthetic-formulas.md` into your project's `.claude/` directory.
2. When you run `/design-audit` in Claude Code, it invokes the shell script which uses `playwright-cli` to open the target URL, take a screenshot, and run `extract-layout.js` inside `page.evaluate()`.
3. The extraction function walks the entire DOM, collecting computed styles: font sizes, spacing, colors, geometry, and animation timing — writing the result to `last-audit.json`.
4. Claude reads the JSON alongside `aesthetic-formulas.md` and applies each metric formula mathematically, computing raw scores, thresholds, and violations.
5. The final report is rendered inline in your Claude Code session, complete with a screenshot so you can see exactly what was audited.

All extraction happens locally — no data leaves your machine.

---

## Requirements

- **Node.js** >= 18 (ESM, `fs`, `child_process`)
- **[playwright-cli](https://www.npmjs.com/package/playwright-cli)** >= 1.50.0 (peer dependency — install globally)
- **[Claude Code](https://docs.anthropic.com/en/docs/claude-code)** for the `/design-audit` skill

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, how to add new metrics, and the pull request process.

---

## License

MIT — see [LICENSE](LICENSE).

Copyright (c) 2025 Dexin Huang
