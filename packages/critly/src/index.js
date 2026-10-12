// critly check, as a library: load each page at each viewport and color scheme in a
// deterministic browser, run check.js in it, and return one report. critly taste shares the
// browser setup and runs taste.js on the first screen of each page instead.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname, join, relative, sep } from 'node:path';
import { launchBrowser } from './browser.js';
import { CritlyError, RULES, loadPolicy, validatePolicy, policySelectors } from './policy.js';

export { CritlyError, RULES, RULE_IDS, loadPolicy, validatePolicy, DEFAULT_POLICY_PATH } from './policy.js';
export { formatText, summaryLine, formatTaste, tasteSummaryLine } from './format.js';
export { launchBrowser } from './browser.js';

export const CHECK_SOURCE = await readFile(new URL('./check.js', import.meta.url), 'utf8');
export const TASTE_SOURCE = await readFile(new URL('./taste.js', import.meta.url), 'utf8');
export const DEFAULT_TASTE_DIR = '.critly/taste';
export const VERSION = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8')).version;
export const DEFAULT_BASELINE_PATH = '.critly/baseline.json';
const TIMEOUT = 30_000;

/** Turns what the user typed into a URL, or explains what's wrong with it. */
export function parseUrl(input) {
  let text = String(input).trim();
  if (/^(localhost|127\.0\.0\.1|\[::1\]|0\.0\.0\.0)(:\d+)?(\/|$)/.test(text)) text = `http://${text}`;
  let url;
  try { url = new URL(text); } catch { throw new CritlyError(`"${input}" isn't a URL. Include http:// or https://, for example: critly check http://localhost:3000`); }
  if (!['http:', 'https:', 'file:'].includes(url.protocol)) throw new CritlyError(`"${input}" isn't a web page URL. Use http://, https:// or file://.`);
  return url;
}

/** The pages to check: each URL, or with "pages" in the policy, each path resolved against each URL. */
export function resolvePages(urls, pages) {
  if (!urls?.length) throw new CritlyError('Give the URL of the running app, for example: critly check http://localhost:3000');
  const bases = urls.map(parseUrl);
  const out = pages?.length ? bases.flatMap(base => pages.map(p => new URL(p, base).href)) : bases.map(u => u.href);
  return [...new Set(out)];
}

function navigationError(error, url) {
  const msg = String(error?.message || error);
  const { origin, host } = new URL(url);
  if (/ERR_CONNECTION_REFUSED|ECONNREFUSED/.test(msg)) return `Can't reach ${url}: nothing is answering at ${origin}. Start the app (for example npm run dev), then run the check again.`;
  if (/ERR_NAME_NOT_RESOLVED/.test(msg)) return `Can't find the host ${host}. Check the URL.`;
  if (/ERR_FILE_NOT_FOUND/.test(msg)) return `No file at ${url}. Check the path.`;
  if (/Timeout/i.test(msg)) return `${url} didn't finish loading within ${TIMEOUT / 1000}s. Check that the app is up and the page loads in a browser.`;
  if (/ERR_CERT|SSL/.test(msg)) return `${url} has a certificate problem (${msg.split('\n')[0]}).`;
  return `Couldn't load ${url}: ${msg.split('\n')[0]}`;
}
const browserError = error => {
  const msg = String(error?.message || error).replace(/^.*?Error: /s, '').split('\n')[0];
  return new CritlyError(msg.replace(/^critly: /, ''));
};

async function applyScheme(page, name, schemes) {
  const scheme = schemes[name];
  const others = Object.entries(schemes).filter(([n]) => n !== name).map(([, s]) => s);
  await page.evaluate(({ scheme, others }) => {
    const targets = sel => [...document.querySelectorAll(sel || 'html')];
    for (const o of others) {
      if (o.class && o.class !== scheme.class) targets(o.on).forEach(t => t.classList.remove(o.class));
      if (o.attribute && !(scheme.attribute && scheme.attribute[0] === o.attribute[0])) targets(o.on).forEach(t => { if (t.getAttribute(o.attribute[0]) === o.attribute[1]) t.removeAttribute(o.attribute[0]); });
    }
    if (scheme.class) targets(scheme.on).forEach(t => t.classList.add(scheme.class));
    if (scheme.attribute) targets(scheme.on).forEach(t => t.setAttribute(scheme.attribute[0], scheme.attribute[1]));
  }, { scheme, others });
}

