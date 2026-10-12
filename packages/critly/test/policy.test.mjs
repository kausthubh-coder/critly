import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { validatePolicy, RULES, CritlyError } from '../src/policy.js';
import { resolvePages, parseUrl } from '../src/index.js';

const bad = (policy, pattern) => assert.throws(() => validatePolicy(policy), e => e instanceof CritlyError && e.exitCode === 2 && pattern.test(e.message));

test('defaults: two viewports, light and dark, no rules switched', () => {
  const p = validatePolicy({});
  assert.deepEqual(p.viewports, [{ width: 390, height: 844 }, { width: 1440, height: 900 }]);
  assert.deepEqual(Object.keys(p.schemes), ['light', 'dark']);
  assert.equal(p.lineLength, 75);
  assert.deepEqual(p.exceptions, []);
});

test('the example policy from the website validates', () => {
  validatePolicy({
    fonts: ['Inter', 'JetBrains Mono'], typeScale: [12, 14, 16, 20, 24, 48],
    schemes: { light: {}, dark: { class: 'dark', on: 'html' } },
    pages: ['/', '/settings', '/settings/billing'],
    exceptions: [{ selector: '.embed-map *', rules: ['text-contrast'], reason: "Third-party map tiles; we don't control their text." }],
  });
});

test('every scheme switch validates', () => {
  validatePolicy({ schemes: { light: {}, dark: { media: true } } });
  validatePolicy({ schemes: { light: {}, dark: { attribute: ['data-theme', 'dark'] } } });
  validatePolicy({ schemes: { light: {}, dark: { storage: ['theme', 'dark'], class: 'dark', on: 'html' } } });
});

test('strict: unknown fields, rule ids and values exit 2 with the field named', () => {
  bad({ colours: [] }, /unknown field "colours"/);
  bad({ exceptions: [{ selector: 'a', rules: ['contrast'], reason: 'x' }] }, /unknown rule "contrast"/);
  bad({ exceptions: [{ selector: 'a', rules: ['text-contrast'] }] }, /needs a "reason"/);
  bad({ exceptions: [{ selector: 'a', rules: ['text-contrast'], reason: 'x', until: '2027' }] }, /unknown field "until"/);
  bad({ rules: { 'spacing-scale': 'warn' } }, /"error" or "off"/);
  bad({ rules: { 'layout-shift': 'error' } }, /isn't available yet/);
  bad({ typeScale: [] }, /typeScale/);
  bad({ typeScale: ['16px'] }, /typeScale/);
  bad({ schemes: { dark: { mode: 'dark' } } }, /unknown field "mode" in schemes.dark/);
  bad({ schemes: { dim: { media: true } } }, /must be named "light" or "dark"/);
  bad({ schemes: { dark: { attribute: ['data-theme'] } } }, /\[name, value\] pair/);
  bad({ viewports: [{ width: 390 }] }, /viewports\[0\].height/);
  bad({ lineLength: 10 }, /lineLength/);
  bad({ colorTokens: ['primary'] }, /starting with --/);
  bad([], /JSON object/);
});

test('pages resolve against each URL given', () => {
  assert.deepEqual(resolvePages(['http://localhost:3000'], ['/', '/settings']), ['http://localhost:3000/', 'http://localhost:3000/settings']);
  assert.deepEqual(resolvePages(['http://localhost:3000/app/'], ['billing']), ['http://localhost:3000/app/billing']);
  assert.deepEqual(resolvePages(['localhost:5173'], undefined), ['http://localhost:5173/']);
  assert.throws(() => parseUrl('not a url'), /isn't a URL/);
  assert.throws(() => parseUrl('ftp://x'), /isn't a web page URL/);
});

test('check.js, the schema, the skill copy and the README agree with rules.json', async () => {
  const cwd = fileURLToPath(new URL('..', import.meta.url));
  execFileSync(process.execPath, ['scripts/sync-skill.mjs', '--check'], { cwd, stdio: 'pipe' });
  execFileSync(process.execPath, ['scripts/readme-rules.mjs', '--check'], { cwd, stdio: 'pipe' });
  const source = await readFile(new URL('../src/check.js', import.meta.url), 'utf8');
  for (const r of RULES) assert.ok(source.includes(`${JSON.stringify(r.id)}: [${JSON.stringify(r.concept)}`), r.id);
  assert.ok(source.split('\n').length < 1000, 'check.js stays under 1,000 lines');
});
