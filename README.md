# kalos

[![npm version](https://img.shields.io/npm/v/kalos.svg)](https://www.npmjs.com/package/kalos)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node >=18](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)
[![CI](https://github.com/Dexin-Huang/kalos/actions/workflows/ci.yml/badge.svg)](https://github.com/Dexin-Huang/kalos/actions/workflows/ci.yml)

> Mathematical aesthetics audit for any web page — installable as a Claude Code skill.

Quantifies design quality across 11 metrics: WCAG contrast, modular type scales, 8pt spacing harmony, golden ratio proportions, alignment axes, Birkhoff aesthetic measure, and more. Works on any URL — localhost, staging, or production.

Installs as a [Claude Code](https://docs.anthropic.com/en/docs/claude-code) skill. Run `/design-audit https://yoursite.com` to get a scored report with screenshot and top 5 fixes.

## Why

Design quality is measurable. Most tools just don't measure it.

In 1933, mathematician George Birkhoff proposed that aesthetic experience could be expressed as a ratio: order divided by complexity. Ninety years later, we still ship websites without measuring either.

Users form aesthetic judgments in 50 milliseconds (Lindgaard et al., 2006). Those snap judgments predict perceived usability (Tractinsky et al., 2000) and trust (Lavie & Tractinsky, 2004). Design quality isn't subjective decoration — it's a measurable property with measurable business impact.

Yet existing tools leave a gap. Lighthouse checks performance. Axe checks accessibility. Nothing checks whether your live page follows the mathematical principles designers have formalized over a century — from Müller-Brockmann's grid systems (1968) to Bringhurst's typographic scales (2004) to Ngo, Teo, and Byrne's computational aesthetics (2003).

kalos fills that gap. It opens your page in a real browser, extracts computed styles, and scores them against 11 metrics grounded in design theory and perceptual psychology. The output isn't a pass/fail badge — it's a scored report with specific selectors, values, and fixes.

See [REFERENCES.md](REFERENCES.md) for the full citation list.

## Install

```bash
npm install -g kalos
# peer dependency
npm install -g playwright-cli
```

## Quick Start

```bash
# Install the skill into your project
cd your-project/
kalos install --skills

# Run in Claude Code
/design-audit https://yoursite.com
# or with a custom viewport:
/design-audit https://yoursite.com 1920x1080
```

Claude opens the page via playwright-cli, extracts layout data, computes all 11 metrics, and produces a scored report with a screenshot.

## CLI Usage

```
kalos install --skills     Copy skill files into .claude/skills/ and .claude/commands/
kalos run [url] [WxH]      Run layout extraction directly (outputs JSON + screenshot)
kalos --help               Show help
kalos --version            Show version

Arguments:
  url     Full URL including scheme (default: http://localhost:3000)
  WxH     Viewport dimensions as WIDTHxHEIGHT (default: 1440x900)

Examples:
  kalos install --skills
  kalos run http://localhost:3000
  kalos run https://example.com 1920x1080
```

## Metrics

Overall aesthetic score (0-100, grade A-F) from 10 weighted metrics plus 1 bonus:

| # | Metric | Weight | What It Checks |
|---|--------|--------|----------------|
| 1 | Modular Scale Consistency | 15% | Font size ratios follow a named typographic scale |
| 2 | Spacing Harmony | 15% | Margins/padding align to a detected grid unit |
| 3 | Vertical Rhythm | 10% | Line heights align to a consistent base unit |
| 4 | WCAG Contrast | 20% | Text/background contrast meets AA and AAA standards |
| 5 | Proportional Harmony | 5% | Layout proportions follow consistent ratios (including φ = 1.618) |
| 6 | Gestalt Proximity | 5% | Related elements are grouped with clear separation |
| 7 | Alignment Score | 10% | Elements share alignment axes within 2px |
| 8 | Line Length | 5% | Text blocks fall in the 45-75 chars/line sweet spot |
| 9 | Visual Weight Balance | 10% | Visual center of mass aligns with optical center |
| 10 | Birkhoff Aesthetic Measure | 5% | Order-to-complexity ratio |
| 11 | Animation Timing | bonus | Transitions use standard duration tokens |

| Score | Grade |
|-------|-------|
| 90-100 | A |
| 80-89 | B |
| 70-79 | C |
| 60-69 | D |
| < 60 | F |

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

## How It Works

1. `kalos install --skills` copies the skill files into `.claude/`.
2. `/design-audit` invokes playwright-cli to open the URL, take a screenshot, and run `extract-layout.js` via `page.evaluate()`.
3. The extraction walks the DOM collecting computed styles (font sizes, spacing, colors, geometry, animation timing) into `last-audit.json`.
4. Claude applies each metric formula from `aesthetic-formulas.md`, computing scores, thresholds, and violations.
5. The report renders inline with a screenshot.

All extraction happens locally — no data leaves your machine.

## Requirements

- **Node.js** >= 18
- **[playwright-cli](https://www.npmjs.com/package/playwright-cli)** >= 1.50.0 (peer dependency)
- **[Claude Code](https://docs.anthropic.com/en/docs/claude-code)** for the `/design-audit` skill

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE). Copyright (c) 2025 Dexin Huang
