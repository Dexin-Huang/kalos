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

import { cpSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PKG_ROOT = resolve(__dirname, '..');
const VERSION = JSON.parse(readFileSync(join(PKG_ROOT, 'package.json'), 'utf8')).version;

const args = process.argv.slice(2);
const command = args[0];

function usage() {
  console.log(`
design-audit v${VERSION} — Mathematical aesthetics audit for web pages

Usage:
  design-audit install --skills     Install skill files into .claude/skills/ and .claude/commands/
  design-audit run [url] [WxH]      Run layout extraction via playwright-cli
  design-audit --help               Show this help message
  design-audit --version            Show version

Prerequisites:
  playwright-cli must be installed globally (npm i -g playwright-cli)

Examples:
  design-audit install --skills
  design-audit run http://localhost:3000
  design-audit run http://localhost:3000 1920x1080
`.trim());
}

function installSkills() {
  const targetDir = process.cwd();
  const skillsTarget = join(targetDir, '.claude', 'skills', 'design-audit');
  const commandsTarget = join(targetDir, '.claude', 'commands');

  // Copy skills directory
  console.log(`Installing design-audit skill...`);
  mkdirSync(skillsTarget, { recursive: true });
  cpSync(join(PKG_ROOT, 'skills', 'design-audit'), skillsTarget, { recursive: true });
  console.log(`  Skill files → ${skillsTarget}`);

  // Copy command file
  mkdirSync(commandsTarget, { recursive: true });
  cpSync(join(PKG_ROOT, 'commands', 'design-audit.md'), join(commandsTarget, 'design-audit.md'));
  console.log(`  Command file → ${join(commandsTarget, 'design-audit.md')}`);

  console.log(`\nInstalled! Use /design-audit in Claude Code to run an audit.`);
}

function run() {
  const url = args[1] || 'http://localhost:3000';
  const viewport = args[2] || '1440x900';

  // Validate viewport format: must be NNNxNNN
  if (!/^\d+x\d+$/.test(viewport)) {
    console.error(`Error: Invalid viewport format '${viewport}'. Expected WIDTHxHEIGHT, e.g. 1440x900.`);
    process.exit(1);
  }

  // Find the extraction script — prefer installed version, fall back to package
  const installedScript = join(process.cwd(), '.claude', 'skills', 'design-audit', 'scripts', 'run-extraction.sh');
  const packageScript = join(PKG_ROOT, 'skills', 'design-audit', 'scripts', 'run-extraction.sh');
  const script = existsSync(installedScript) ? installedScript : packageScript;

  console.log(`Running design audit extraction...`);
  console.log(`  URL: ${url}`);
  console.log(`  Viewport: ${viewport}`);
  console.log(`  Script: ${script}`);
  console.log();

  try {
    execSync(`bash "${script}" "${url}" "${viewport}"`, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
  } catch (err) {
    console.error(`\nExtraction failed. Make sure:`);
    console.error(`  1. playwright-cli is installed (npm i -g playwright-cli)`);
    console.error(`  2. The target URL is running`);
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
