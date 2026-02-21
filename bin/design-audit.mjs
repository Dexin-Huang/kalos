#!/usr/bin/env node

/**
 * design-audit — CLI for mathematical aesthetics auditing
 *
 * Commands:
 *   install --skills    Copy skill files into .claude/skills/ and .claude/commands/
 *   run [url] [WxH]     Run extraction via playwright-cli
 *   --help              Show usage
 *   --version           Show version
 */

import { cpSync, mkdirSync, readFileSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = resolve(__dirname, '..');
const VERSION = JSON.parse(readFileSync(join(PKG_ROOT, 'package.json'), 'utf8')).version;

const args = process.argv.slice(2);
const command = args[0];

function usage() {
  console.log(`
design-audit v${VERSION} — Mathematical aesthetics audit for web pages

Usage:
  design-audit install --skills     Install skill files into .claude/
  design-audit run [url] [WxH]      Run layout extraction via playwright-cli
  design-audit --help               Show this help message
  design-audit --version            Show version

Examples:
  design-audit install --skills
  design-audit run http://localhost:3000
  design-audit run http://localhost:3000 1920x1080
`.trim());
}

function installSkills() {
  const skillsTarget = join(process.cwd(), '.claude', 'skills', 'design-audit');
  const commandsTarget = join(process.cwd(), '.claude', 'commands');

  mkdirSync(skillsTarget, { recursive: true });
  cpSync(join(PKG_ROOT, 'skills', 'design-audit'), skillsTarget, { recursive: true });

  mkdirSync(commandsTarget, { recursive: true });
  cpSync(join(PKG_ROOT, 'commands', 'design-audit.md'), join(commandsTarget, 'design-audit.md'));

  console.log(`Installed skill to .claude/skills/design-audit\nUse /design-audit in Claude Code to run an audit.`);
}

function run() {
  const url = args[1] || 'http://localhost:3000';
  const viewport = args[2] || '1440x900';

  if (!/^\d+x\d+$/.test(viewport)) {
    console.error(`Error: Invalid viewport '${viewport}'. Expected WIDTHxHEIGHT, e.g. 1440x900.`);
    process.exit(1);
  }

  const script = join(PKG_ROOT, 'skills', 'design-audit', 'scripts', 'run-extraction.sh');

  try {
    execSync(`bash "${script}" "${url}" "${viewport}"`, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
  } catch {
    process.exit(1);
  }
}

// Route commands
if (!command || command === '--help' || command === '-h') {
  usage();
} else if (command === '--version' || command === '-v') {
  console.log(VERSION);
} else if (command === 'install') {
  if (args.includes('--skills')) {
    installSkills();
  } else {
    console.error('Usage: design-audit install --skills');
    process.exit(1);
  }
} else if (command === 'run') {
  run();
} else {
  console.error(`Unknown command: ${command}`);
  usage();
  process.exit(1);
}
