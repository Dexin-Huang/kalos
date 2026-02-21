# Contributing

## Setup

```bash
git clone https://github.com/YOUR_USERNAME/kalos.git
cd kalos
node bin/kalos.mjs --help
```

No `npm install` needed — zero runtime dependencies. Install `playwright-cli` globally to test extraction.

## Project Structure

```
kalos/
├── bin/kalos.mjs                    # CLI entrypoint
├── skills/design-audit/
│   ├── SKILL.md                     # Claude Code skill definition
│   ├── references/aesthetic-formulas.md
│   └── scripts/
│       ├── extract-layout.js        # DOM extraction (page.evaluate)
│       └── run-extraction.sh        # playwright-cli wrapper
├── commands/design-audit.md         # /design-audit slash command
├── examples/
│   ├── example-audit.json
│   └── example-report.md
└── package.json
```

## Adding a New Metric

1. Add the formula to `skills/design-audit/references/aesthetic-formulas.md` — include purpose, steps, score formula, and Pass/Warn/Fail thresholds.
2. If it needs new DOM data, update `skills/design-audit/scripts/extract-layout.js`. This runs inside `page.evaluate()` — no Node.js APIs.
3. Update the weighted average table in `aesthetic-formulas.md`. Weights must sum to 100% (bonus metrics exempt).
4. Update the metrics table in `README.md`.
5. Add an entry to `CHANGELOG.md` under `[Unreleased]`.

## Pull Requests

- One feature or fix per PR.
- Update `CHANGELOG.md` under `[Unreleased]`.
- Update `README.md` if behavior changes.
- Large refactors: open an issue first.

## License

Contributions are licensed under MIT.
