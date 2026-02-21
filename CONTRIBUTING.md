# Contributing to design-audit-cli

Thank you for your interest in contributing! This document covers how to get started, how to add new metrics, and the pull request process.

---

## Getting Started

1. Fork the repository and clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/design-audit-cli.git
   cd design-audit-cli
   ```

2. Verify the CLI works:
   ```bash
   node bin/design-audit.mjs --help
   node bin/design-audit.mjs --version
   ```

3. Install the peer dependency if you want to test extraction:
   ```bash
   npm install -g playwright-cli
   ```

The package has no runtime npm dependencies — just Node.js built-ins. No `npm install` needed.

---

## Development

### Project Structure

```
design-audit-cli/
├── bin/
│   └── design-audit.mjs          # CLI entrypoint (install, run, --help, --version)
├── skills/
│   └── design-audit/
│       ├── SKILL.md               # Claude Code skill definition
│       ├── references/
│       │   └── aesthetic-formulas.md  # All 11 metric formulas + thresholds
│       └── scripts/
│           ├── extract-layout.js  # DOM extraction (runs inside page.evaluate())
│           └── run-extraction.sh  # playwright-cli shell wrapper
├── commands/
│   └── design-audit.md            # Claude Code /design-audit slash command
├── examples/
│   ├── example-audit.json         # Sample extraction output (truncated)
│   └── example-report.md          # Sample full audit report
├── package.json
├── README.md
├── LICENSE
└── CHANGELOG.md
```

### Testing Manually

```bash
# Install skills into a test project
cd /path/to/any-web-project
node /path/to/design-audit-cli/bin/design-audit.mjs install --skills

# Run extraction against a live URL
node /path/to/design-audit-cli/bin/design-audit.mjs run https://example.com

# Check output
cat .claude/skills/design-audit/last-audit.json
```

---

## Adding a New Metric

1. **Add the formula** to `skills/design-audit/references/aesthetic-formulas.md`:
   - Give the metric a number and name
   - Document: purpose, steps, score formula, Pass/Warn/Fail thresholds
   - If it needs new DOM data, add the extraction fields in step 2

2. **Update the extraction** if needed — add computed style fields to `skills/design-audit/scripts/extract-layout.js`. Remember: this file runs inside `page.evaluate()`, so no Node.js APIs are available.

3. **Update the weighted average table** in `aesthetic-formulas.md`. Weights must sum to 100% for scored metrics (bonus metrics are exempt).

4. **Update `README.md`** — add the new metric to the metrics overview table.

5. **Add an entry to `CHANGELOG.md`** under `[Unreleased]`.

---

## Pull Request Process

1. Create a branch: `git checkout -b feat/my-metric`
2. Make your changes and test manually.
3. Update `CHANGELOG.md` under `[Unreleased]`.
4. Update `README.md` if behavior changes.
5. Open a PR — fill in the pull request template.

One feature or fix per PR, please. Large refactors should be discussed in an issue first.

---

## Reporting Bugs

Open a [GitHub issue](https://github.com/IrisSolutions/design-audit-cli/issues) and include:

- `design-audit-cli` version (`design-audit --version`)
- Node.js version (`node --version`)
- `playwright-cli` version (`playwright-cli --version`)
- The URL that was audited (or `localhost` if local)
- Full error output

---

## Code of Conduct

Be respectful and constructive. This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
