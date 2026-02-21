# Kalos

Mathematical aesthetics audit CLI for web pages, installable as a Claude Code skill.

## Project Structure

- `bin/kalos.mjs` — CLI entrypoint (Node.js ESM)
- `skills/design-audit/` — Skill files installed into `.claude/skills/`
- `skills/design-audit/scripts/extract-layout.js` — Pure browser function loaded via `new Function()` at runtime; it is an anonymous function expression, NOT a standalone Node.js script. Do NOT run it with `node`.
- `skills/design-audit/scripts/run-extraction.sh` — Shell script that drives Playwright extraction
- `commands/` — Slash-command markdown files

## CI

The CI workflow (`node 18/20/22`) runs:

1. `node --check bin/kalos.mjs` — syntax check
2. `node bin/kalos.mjs --version` — prints version from package.json
3. `node bin/kalos.mjs --help` — prints usage
4. `node bin/kalos.mjs unknown-command` — must exit non-zero

## Key Constraints

- `extract-layout.js` is an anonymous function expression — cannot be run with `node` directly
- The project uses ESM (`"type": "module"` in package.json)
- No npm dependencies are required for the CLI itself; `playwright-cli` is a peer dependency used only at runtime
