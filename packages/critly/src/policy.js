// The policy: the app's design system as numbers, in .critly/policy.json.
// Validation is strict on purpose. A typo that silently matched nothing would turn a rule off
// without anyone deciding to, so unknown fields, unknown rule ids and bad values all stop the
// run with exit 2 and a message that names the field. (Selectors are checked in the browser,
// where a real CSS parser lives; see check.js validateSelectors.)

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

export const RULES = JSON.parse(await readFile(new URL('./rules.json', import.meta.url), 'utf8'));
export const RULE_IDS = RULES.map(r => r.id);
export const DEFAULT_POLICY_PATH = '.critly/policy.json';
export const DEFAULT_VIEWPORTS = [{ width: 390, height: 844 }, { width: 1440, height: 900 }];
export const DEFAULT_SCHEMES = { light: {}, dark: { media: true } };

/** An error that means "the check could not run" (exit 2). */
export class CritlyError extends Error {
  constructor(message) { super(message); this.name = 'CritlyError'; this.exitCode = 2; }
}

const FIELDS = {
  $schema: 'a string',
  fonts: 'a list of font family names, e.g. ["Inter", "JetBrains Mono"]',
  typeScale: 'a list of font sizes in px, e.g. [12, 14, 16, 20, 24]',
  typeRoles: 'a list of { "selector", "sizes" } for text that uses its own sizes',
  spacing: 'a list of spacing steps in px, e.g. [0, 4, 8, 12, 16, 24, 32]',
  colorTokens: 'a list of custom property names, e.g. ["--background", "--foreground", "--color-*"]',
  lineLength: 'the most characters per line for paragraphs (default 75)',
  bannedPhrases: 'a list of phrases the UI must not show',
  tailwind: 'true if the app uses Tailwind, so fixes name the class',
  schemes: 'color schemes and how to switch to each, e.g. { "light": {}, "dark": { "class": "dark", "on": "html" } }',
  viewports: 'a list of { "width", "height" } (default 390x844 and 1440x900)',
  pages: 'a list of paths to check, relative to the URL given, e.g. ["/", "/settings"]',
  ready: 'a selector to wait for before checking each page',
  rules: 'an object of rule id to "error" or "off", e.g. { "spacing-scale": "error" }',
  exceptions: 'a list of { "selector", "rules", "reason" }',
  ignore: 'a list of selectors for third-party widgets to skip entirely',
  note: 'one line appended to every finding',
  maxElements: 'the most visible elements a page may have (default 5000)',
};
const SCHEME_KEYS = ['media', 'class', 'attribute', 'storage', 'on'];

function fail(msg) { throw new CritlyError(`Bad policy: ${msg}`); }
const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
const strings = (v, name, { empty = false } = {}) => {
  if (!Array.isArray(v) || (!empty && !v.length) || v.some(s => typeof s !== 'string' || !s.trim())) fail(`"${name}" must be a list of non-empty strings.`);
};
const numbers = (v, name, min = 0) => {
  if (!Array.isArray(v) || !v.length || v.some(n => typeof n !== 'number' || !Number.isFinite(n) || n < min)) fail(`"${name}" must be a non-empty list of numbers${min > 0 ? ' above 0' : ''} (px).`);
};
const unknownKeys = (obj, allowed, where) => {
  for (const k of Object.keys(obj)) if (!allowed.includes(k)) fail(`unknown field "${k}" in ${where}. Allowed: ${allowed.join(', ')}.`);
};
const ruleId = (id, where) => {
  if (!RULE_IDS.includes(id)) fail(`unknown rule "${id}" in ${where}. Rules: ${RULE_IDS.join(', ')}.`);
};

