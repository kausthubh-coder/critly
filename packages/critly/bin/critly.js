#!/usr/bin/env node
// critly check <url>: load the running app, measure what it renders, fail when the UI breaks
// a Critly concept. Exit 0 pass, 1 findings, 2 could not run.
// critly taste <url>: squint at the first screen, count its boxes and edges, find what it leads
// with, and write the images to look at. It never fails a page: exit 0, or 2 if it can't run.

import { existsSync, lstatSync } from 'node:fs';
import { join } from 'node:path';

const HELP = `critly: check a running app against Critly's design concepts.

Usage
  critly check <url> [more urls] [options]   Fail when the UI breaks a concept
  critly taste <url> [more urls] [options]   Squint, count boxes and edges, find the lead

Options
  --policy <file>     Policy file (default: .critly/policy.json if it exists)
  --ready <selector>  Wait for this element before each page
  --json              Print the full report as JSON
  --baseline          check: fail only when a rule's count goes up from .critly/baseline.json
  --update-baseline   check: write .critly/baseline.json from this run
  --out <dir>         taste: where to write the images (default .critly/taste)
  --blur <px>         taste: squint radius (default 6)
  --scheme <name>     taste: color scheme from the policy (default the first one)
  -h, --help          Show this help
  -v, --version       Show the version

Exit codes
  0  check passed, or taste ran
  1  check found errors, or reviews without a reasoned exception in the policy
  2  could not run: server down, page not found, bad URL, bad policy, no browser

Examples
  critly check http://localhost:3000
  critly check http://localhost:3000 --policy .critly/policy.json --ready main
  critly taste http://localhost:3000/settings
  npx @kausthubh/critly check http://localhost:3000/settings

Fix the UI, not the policy. Docs: https://critly.vercel.app/check and https://critly.vercel.app/taste-pass`;

function parseArgs(argv) {
  const args = { urls: [], json: false, baseline: false, updateBaseline: false };
  const option = (a, i, flag) => a === flag ? value(i, flag) : a.slice(flag.length + 1);
  const value = (i, flag) => {
    const v = argv[i + 1];
    if (v === undefined || v.startsWith('--')) throw usage(`${flag} needs a value.`);
    return v;
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-h' || a === '--help') args.help = true;
    else if (a === '-v' || a === '--version') args.version = true;
    else if (a === '--json') args.json = true;
    else if (a === '--baseline') args.baseline = true;
    else if (a === '--update-baseline') args.updateBaseline = true;
    else if (a === '--policy') args.policy = value(i++, a);
    else if (a.startsWith('--policy=')) args.policy = a.slice(9);
    else if (a === '--ready') args.ready = value(i++, a);
    else if (a.startsWith('--ready=')) args.ready = a.slice(8);
    else if (a === '--out' || a.startsWith('--out=')) { args.out = option(a, i, '--out'); if (a === '--out') i++; }
    else if (a === '--scheme' || a.startsWith('--scheme=')) { args.scheme = option(a, i, '--scheme'); if (a === '--scheme') i++; }
    else if (a === '--blur' || a.startsWith('--blur=')) {
      const raw = option(a, i, '--blur'); if (a === '--blur') i++;
      args.blur = Number(raw);
      if (!Number.isFinite(args.blur)) throw usage(`--blur takes a number of px, not ${JSON.stringify(raw)}.`);
    }
    else if (a.startsWith('-')) throw usage(`Unknown option ${a}.`);
    else if (!args.command) args.command = a;
    else args.urls.push(a);
  }
  return args;
}
function usage(message) { const e = new Error(`${message} Run critly --help for usage.`); e.exitCode = 2; return e; }

// A copied skill goes stale silently; a linked one (npx skills add -g) updates with the source.
function staleSkillNotice(cwd) {
  for (const dir of ['.agents/skills/critly', '.claude/skills/critly']) {
    const path = join(cwd, dir);
    try {
      if (existsSync(join(path, 'SKILL.md')) && !lstatSync(path).isSymbolicLink())
        return `Found a project copy of the critly skill in ${dir}; copies go stale. Run npx skills update (or install it globally: npx skills add kausthubh-coder/critly -g).`;
    } catch { /* unreadable: ignore */ }
  }
  return null;
}

async function main() {
  let args;
  try { args = parseArgs(process.argv.slice(2)); }
  catch (error) { console.error(error.message); console.log('critly check: could not run (bad arguments) · exit 2'); return 2; }
  if (args.help || (!args.command && !args.version)) { console.log(HELP); return args.help ? 0 : 2; }
  const lib = await import('../src/index.js');
  if (args.version) { console.log(lib.VERSION); return 0; }
  if (args.command === 'taste') return tasteCommand(lib, args);
  if (args.command !== 'check') { console.error(`Unknown command "${args.command}". The commands are check and taste.`); console.log(HELP); return 2; }
  for (const flag of ['out', 'blur', 'scheme']) if (args[flag] !== undefined) { console.error(`--${flag} is for critly taste.`); return 2; }
  if (args.baseline && args.updateBaseline) { console.error('Use --baseline or --update-baseline, not both.'); return 2; }

  const cwd = process.cwd();
  let report;
  try {
    if (!args.urls.length) throw new lib.CritlyError('Give the URL of the running app, for example: critly check http://localhost:3000');
    if (!args.json) process.stderr.write(`Checking ${args.urls.join(', ')}…\n`);
    report = await lib.check(args.urls, { policyPath: args.policy, ready: args.ready, cwd });
    if (args.updateBaseline) await lib.writeBaseline(report, undefined, { cwd });
    else if (args.baseline) await lib.compareBaseline(report, undefined, { cwd });
  } catch (error) {
    if (!(error instanceof lib.CritlyError)) throw error;
    if (args.json) console.log(JSON.stringify({ tool: '@kausthubh/critly', version: lib.VERSION, error: error.message, exitCode: 2 }, null, 2));
    else { console.error(error.message); console.log(lib.summaryLine(null, error)); }
    return 2;
  }
  if (args.json) console.log(JSON.stringify(report, null, 2));
  else {
    const notice = staleSkillNotice(cwd);
    console.log(lib.formatText(report, { notices: notice ? [notice] : [] }));
  }
  return report.exitCode;
}

async function tasteCommand(lib, args) {
  if (args.baseline || args.updateBaseline) { console.error('Baselines are for critly check; taste never fails a page.'); return 2; }
  let report;
  try {
    if (!args.urls.length) throw new lib.CritlyError('Give the URL of the running app, for example: critly taste http://localhost:3000');
    if (!args.json) process.stderr.write(`Tasting ${args.urls.join(', ')}…\n`);
    report = await lib.taste(args.urls, { policyPath: args.policy, ready: args.ready, out: args.out, blur: args.blur, scheme: args.scheme, cwd: process.cwd() });
  } catch (error) {
    if (!(error instanceof lib.CritlyError)) throw error;
    if (args.json) console.log(JSON.stringify({ tool: '@kausthubh/critly', version: lib.VERSION, kind: 'taste', error: error.message, exitCode: 2 }, null, 2));
    else { console.error(error.message); console.log(lib.tasteSummaryLine(null, error)); }
    return 2;
  }
  console.log(args.json ? JSON.stringify(report, null, 2) : lib.formatTaste(report));
  return report.exitCode;
}

main().then(code => { process.exitCode = code; }, error => {
  console.error(error?.stack || String(error));
  console.log(`critly ${process.argv[2] === 'taste' ? 'taste' : 'check'}: could not run (unexpected error, see above) · exit 2`);
  process.exitCode = 2;
});
