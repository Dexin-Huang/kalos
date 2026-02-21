#!/usr/bin/env node

/**
 * kalos — Mathematical aesthetics audit for web pages
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
kalos v${VERSION} — Mathematical aesthetics audit for web pages

Usage:
  kalos install --skills     Install skill files into .claude/
  kalos run [url] [WxH]      Run layout extraction via playwright-cli
  kalos --help               Show this help message
  kalos --version            Show version

Examples:
  kalos install --skills
  kalos run http://localhost:3000
  kalos run https://example.com 1920x1080
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
    console.error('Usage: kalos install --skills');
    process.exit(1);
  }
} else if (command === 'run') {
  run();
} else {
  console.error(`Unknown command: ${command}`);
  usage();
  process.exit(1);
}