/** Validates a policy object and returns it with defaults filled in. Throws CritlyError. */
export function validatePolicy(input = {}) {
  if (!isObj(input)) fail('the policy must be a JSON object.');
  for (const k of Object.keys(input)) if (!(k in FIELDS)) fail(`unknown field "${k}". Allowed fields: ${Object.keys(FIELDS).filter(f => f !== '$schema').join(', ')}.`);
  const p = structuredClone(input);
  if (p.fonts !== undefined) strings(p.fonts, 'fonts');
  if (p.typeScale !== undefined) numbers(p.typeScale, 'typeScale', 1);
  if (p.spacing !== undefined) numbers(p.spacing, 'spacing');
  if (p.colorTokens !== undefined) {
    strings(p.colorTokens, 'colorTokens');
    for (const t of p.colorTokens) if (!t.startsWith('--')) fail(`"colorTokens" entries are custom property names starting with --, got "${t}".`);
  }
  if (p.bannedPhrases !== undefined) strings(p.bannedPhrases, 'bannedPhrases', { empty: true });
  if (p.ignore !== undefined) strings(p.ignore, 'ignore', { empty: true });
  if (p.pages !== undefined) strings(p.pages, 'pages');
  if (p.typeRoles !== undefined) {
    if (!Array.isArray(p.typeRoles)) fail('"typeRoles" must be a list of { "selector", "sizes" }.');
    p.typeRoles.forEach((r, i) => {
      if (!isObj(r)) fail(`typeRoles[${i}] must be an object.`);
      unknownKeys(r, ['selector', 'sizes'], `typeRoles[${i}]`);
      if (typeof r.selector !== 'string' || !r.selector.trim()) fail(`typeRoles[${i}] needs a "selector".`);
      numbers(r.sizes, `typeRoles[${i}].sizes`, 1);
    });
  }
  if (p.lineLength !== undefined && (!Number.isInteger(p.lineLength) || p.lineLength < 20 || p.lineLength > 200)) fail('"lineLength" must be a whole number of characters from 20 to 200.');
  if (p.maxElements !== undefined && (!Number.isInteger(p.maxElements) || p.maxElements < 1)) fail('"maxElements" must be a positive whole number.');
  if (p.tailwind !== undefined && typeof p.tailwind !== 'boolean') fail('"tailwind" must be true or false.');
  for (const k of ['note', 'ready', '$schema']) if (p[k] !== undefined && (typeof p[k] !== 'string' || !p[k].trim())) fail(`"${k}" must be a non-empty string.`);
  if (p.note && p.note.length > 300) fail('"note" must be one line (300 characters at most).');

  if (p.viewports !== undefined) {
    if (!Array.isArray(p.viewports) || !p.viewports.length) fail('"viewports" must be a non-empty list of { "width", "height" }.');
    p.viewports.forEach((v, i) => {
      if (!isObj(v)) fail(`viewports[${i}] must be { "width", "height" }.`);
      unknownKeys(v, ['width', 'height'], `viewports[${i}]`);
      for (const k of ['width', 'height']) if (!Number.isInteger(v[k]) || v[k] < 200 || v[k] > 4000) fail(`viewports[${i}].${k} must be a whole number of px from 200 to 4000.`);
    });
  } else p.viewports = structuredClone(DEFAULT_VIEWPORTS);

  if (p.schemes !== undefined) {
    if (!isObj(p.schemes) || !Object.keys(p.schemes).length) fail('"schemes" must be an object such as { "light": {}, "dark": { "class": "dark", "on": "html" } }.');
    for (const [name, s] of Object.entries(p.schemes)) {
      const at = `schemes.${name}`;
      if (!/^[a-z][\w-]*$/i.test(name)) fail(`scheme names are words like "light" or "dark", got "${name}".`);
      if (!isObj(s)) fail(`${at} must be an object: {} for the default, or { "media": true }, { "class": "dark", "on": "html" }, { "attribute": ["data-theme", "dark"] }, { "storage": ["theme", "dark"] }.`);
      unknownKeys(s, SCHEME_KEYS, at);
      if (s.media !== undefined && typeof s.media !== 'boolean') fail(`${at}.media must be true or false.`);
      if (s.media && !['light', 'dark'].includes(name)) fail(`${at}.media emulates prefers-color-scheme, so the scheme must be named "light" or "dark".`);
      if (s.class !== undefined && (typeof s.class !== 'string' || !/^[\w-]+$/.test(s.class))) fail(`${at}.class must be one class name, e.g. "dark".`);
      for (const k of ['attribute', 'storage']) if (s[k] !== undefined && (!Array.isArray(s[k]) || s[k].length !== 2 || s[k].some(x => typeof x !== 'string') || !s[k][0])) fail(`${at}.${k} must be a [name, value] pair, e.g. ${k === 'attribute' ? '["data-theme", "dark"]' : '["theme", "dark"]'}.`);
      if (s.on !== undefined && (typeof s.on !== 'string' || !s.on.trim())) fail(`${at}.on must be a selector, usually "html" or "body".`);
      if (s.on !== undefined && s.class === undefined && s.attribute === undefined) fail(`${at}.on only applies with "class" or "attribute".`);
    }
  } else p.schemes = structuredClone(DEFAULT_SCHEMES);

  if (p.rules !== undefined) {
    if (!isObj(p.rules)) fail('"rules" must be an object of rule id to "error" or "off".');
    for (const [id, v] of Object.entries(p.rules)) {
      ruleId(id, 'rules');
      if (!['error', 'off'].includes(v)) fail(`rules["${id}"] must be "error" or "off", got ${JSON.stringify(v)}.`);
      const rule = RULES.find(r => r.id === id);
      if (rule.stage === 'v2' && id !== 'focus-ring' && v === 'error') fail(`rule "${id}" isn't available yet; it needs interaction the check doesn't do in this version.`);
    }
  }
  if (p.exceptions !== undefined) {
    if (!Array.isArray(p.exceptions)) fail('"exceptions" must be a list of { "selector", "rules", "reason" }.');
    p.exceptions.forEach((e, i) => {
      if (!isObj(e)) fail(`exceptions[${i}] must be { "selector", "rules", "reason" }.`);
      unknownKeys(e, ['selector', 'rules', 'reason'], `exceptions[${i}]`);
      if (typeof e.selector !== 'string' || !e.selector.trim()) fail(`exceptions[${i}] needs a "selector".`);
      strings(e.rules, `exceptions[${i}].rules`);
      e.rules.forEach(id => ruleId(id, `exceptions[${i}].rules`));
      if (typeof e.reason !== 'string' || !e.reason.trim()) fail(`exceptions[${i}] needs a "reason": why this is right as it is. Exceptions are the user's call.`);
    });
  }
  return {
    lineLength: 75, bannedPhrases: [], ignore: [], exceptions: [], rules: {}, typeRoles: [], tailwind: false, maxElements: 5000,
    ...p,
  };
}