/** Runs check.js on a page that is already loaded (Playwright helper and the CLI share this). */
export async function runOnPage(page, policy, context) {
  try {
    await page.evaluate(CHECK_SOURCE);
    return await page.evaluate(([p, c]) => window.__critlyCheck(p, c), [policy, context]);
  } catch (error) { throw browserError(error); }
}

async function focusPass(page, policy, context) {
  const out = { findings: [], suppressed: [], stops: 0 };
  const count = await page.evaluate(([p, c]) => window.__critlyCheck.focusStart(p, c), [policy, context]);
  for (let i = 0; i < Math.min(count + 1, 80); i++) {
    await page.keyboard.press('Tab');
    const step = await page.evaluate(() => window.__critlyCheck.focusStep());
    if (step.done) break;
    out.stops++;
    if (step.finding) out.findings.push(step.finding);
    if (step.suppressed) out.suppressed.push(step.suppressed);
  }
  return out;
}

// A deterministic browser: scale factor 1, en-US, UTC, reduced motion on.
async function newContext(browser, viewport, schemeName, scheme) {
  const context = await browser.newContext({
    viewport, deviceScaleFactor: 1, locale: 'en-US', timezoneId: 'UTC', reducedMotion: 'reduce',
    colorScheme: schemeName === 'dark' ? 'dark' : 'light',
  });
  if (scheme.storage) await context.addInitScript(([k, v]) => { try { localStorage.setItem(k, v); } catch { /* storage blocked */ } }, scheme.storage);
  return context;
}

// Loads one page in the scheme, waits for the ready selector, and explains anything that stops it.
async function openPage(context, url, policy, schemeName, options) {
  const page = await context.newPage();
  page.setDefaultTimeout(TIMEOUT);
  let response;
  try { response = await page.goto(url, { waitUntil: 'load', timeout: TIMEOUT }); }
  catch (error) { throw new CritlyError(navigationError(error, url)); }
  const status = response?.status() ?? 200;
  if (status === 404) throw new CritlyError(`Page not found (HTTP 404): ${url}. Check the URL${policy.pages ? ' and "pages" in the policy' : ''}.`);
  if (status >= 400) throw new CritlyError(`${url} returned HTTP ${status}. Fix the server error, then run it again.`);
  await applyScheme(page, schemeName, policy.schemes);
  const ready = options.ready ?? policy.ready;
  if (ready) {
    try { await page.locator(ready).first().waitFor({ state: 'visible', timeout: TIMEOUT }); }
    catch { throw new CritlyError(`Waited ${TIMEOUT / 1000}s for the ready selector ${JSON.stringify(ready)} on ${url}, and it never showed up.`); }
  }
  return page;
}

async function checkOne(browser, policy, viewport, schemeName, urls, options) {
  const scheme = policy.schemes[schemeName];
  const vp = `${viewport.width}x${viewport.height}`;
  const context = await newContext(browser, viewport, schemeName, scheme);
  const results = [];
  try {
    for (const url of urls) {
      const page = await openPage(context, url, policy, schemeName, options);
      const context_ = { viewport: vp, scheme: schemeName };
      const result = await runOnPage(page, policy, context_);
      if (policy.rules['focus-ring'] === 'error') {
        const focus = await focusPass(page, policy, context_);
        result.findings.push(...focus.findings);
        result.suppressed.push(...focus.suppressed);
        result.coverage.focusStops = focus.stops;
        delete result.coverage.skipped['focus-ring'];
        result.coverage.rules.push('focus-ring');
      }
      results.push({ url, finalUrl: page.url(), ...result });
      await page.close();
    }
  } finally { await context.close(); }
  return results;
}

/**
 * Checks pages and returns the report.
 * options: { policy (object) | policyPath, ready, cwd, browser (reuse a launched browser) }
 */
