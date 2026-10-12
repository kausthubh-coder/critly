// The taste pass: the boxy page shows each look, the calm one with the same content shows none,
// the images get written, and the CLI never fails a page.

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:net';
import { taste, launchBrowser } from '../src/index.js';
import { serve, FIXTURES } from '../fixtures/serve.mjs';

const BIN = fileURLToPath(new URL('../bin/critly.js', import.meta.url));
let server, browser, dir, report;
const at = (name, viewport) => report.results.find(r => r.page.endsWith(name) && r.viewport === viewport);
const ids = r => r.looks.map(l => l.id).sort();

before(async () => {
  server = await serve(FIXTURES);
  browser = await launchBrowser();
  dir = await mkdtemp(join(tmpdir(), 'critly-taste-'));
  report = await taste([server.url + '_taste/before.html', server.url + '_taste/after.html'], { policy: {}, browser, cwd: dir });
}, { timeout: 120_000 });
after(async () => { await browser?.close(); await server?.close(); await rm(dir, { recursive: true, force: true }); });

for (const viewport of ['390x844', '1440x900']) {
  test(`the boxy page shows every look at ${viewport}`, () => {
    const r = at('before.html', viewport);
    assert.deepEqual(ids(r), ['all-bold', 'deep-boxes', 'near-miss-edge', 'solid-actions', 'weak-lead']);
    assert.equal(r.boxes.maxDepth, 3);
    assert.equal(r.focus.solidActions, 2);
    assert.match(r.focus.lead.where, /button\.solid "Add seats"/);
    assert.deepEqual(r.edges.nearMisses[0].at, [39, 43]);
  });

  test(`the calm page shows none at ${viewport}`, () => {
    const r = at('after.html', viewport);
    assert.deepEqual(ids(r), [], JSON.stringify(r.looks, null, 2));
    assert.equal(r.focus.verdict, 'clear');
    assert.ok(r.focus.ratio >= 1.5);
    assert.ok(r.boxes.count < at('before.html', viewport).boxes.count);
    assert.ok(r.edges.count < at('before.html', viewport).edges.count);
  });
}

test('every look names a concept and the squint is measured on pixels', () => {
  for (const r of report.results) {
    assert.equal(r.squint.method, 'pixels');
    assert.equal(r.squint.image, undefined, 'the image goes to a file, not the report');
    for (const l of r.looks) assert.match(l.concept, /^https:\/\/critly\.vercel\.app\/[a-z-]+$/);
  }
});

test('writes a squint and an overlay image per screen', async () => {
  for (const r of report.results) {
    for (const file of [r.files.squint, r.files.overlay]) assert.ok((await stat(join(dir, file))).size > 1000, file);
  }
  assert.deepEqual(report.results.map(r => r.files.squint).sort(), ['.critly/taste/taste-after-1440.squint.png', '.critly/taste/taste-after-390.squint.png', '.critly/taste/taste-before-1440.squint.png', '.critly/taste/taste-before-390.squint.png']);
});

const run = args => new Promise(done => execFile(process.execPath, [BIN, ...args], { cwd: dir, timeout: 120_000 }, (error, stdout, stderr) => done({ code: error ? error.code : 0, stdout, stderr, last: stdout.trimEnd().split('\n').at(-1) })));

test('the CLI exits 0 with looks, and ends with the summary line', async () => {
  const r = await run(['taste', server.url + '_taste/before.html', '--out', 'shots']);
  assert.equal(r.code, 0, r.stdout + r.stderr);
  assert.equal(r.last, 'critly taste: 10 things to look at · 2 screens · images in shots · exit 0');
  assert.match(r.stdout, / {2}lead {4}button\.solid "Add seats" leads, only just, 1\.4\d× over button\.solid "Upgrade plan"/);
  assert.match(r.stdout, / {2}look {4}A box in a box in a box \(3 deep\)/);
});

test('the CLI exits 2 when it cannot run, and rejects check-only flags', async () => {
  const port = await new Promise(done => { const s = createServer().listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => done(port)); }); });
  const down = await run(['taste', `http://127.0.0.1:${port}/`]);
  assert.equal(down.code, 2);
  assert.match(down.last, /^critly taste: could not run \(Can't reach/);
  assert.equal((await run(['taste', server.url + '_taste/after.html', '--baseline'])).code, 2);
  assert.equal((await run(['check', server.url + '_taste/after.html', '--blur', '4'])).code, 2);
});
