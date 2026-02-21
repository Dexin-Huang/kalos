# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-02-21

### Added
- Initial release
- 11 mathematical aesthetic metrics with formulas, thresholds, and weighted scoring
- Claude Code skill (`SKILL.md`) and `/design-audit` slash command
- `kalos install --skills` — copy skill files into any project's `.claude/` directory
- `kalos run [url] [WxH]` — run layout extraction directly via playwright-cli
- `kalos --help` and `kalos --version` CLI commands
- `extract-layout.js` — DOM extraction function (runs inside `page.evaluate()`)
  - Collects: font sizes, spacing, colors, geometry, animation timing for all visible elements
  - Page-level stats: unique font sizes, spacing values, colors, transition durations
- `run-extraction.sh` — playwright-cli shell wrapper for screenshot + extraction
- `aesthetic-formulas.md` — complete reference for all 11 metrics:
  1. Modular Scale Consistency (15%)
  2. Spacing Harmony / auto-detected grid (15%)
  3. Vertical Rhythm (10%)
  4. WCAG Contrast AA/AAA (20%)
  5. Proportional Harmony (5%)
  6. Gestalt Proximity (5%)
  7. Alignment Score (10%)
  8. Line Length / Readability (5%)
  9. Visual Weight Balance (10%)
  10. Birkhoff Aesthetic Measure (5%)
  11. Animation Timing — bonus metric
- `REFERENCES.md` — 30+ academic citations (Birkhoff, Bringhurst, Arnheim, Ngo et al., W3C, etc.)
