// The CLI end to end: exit codes, the quotable last line, plain errors, baseline, JSON.

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:net';
import { serve, FIXTURES } from '../fixtures/serve.mjs';

const BIN = fileURLToPath(new URL('../bin/critly.js', import.meta.url));
const POLICY = { fonts: ['Arial'], typeScale: [12, 14, 16, 20, 24, 32, 48], schemes: { light: {}, dark: { class: 'dark', on: 'html' } } };
let server, dir;

const run = (args, cwd = dir) => new Promise(done => {
  execFile(process.execPath, [BIN, ...args], { cwd, timeout: 120_000 }, (error, stdout, stderr) => done({ code: error ? error.code : 0, stdout, stderr, last: stdout.trimEnd().split('\n').at(-1) }));
});

before(async () => {
  server = await serve(FIXTURES);
  dir = await mkdtemp(join(tmpdir(), 'critly-cli-'));
  await mkdir(join(dir, '.critly'));
  await writeFile(join(dir, '.critly', 'policy.json'), JSON.stringify(POLICY));
});
after(async () => { await server?.close(); await rm(dir, { recursive: true, force: true }); });

test('a passing page exits 0 and ends with the summary line', async () => {
  const r = await run(['check', server.url + 'hit-area/after.html']);
  assert.equal(r.code, 0, r.stdout + r.stderr);
  assert.equal(r.last, 'critly check: 0 errors · 1 page × 2 viewports × 2 schemes · exit 0');
  assert.match(r.stdout, /checked 1 page × 2 viewports × 2 schemes · [\d,]+ elements · 15 rules/);
});

test('findings exit 1, print where, actual, fix and concept, and end with the counts', async () => {
  const r = await run(['check', server.url + 'hit-area/before.html']);
  assert.equal(r.code, 1);
  assert.match(r.stdout, /✕ hit-area {2}error · 390x844 · light, dark\n {2}where {3}button\.tiny "Close" under "Hit areas"\n {2}actual {2}20×20px\n {2}fix {5}Make it at least 44×44px at ≤ 640px wide/);
  assert.match(r.stdout, /concept https:\/\/critly\.vercel\.app\/hit-areas/);
  assert.equal(r.last, 'critly check: 2 errors, 0 review · 1 page × 2 viewports × 2 schemes · exit 1');
});

test('a review fails the run like an error', async () => {
  const r = await run(['check', server.url + 'text-contrast/before-gradient.html']);
  assert.equal(r.code, 1);
  assert.match(r.stdout, /^\? text-contrast {2}review/m);
  assert.match(r.last, /0 errors, 1 review .* exit 1$/);
});

test('exceptions suppress, and the count shows in the summary', async () => {
  const policy = { ...POLICY, exceptions: [{ selector: '.tiny', rules: ['hit-area'], reason: 'Fixture: a deliberately small button.' }] };
  await writeFile(join(dir, 'policy-exception.json'), JSON.stringify(policy));
  const r = await run(['check', server.url + 'hit-area/before.html', '--policy', 'policy-exception.json']);
  assert.equal(r.code, 0, r.stdout);
  assert.match(r.stdout, /1 finding suppressed by policy exceptions \(hit-area 1\)/);
  assert.equal(r.last, 'critly check: 0 errors · 1 page × 2 viewports × 2 schemes · 1 suppressed · exit 0');
  const json = JSON.parse((await run(['check', server.url + 'hit-area/before.html', '--policy', 'policy-exception.json', '--json'])).stdout);
  assert.equal(json.suppressed[0].reason, 'Fixture: a deliberately small button.');
});