export async function check(urls, options = {}) {
  const cwd = options.cwd ?? process.cwd();
  let policy, policyPath = null;
  if (options.policy) policy = validatePolicy(options.policy);
  else ({ policy, path: policyPath } = await loadPolicy(options.policyPath, { cwd }));
  const pages = resolvePages(urls, policy.pages);
  const browser = options.browser ?? await launchBrowser({ cwd });
  const started = Date.now();
  try {
    // Every selector in the policy goes through a real CSS parser before anything loads.
    const blank = await browser.newPage();
    try {
      await blank.evaluate(CHECK_SOURCE);
      const bad = await blank.evaluate(list => list.filter(([, s]) => { try { document.querySelector(s); return false; } catch { return true; } }), policySelectors(policy));
      if (bad.length) throw new CritlyError(`Bad policy: invalid selector in ${bad[0][0]}: ${JSON.stringify(bad[0][1])}.`);
    } finally { await blank.close(); }

    const combos = policy.viewports.flatMap(v => Object.keys(policy.schemes).map(s => [v, s]));
    const runs = (await Promise.all(combos.map(([v, s]) => checkOne(browser, policy, v, s, pages, options)))).flat();
    return buildReport({ policy, policyPath, pages, runs, ms: Date.now() - started });
  } finally {
    if (!options.browser) await browser.close().catch(() => {});
  }
}

const runLabel = f => `${f.viewport} ${f.scheme}`;

function buildReport({ policy, policyPath, pages, runs, ms }) {
  const groups = new Map(), suppressed = [], suppressedBy = new Map(), coverage = [];
  for (const run of runs) {
    coverage.push({ page: run.url, ...run.coverage });
    for (const s of run.suppressed) {
      const key = [run.url, s.rule, s.selector].join(' ');
      const prior = suppressedBy.get(key);
      if (prior) { prior.runs.push(runLabel(s)); continue; }
      const { viewport, scheme, ...rest } = s;
      const entry = { page: run.url, ...rest, runs: [runLabel(s)] };
      suppressedBy.set(key, entry);
      suppressed.push(entry);
    }
    for (const f of run.findings) {
      const key = [run.url, f.rule, f.severity, f.selector, f.actual, f.fix].join('\u0000');
      const g = groups.get(key);
      if (g) { g.runs.push(runLabel(f)); g.count = Math.max(g.count, f.count); continue; }
      const { viewport, scheme, ...rest } = f;
      groups.set(key, { page: run.url, ...rest, runs: [runLabel(f)] });
    }
  }
  const order = new Map(pages.map((p, i) => [p, i]));
  const findings = [...groups.values()].sort((a, b) => order.get(a.page) - order.get(b.page) || (a.severity === b.severity ? 0 : a.severity === 'error' ? -1 : 1));
  const byRule = {};
  for (const f of findings) byRule[f.rule] = (byRule[f.rule] || 0) + 1;
  const errors = findings.filter(f => f.severity === 'error').length;
  const reviews = findings.length - errors;
  const skipped = coverage[0]?.skipped ?? {};
  return {
    tool: '@kausthubh/critly', version: VERSION, policy: policyPath, pages,
    viewports: policy.viewports.map(v => `${v.width}x${v.height}`), schemes: Object.keys(policy.schemes),
    rules: { ran: coverage[0]?.rules ?? [], skipped },
    totals: { errors, reviews, suppressed: suppressed.length, elements: coverage.reduce((n, c) => n + c.elements, 0), byRule },
    findings, suppressed, coverage, ms,
    exitCode: findings.length ? 1 : 0,
  };
}

/** Reads .critly/baseline.json and compares per-rule counts. Only increases fail. */
export async function compareBaseline(report, path = DEFAULT_BASELINE_PATH, { cwd = process.cwd() } = {}) {
  const file = resolve(cwd, path);
  if (!existsSync(file)) throw new CritlyError(`No baseline at ${path}. Record one first with: critly check <url> --update-baseline`);
  let base;
  try { base = JSON.parse(await readFile(file, 'utf8')); } catch (error) { throw new CritlyError(`${path} isn't valid JSON (${error.message}).`); }
  const counts = base.counts ?? {};
  const ids = new Set([...Object.keys(counts), ...Object.keys(report.totals.byRule)]);
  const changes = [...ids].map(rule => ({ rule, before: counts[rule] ?? 0, now: report.totals.byRule[rule] ?? 0 })).filter(c => c.before !== c.now);
  const increases = changes.filter(c => c.now > c.before);
  report.baseline = { path, before: Object.values(counts).reduce((a, b) => a + b, 0), changes, increases };
  report.exitCode = increases.length ? 1 : 0;
  return report.baseline;
}

export async function writeBaseline(report, path = DEFAULT_BASELINE_PATH, { cwd = process.cwd() } = {}) {
  const file = resolve(cwd, path);
  await mkdir(dirname(file), { recursive: true });
  const counts = Object.fromEntries(Object.entries(report.totals.byRule).sort());
  await writeFile(file, JSON.stringify({ note: 'Per-rule finding counts. critly check --baseline fails only when a count goes up. Lower them as you fix things.', updated: new Date().toISOString().slice(0, 10), pages: report.pages, counts }, null, 2) + '\n');
  report.baseline = { path, written: true, counts };
  report.exitCode = 0;
  return file;
}

