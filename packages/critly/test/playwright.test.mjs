// @kausthubh/critly/playwright on a page a test already opened.

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { AssertionError } from 'node:assert';
import { launchBrowser } from '../src/index.js';
import { checkPage, expectCritly } from '../src/playwright.js';
import { serve, FIXTURES } from '../fixtures/serve.mjs';

const POLICY = { fonts: ['Arial'], typeScale: [12, 14, 16, 20, 24, 32, 48] };
let server, browser, page;

before(async () => {
  server = await serve(FIXTURES);
  browser = await launchBrowser();
  page = await browser.newPage({ viewport: { width: 390, height: 844 } });
});
after(async () => { await browser?.close(); await server?.close(); });

test('checkPage returns findings for the page as it is', async () => {
  await page.goto(server.url + 'hit-area/before.html');
  const result = await checkPage(page, POLICY, { scheme: 'light' });
  assert.equal(result.findings.length, 1);
  assert.equal(result.findings[0].rule, 'hit-area');
  assert.equal(result.findings[0].viewport, '390x844');
  assert.equal(result.coverage.scheme, 'light');
});

test('expectCritly throws an assertion listing findings and attaches the report', async () => {
  await page.goto(server.url + 'hit-area/before.html');
  const attachments = [];
  const testInfo = { attach: async (name, body) => attachments.push({ name, ...body }) };
  await assert.rejects(expectCritly(page, testInfo, { policy: POLICY }), e => e instanceof AssertionError && /critly: 1 error, 0 review/.test(e.message) && /✕ hit-area/.test(e.message) && /fix {5}Make it at least 44×44px/.test(e.message));
  assert.equal(attachments[0].name, 'critly-report.json');
  assert.equal(JSON.parse(attachments[0].body).findings[0].rule, 'hit-area');
});

test('expectCritly passes quietly on a clean page', async () => {
  await page.goto(server.url + 'hit-area/after.html');
  const result = await expectCritly(page, undefined, { policy: POLICY });
  assert.equal(result.findings.length, 0);
});