test('could-not-run cases exit 2 with a plain message and a quotable last line', async () => {
  const port = await new Promise(done => { const s = createServer().listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => done(p)); }); });
  const down = await run(['check', `http://127.0.0.1:${port}/`]);
  assert.equal(down.code, 2);
  assert.match(down.stderr, new RegExp(`Can't reach http://127\.0\.0\.1:${port}/: nothing is answering`));
  assert.match(down.last, /^critly check: could not run \(Can't reach .*\) · exit 2$/);

  const missing = await run(['check', server.url + 'nope.html']);
  assert.equal(missing.code, 2);
  assert.match(missing.stderr, /Page not found \(HTTP 404\)/);

  const badUrl = await run(['check', 'not a url']);
  assert.equal(badUrl.code, 2);
  assert.match(badUrl.stderr, /isn't a URL/);

  await writeFile(join(dir, 'bad.json'), JSON.stringify({ fonts: ['Arial'], colours: ['red'] }));
  const badPolicy = await run(['check', server.url + 'hit-area/after.html', '--policy', 'bad.json']);
  assert.equal(badPolicy.code, 2);
  assert.match(badPolicy.stderr, /Bad policy in .*bad\.json: unknown field "colours"/);

  await writeFile(join(dir, 'bad-selector.json'), JSON.stringify({ ignore: ['div[['] }));
  const badSelector = await run(['check', server.url + 'hit-area/after.html', '--policy', 'bad-selector.json']);
  assert.equal(badSelector.code, 2);
  assert.match(badSelector.stderr, /invalid selector in ignore: "div\[\["/);

  const noPolicy = await run(['check', server.url + 'hit-area/after.html', '--policy', 'missing.json']);
  assert.equal(noPolicy.code, 2);
  assert.match(noPolicy.stderr, /No policy file at/);
});

test('baseline: --update-baseline writes counts, --baseline fails only on increases', async () => {
  const before = server.url + 'hit-area/before.html';
  const write = await run(['check', before, '--update-baseline']);
  assert.equal(write.code, 0);
  const saved = JSON.parse(await readFile(join(dir, '.critly', 'baseline.json'), 'utf8'));
  assert.deepEqual(saved.counts, { 'hit-area': 2 });
  const same = await run(['check', before, '--baseline']);
  assert.equal(same.code, 0, same.stdout);
  assert.match(same.last, /no rule above baseline \(2\) .* exit 0$/);
  await writeFile(join(dir, '.critly', 'baseline.json'), JSON.stringify({ counts: { 'hit-area': 1 } }));
  const worse = await run(['check', before, '--baseline']);
  assert.equal(worse.code, 1);
  assert.match(worse.last, /up from baseline: hit-area 1→2 .* exit 1$/);
});

test('--ready waits for a selector on every page', async () => {
  const r = await run(['check', server.url + 'hit-area/after.html', '--ready', 'main button']);
  assert.equal(r.code, 0, r.stdout + r.stderr);
}, { timeout: 120_000 });

test('--json prints the full report', async () => {
  const r = await run(['check', server.url + 'type-scale/before.html', '--json']);
  assert.equal(r.code, 1);
  const report = JSON.parse(r.stdout);
  assert.equal(report.exitCode, 1);
  assert.equal(report.findings[0].rule, 'type-scale');
  assert.equal(report.findings[0].fix, 'Use 14px or 16px, the nearest steps on the type scale.');
  assert.equal(report.coverage.length, 4);
  assert.ok(report.coverage.every(c => c.rules.includes('type-scale')));
});

test('no policy file: rules that need one are skipped and say why', async () => {
  const empty = await mkdtemp(join(tmpdir(), 'critly-nopolicy-'));
  try {
    const r = await run(['check', server.url + 'type-scale/before.html'], empty);
    assert.equal(r.code, 0, r.stdout);
    assert.match(r.stdout, /type-scale \(needs "typeScale" in the policy\)/);
    assert.match(r.stdout, /font-family \(needs "fonts" in the policy\)/);
  } finally { await rm(empty, { recursive: true, force: true }); }
});

test('a vendored copy of the critly skill gets a one-line notice', async () => {
  await mkdir(join(dir, '.claude', 'skills', 'critly'), { recursive: true });
  await writeFile(join(dir, '.claude', 'skills', 'critly', 'SKILL.md'), '# old copy');
  const r = await run(['check', server.url + 'hit-area/after.html']);
  assert.match(r.stdout, /Found a project copy of the critly skill in \.claude\/skills\/critly; copies go stale\. Run npx skills update/);
  assert.match(r.last, /^critly check: /);
  await rm(join(dir, '.claude'), { recursive: true, force: true });
});

test('--help and bad arguments', async () => {
  const help = await run(['--help']);
  assert.equal(help.code, 0);
  assert.match(help.stdout, /critly check <url> \[more urls\]/);
  const unknown = await run(['check', 'http://x', '--fast']);
  assert.equal(unknown.code, 2);
  assert.match(unknown.stderr, /Unknown option --fast/);
});
