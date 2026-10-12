// Every rule has a before page that must fail that rule and nothing else, and an after page
// that must pass with zero findings, at both viewports and in both color schemes.
// Extra before-*.html / after-*.html pages are regressions: each false positive found on a
// real app becomes an after page here.

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { check, launchBrowser, RULES } from '../src/index.js';
import { serve, FIXTURES } from '../fixtures/serve.mjs';

export const POLICY = {
  fonts: ['Arial'],
  typeScale: [12, 14, 16, 20, 24, 32, 48],
  spacing: [0, 4, 8, 12, 16, 24, 32, 48],
  schemes: { light: {}, dark: { class: 'dark', on: 'html' } },
};
const ALL_RUNS = ['390x844 light', '390x844 dark', '1440x900 light', '1440x900 dark'];

const dirs = (await readdir(FIXTURES, { withFileTypes: true })).filter(d => d.isDirectory()).map(d => d.name).sort();
const files = [];
for (const rule of dirs) {
  for (const name of (await readdir(join(FIXTURES, rule))).filter(n => n.endsWith('.html')).sort()) {
    const html = await readFile(join(FIXTURES, rule, name), 'utf8');
    const expect = html.match(/<meta name="critly-expect" content="([^"]+)">/)?.[1].split(',').map(s => s.trim());
    files.push({ rule, name, path: `${rule}/${name}`, kind: name.startsWith('before') ? 'before' : 'after', runs: expect ? ALL_RUNS.filter(r => expect.includes(r.split(' ')[0])) : ALL_RUNS });
  }
}
const stage = id => RULES.find(r => r.id === id)?.stage;

let server, browser;
const results = new Map(); // path -> { findings, suppressed }

async function runBatch(list, policy) {
  const urls = list.map(f => server.url + f.path);
  const report = await check(urls, { policy, browser });
  for (const f of list) {
    const page = server.url + f.path;
    results.set(`${f.path}|${JSON.stringify(policy.rules ?? {})}`, {
      findings: report.findings.filter(x => x.page === page),
      suppressed: report.suppressed.filter(x => x.page === page),
    });
  }
  return report;
}

before(async () => {
  server = await serve(FIXTURES);
  browser = await launchBrowser();
  // v1 rules run together with the default policy; the guarded and opt-in before pages ride
  // along to prove those rules stay off unless the policy turns them on.
  await runBatch(files.filter(f => stage(f.rule) === 'v1' || f.kind === 'before'), POLICY);
  for (const rule of dirs.filter(r => stage(r) !== 'v1')) {
    await runBatch(files.filter(f => f.rule === rule), { ...POLICY, rules: { [rule]: 'error' } });
  }
}, { timeout: 240_000 });

after(async () => {
  const receipt = Object.fromEntries([...results].map(([k, v]) => [k, v.findings.map(f => `${f.rule} ${f.severity} [${f.runs.join(', ')}] ${f.actual}`)]));
  await mkdir(new URL('../test-results/', import.meta.url), { recursive: true });
  await writeFile(new URL('../test-results/fixtures.json', import.meta.url), JSON.stringify(receipt, null, 2));
  await browser?.close();
  await server?.close();
});

test('every v1 and guarded rule has a before and an after fixture', () => {
  for (const r of RULES.filter(r => r.stage !== 'v2')) {
    assert.ok(files.some(f => f.rule === r.id && f.kind === 'before'), `${r.id} has no before.html`);
    assert.ok(files.some(f => f.rule === r.id && f.kind === 'after'), `${r.id} has no after.html`);
  }
});

const describeFinding = f => `${f.rule} (${f.severity}, ${f.runs.join(', ')}): ${f.actual}`;

for (const f of files) {
  const own = stage(f.rule) === 'v1' ? '{}' : JSON.stringify({ [f.rule]: 'error' });
  if (f.kind === 'before') {
    test(`${f.path} fails ${f.rule}, and only ${f.rule}`, () => {
      const { findings } = results.get(`${f.path}|${own}`);
      assert.ok(findings.length, `expected ${f.rule} findings, got none`);
      const other = findings.filter(x => x.rule !== f.rule);
      assert.deepEqual(other.map(describeFinding), [], 'findings for other rules');
      const runs = new Set(findings.flatMap(x => x.runs));
      for (const run of f.runs) assert.ok(runs.has(run), `no ${f.rule} finding at ${run}`);
    });
    if (stage(f.rule) !== 'v1') {
      test(`${f.path} passes while ${f.rule} is off (the default)`, () => {
        const { findings } = results.get(`${f.path}|{}`);
        assert.deepEqual(findings.map(describeFinding), []);
      });
    }
  } else {
    test(`${f.path} passes with zero findings`, () => {
      const { findings, suppressed } = results.get(`${f.path}|${own}`);
      assert.deepEqual(findings.map(describeFinding), []);
      assert.equal(suppressed.length, 0);
    });
  }
}