// ---------- taste ----------

// "/settings/billing" -> "settings-billing", "/" -> "home". The host joins in when the pages come
// from more than one origin.
function fileStem(url, many) {
  const u = new URL(url);
  const path = (u.pathname.replace(/\.html?$/, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home').toLowerCase();
  return many ? `${u.hostname}-${u.port}-${path}`.replace(/[^a-z0-9]+/gi, '-').replace(/-+/g, '-') : path;
}
const fromDataUrl = url => Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');

/**
 * The taste pass: for each page at each viewport, squint at the first screen, count its boxes
 * and edges, and find what it leads with. Writes a squint image and an overlay image per screen
 * and returns what to look at. It never fails a page; exitCode is 0 unless it can't run.
 * options: { policy (object) | policyPath, ready, cwd, out, blur, scheme, browser }
 */
export async function taste(urls, options = {}) {
  const cwd = options.cwd ?? process.cwd();
  let policy, policyPath = null;
  if (options.policy) policy = validatePolicy(options.policy);
  else ({ policy, path: policyPath } = await loadPolicy(options.policyPath, { cwd }));
  const pages = resolvePages(urls, policy.pages);
  const schemeName = options.scheme ?? Object.keys(policy.schemes)[0];
  if (!policy.schemes[schemeName]) throw new CritlyError(`No scheme named "${schemeName}". The policy has ${Object.keys(policy.schemes).join(', ')}.`);
  const blur = options.blur ?? 6;
  if (!(blur >= 1 && blur <= 40)) throw new CritlyError('--blur takes a radius in px from 1 to 40.');
  const outDir = resolve(cwd, options.out ?? DEFAULT_TASTE_DIR);
  const rel = file => relative(cwd, file).split(sep).join('/') || '.';
  const many = new Set(pages.map(p => new URL(p).origin)).size > 1;
  const browser = options.browser ?? await launchBrowser({ cwd });
  const started = Date.now();
  try {
    await mkdir(outDir, { recursive: true });
    const run = async viewport => {
      const context = await newContext(browser, viewport, schemeName, policy.schemes[schemeName]);
      const out = [];
      try {
        for (const url of pages) {
          const page = await openPage(context, url, policy, schemeName, options);
          try {
            await page.evaluate(() => document.fonts?.ready);
            await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
            const shot = `data:image/png;base64,${(await page.screenshot({ type: 'png' })).toString('base64')}`;
            await page.evaluate(TASTE_SOURCE);
            const r = await page.evaluate(o => window.__critlyTaste(o), { screenshot: shot, blur, ignore: policy.ignore });
            const stem = `${fileStem(url, many)}-${viewport.width}`;
            const squintFile = join(outDir, `${stem}.squint.png`), overlayFile = join(outDir, `${stem}.taste.png`);
            await writeFile(squintFile, fromDataUrl(r.squint.image));
            await page.evaluate(report => { window.__critlyTaste.overlay(report); }, r);
            await writeFile(overlayFile, await page.screenshot({ type: 'png' }));
            const { _draw, ...rest } = r;
            delete rest.squint.image;
            out.push({ page: url, viewport: `${viewport.width}x${viewport.height}`, files: { squint: rel(squintFile), overlay: rel(overlayFile) }, ...rest });
          } catch (error) { throw error instanceof CritlyError ? error : browserError(error); }
          finally { await page.close(); }
        }
      } finally { await context.close(); }
      return out;
    };
    const order = new Map(pages.map((p, i) => [p, i]));
    const results = (await Promise.all(policy.viewports.map(run))).flat().sort((a, b) => order.get(a.page) - order.get(b.page));
    return {
      tool: '@kausthubh/critly', version: VERSION, kind: 'taste', policy: policyPath, pages,
      viewports: policy.viewports.map(v => `${v.width}x${v.height}`), scheme: schemeName, blur, out: rel(outDir),
      results, totals: { looks: results.reduce((n, r) => n + r.looks.length, 0) },
      ms: Date.now() - started, exitCode: 0,
    };
  } finally {
    if (!options.browser) await browser.close().catch(() => {});
  }
}

export { RULES as rules };