/** Selectors in the policy, for checking in a real browser before the run. */
export function policySelectors(policy) {
  return [
    ...policy.ignore.map(s => ['ignore', s]),
    ...policy.exceptions.map((e, i) => [`exceptions[${i}].selector`, e.selector]),
    ...policy.typeRoles.map((r, i) => [`typeRoles[${i}].selector`, r.selector]),
    ...Object.entries(policy.schemes).filter(([, s]) => s.on).map(([n, s]) => [`schemes.${n}.on`, s.on]),
    ...(policy.ready ? [['ready', policy.ready]] : []),
  ];
}

/**
 * Loads and validates a policy file. With no path, uses .critly/policy.json if it exists,
 * else the defaults. Returns { policy, path } (path is null when no file was used).
 */
export async function loadPolicy(path, { cwd = process.cwd() } = {}) {
  const explicit = path !== undefined && path !== null;
  const file = resolve(cwd, explicit ? path : DEFAULT_POLICY_PATH);
  if (!existsSync(file)) {
    if (explicit) throw new CritlyError(`No policy file at ${file}. Check the --policy path.`);
    return { policy: validatePolicy({}), path: null };
  }
  let raw;
  try { raw = JSON.parse(await readFile(file, 'utf8')); }
  catch (error) { throw new CritlyError(`Bad policy: ${file} isn't valid JSON (${error.message}).`); }
  try { return { policy: validatePolicy(raw), path: file }; }
  catch (error) { error.message = error.message.replace(/^Bad policy: /, `Bad policy in ${file}: `); throw error; }
}
