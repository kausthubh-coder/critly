#!/usr/bin/env node
// critly check <url>: load the running app, measure what it renders, fail when the UI breaks
// a Critly concept. Exit 0 pass, 1 findings, 2 could not run.

import { existsSync, lstatSync } from 'node:fs';
import { join } from 'node:path';

const HELP = `critly: check a running app against Critly's design concepts.

Usage
  critly check <url> [more urls] [options]

Options
  --policy <file>     Policy file (default: .critly/policy.json if it exists)
  --ready <selector>  Wait for this element before checking each page
  --json              Print the full report as JSON
  --baseline          Fail only when a rule's count goes up from .critly/baseline.json
  --update-baseline   Write .critly/baseline.json from this run
  -h, --help          Show this help
  -v, --version       Show the version

Exit codes
  0  passed
  1  findings: errors, or reviews without a reasoned exception in the policy
  2  could not run: server down, page not found, bad URL, bad policy, no browser

Examples
  critly check http://localhost:3000
  critly check http://localhost:3000 --policy .critly/policy.json --ready main
  npx @kausthubh/critly check http://localhost:3000/settings

Fix the UI, not the policy. Docs: https://critly.vercel.app/check`;

function parseArgs(argv) {
  const args = { urls: [], json: false, baseline: false, updateBaseline: false };
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
  if (args.command !== 'check') { console.error(`Unknown command "${args.command}". The only command is check.`); console.log(HELP); return 2; }
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

main().then(code => { process.exitCode = code; }, error => {
  console.error(error?.stack || String(error));
  console.log('critly check: could not run (unexpected error, see above) · exit 2');
  process.exitCode = 2;
});
