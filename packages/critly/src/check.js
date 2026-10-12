/*!
 * Critly check · https://critly.vercel.app/check · MIT License, Copyright (c) 2026 Kausthubh
 *
 * One self-contained, read-only browser script with no dependencies. It defines
 *
 *   window.__critlyCheck(policy?, context?) → Promise<{ findings, coverage, suppressed }>
 *
 * Node runs it through `critly check <url>` and `@kausthubh/critly/playwright`. An agent can
 * paste this whole file into any browser tool that evaluates JavaScript, then run
 *
 *   await window.__critlyCheck({ fonts: ["Inter"], typeScale: [12, 14, 16, 20, 24] }, { scheme: "light" })
 *
 * The policy is the app's .critly/policy.json (or window.__critlyPolicy when none is passed).
 * The script never switches color schemes or viewports itself: set them first, then pass the
 * scheme name in the context so findings say which one they came from.
 *
 * Ported with thanks, both MIT (full notices in NOTICE.md):
 * - lintapple, Copyright (c) 2026 Gavin Holtzapple, github.com/gholtzap/lintapple @ d374ea8:
 *   src/visibility.js (visible, textRects, generated text) and src/audit.js (selector chain,
 *   edgeInsets, clientBounds, the clip, scroll and containing-block context behind `overflow`,
 *   numeric table cells, block-aware text for banned copy, the contrast give-up list).
 * - @shadcn/lint, Copyright (c) 2026 shadcn, github.com/shadcn-ui/lint @ 9a55f6d:
 *   packages/lint/src/grammar/colors.ts (sRGB to OKLab, distance) and
 *   packages/lint/src/rules/suggest.ts (role-aware nearest tokens, nearest steps).
 */
(() => {
  'use strict';
  const SITE = 'https://critly.vercel.app/';
  // rules:begin (generated from rules.json by scripts/sync-skill.mjs; [concept, stage, needs a policy])
  const RULES = {
    "text-contrast": ["color-roles", "v1", 0],
    "hit-area": ["hit-areas", "v1", 0],
    "icon-button-name": ["icons", "v1", 0],
    "input-details": ["input-details", "v1", 0],
    "overflow": ["responsive", "v1", 0],
    "type-scale": ["type-scale", "v1", 1],
    "font-family": ["design-tokens", "v1", 1],
    "line-length": ["line-length", "v1", 0],
    "letter-spacing": ["letter-spacing", "v1", 0],
    "tabular-numbers": ["tabular-numbers", "v1", 0],
    "html-background": ["html-background", "v1", 0],
    "transition-all": ["effect-cost", "v1", 0],
    "layout-animation": ["smooth-animation", "v1", 0],
    "image-dimensions": ["image-loading", "v1", 0],
    "placeholder-content": ["real-content", "v1", 0],
    "spacing-scale": ["spacing-scale", "guarded", 1],
    "off-token-color": ["design-tokens", "guarded", 1],
    "nested-radius": ["nested-border-radius", "guarded", 0],
    "focus-ring": ["focus-rings", "v2", 0],
    "reduced-motion": ["reduced-motion", "v2", 0],
    "layout-shift": ["layout-shift", "v2", 0],
    "overlay-focus": ["overlays", "v2", 0],
  };
  // rules:end

  // The policy field each policy rule reads. Without it the rule is skipped, never guessed.
  const NEEDS = { 'type-scale': 'typeScale', 'font-family': 'fonts', 'spacing-scale': 'spacing' };
  const DEFAULTS = { lineLength: 75, bannedPhrases: [], ignore: [], exceptions: [], rules: {}, typeRoles: [], tailwind: false, maxElements: 5000 };
  const CODE = 'pre, code, kbd, samp';
  const CONTROL = 'button, [role="button"], [role="checkbox"], [role="switch"], [role="radio"], [role="tab"], [role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"], [role="option"], [role="link"], a[href], input:not([type="hidden"]), select, textarea, summary';
  const FIELD = 'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="image"]), select, textarea, [role="textbox"], [role="combobox"], [role="searchbox"], [role="spinbutton"]';
  const TEXT_ENTRY = /^(|text|search|email|url|tel|password|number|date|datetime-local|month|week|time)$/;
  const TW_TEXT = { 12: 'xs', 14: 'sm', 16: 'base', 18: 'lg', 20: 'xl', 24: '2xl', 30: '3xl', 36: '4xl', 48: '5xl', 60: '6xl', 72: '7xl', 96: '8xl', 128: '9xl' };
  const UTILITY = /^(-?(m|p)[xytrblse]?-|flex|grid|block|inline|hidden|contents|items-|justify-|content-|self-|place-|gap-|space-|w-|h-|size-|min-|max-|text-|bg-|border|rounded|font-|leading-|tracking-|shadow|ring|outline|transition|duration|ease|delay|animate|opacity|z-|top-|left-|right-|bottom-|inset|absolute|relative|fixed|sticky|static|overflow|truncate|shrink|grow|basis|order|col-|row-|divide|aspect|object|cursor|select-|pointer|sr-only|not-sr-only|underline|no-underline|uppercase|lowercase|capitalize|italic|antialiased|subpixel|whitespace|break-|line-clamp|origin|scale|rotate|translate|skew|fill-|stroke-|group|peer|dark|container|mx-auto|isolate|tabular|lining|ordinal|slashed|backdrop|blur|filter|drop-shadow|will-|touch-|scroll|snap|list-|decoration|indent|align-|float|clear|box-|table|caption|sm|md|lg|xl|2xl)/;

  // ---------- colors (OKLab from @shadcn/lint) ----------
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const paint = canvas.getContext('2d', { willReadFrequently: true });
  const colorCache = new Map();
  // Any CSS color → [r, g, b, a] in 0..1, or null. rgb() is parsed exactly; lab(), oklch(),
  // color(srgb) and the rest go through a 1px canvas, which converts every format Chrome knows.
  function parseColor(value) {
    value = String(value || '').trim();
    if (colorCache.has(value)) return colorCache.get(value);
    let out = null;
    const m = value.match(/^rgba?\(([^)]*)\)$/i);
    if (m) {
      const p = m[1].split(/[\s,/]+/).filter(Boolean).map((v, i) => v.endsWith('%') ? parseFloat(v) / 100 * (i < 3 ? 255 : 1) : parseFloat(v));
      if (p.length >= 3 && p.every(Number.isFinite)) out = [p[0] / 255, p[1] / 255, p[2] / 255, p.length > 3 ? p[3] : 1];
    } else if (value === 'transparent') out = [0, 0, 0, 0];
    else if (value && !/^(currentcolor|inherit|initial|unset|none)$/i.test(value)) {
      paint.fillStyle = '#010203';
      paint.fillStyle = value;
      if (String(paint.fillStyle) !== '#010203' || /^#010203$/i.test(value)) {
        paint.clearRect(0, 0, 1, 1);
        paint.fillRect(0, 0, 1, 1);
        const d = paint.getImageData(0, 0, 1, 1).data;
        out = [d[0] / 255, d[1] / 255, d[2] / 255, d[3] / 255];
      }
    }
    colorCache.set(value, out);
    return out;
  }
  const lin = c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  function toLab([r, g, b]) {
    const lr = lin(r), lg = lin(g), lb = lin(b);
    const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
    const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
    const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
    return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
  }
  function fromLab([L, a, b]) {
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3, s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
    const gam = c => { c = Math.min(1, Math.max(0, c)); return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055; };
    return [gam(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s), gam(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s), gam(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)];
  }
  const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const luminance = c => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
  const contrast = (a, b) => { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const hex = c => '#' + c.slice(0, 3).map(v => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, '0')).join('');
  const pm = c => [c[0] * c[3], c[1] * c[3], c[2] * c[3], c[3]];
  const over = (t, b) => t.map((v, i) => v + b[i] * (1 - t[3]));
  const unpm = c => c[3] > 0 ? [c[0] / c[3], c[1] / c[3], c[2] / c[3], c[3]] : [0, 0, 0, 0];
  const fmtRatio = r => `${Math.floor(r * 100) / 100}:1`;

  // ---------- small CSS math, for token values like calc(0.625rem - 4px) ----------
  function cssLength(value, rootPx) {
    const src = String(value).trim().replace(/^calc/, '');
    let i = 0;
    const ws = () => { while (src[i] === ' ') i++; };
    const atom = () => {
      ws();
      if (src[i] === '(') { i++; const v = sum(); ws(); i++; return v; }
      const m = src.slice(i).match(/^(-?\d*\.?\d+)(px|rem|em)?/);
      if (!m) throw 0;
      i += m[0].length;
      return parseFloat(m[1]) * (m[2] === 'rem' || m[2] === 'em' ? rootPx : 1);
    };
    const prod = () => { let v = atom(); for (ws(); src[i] === '*' || src[i] === '/'; ws()) { const op = src[i++]; const r = atom(); v = op === '*' ? v * r : v / r; } return v; };
    const sum = () => { let v = prod(); for (ws(); src[i] === '+' || src[i] === '-'; ws()) { const op = src[i++]; const r = prod(); v = op === '+' ? v + r : v - r; } return v; };
    try { const v = sum(); ws(); return i === src.length && Number.isFinite(v) ? v : null; } catch { return null; }
  }
  const px = n => `${Math.round(n * 100) / 100}px`;
  const firstFamily = f => String(f).split(',')[0].trim().replace(/^['"]|['"]$/g, '');
  const nearest = (value, steps, n = 2) => [...new Set(steps)].sort((a, b) => Math.abs(a - value) - Math.abs(b - value) || a - b).slice(0, n);
  const capList = (list, n = 12) => list.length > n ? `${list.slice(0, n).join(', ')} (+${list.length - n} more)` : list.join(', ');

  function normalize(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('critly: the policy must be a JSON object.');
    return { ...DEFAULTS, ...input };
  }
  // Every selector in the policy goes through querySelector, so a typo fails the run instead
  // of silently matching nothing.
  function validateSelectors(policy) {
    const list = [...policy.ignore.map(s => ['ignore', s]), ...policy.exceptions.map((e, i) => [`exceptions[${i}].selector`, e.selector]), ...policy.typeRoles.map((r, i) => [`typeRoles[${i}].selector`, r.selector])];
    for (const [field, sel] of list) {
      try { document.querySelector(sel); } catch { throw new Error(`critly: invalid selector in policy ${field}: ${JSON.stringify(sel)}`); }
    }
    for (const e of policy.exceptions) {
      if (!e || !Array.isArray(e.rules) || typeof e.selector !== 'string') throw new Error('critly: each exception needs "selector", "rules" and "reason".');
      if (!e.reason || !String(e.reason).trim()) throw new Error(`critly: the exception for ${JSON.stringify(e.selector)} has no reason. Every exception needs one.`);
      for (const id of e.rules || []) if (!RULES[id]) throw new Error(`critly: unknown rule ${JSON.stringify(id)} in an exception.`);
    }
    for (const id of Object.keys(policy.rules)) if (!RULES[id]) throw new Error(`critly: unknown rule ${JSON.stringify(id)} in policy rules.`);
  }
  const frame = () => new Promise(r => { requestAnimationFrame(() => r()); setTimeout(r, 100); });
  async function settle() {
    await document.fonts.ready;
    const until = performance.now() + 3000;
    const busy = () => document.getAnimations().some(a => a.playState === 'running' && Number.isFinite(a.effect?.getComputedTiming().endTime));
    while (busy() && performance.now() < until) await new Promise(r => setTimeout(r, 50));
    await frame(); await frame();
  }

  // ---------- visibility (from lintapple's src/visibility.js) ----------
  const styleCache = new Map();
  const cs = el => { let s = styleCache.get(el); if (!s) { s = getComputedStyle(el); styleCache.set(el, s); } return s; };
  function textRects(el) {
    const rects = [];
    for (const node of el.childNodes) {
      if (node.nodeType !== 3 || !node.textContent.trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      rects.push(...[...range.getClientRects()].filter(r => r.width > 0 && r.height > 0));
    }
    return rects;
  }
  function generatedText(el) {
    return ['::before', '::after'].flatMap(pseudo => {
      const st = getComputedStyle(el, pseudo);
      const literal = st.content.match(/^"((?:[^"\\]|\\.)*)"/)?.[1];
      const text = literal?.replace(/\\([\da-f]{1,6})\s?|\\(.)/gi, (_, h, e) => h ? String.fromCodePoint(Math.min(parseInt(h, 16), 0x10ffff)) : e);
      if (!text?.trim() || st.display === 'none' || st.visibility !== 'visible' || parseFloat(st.opacity) === 0 || parseFloat(st.fontSize) === 0) return [];
      return [{ pseudo, style: st, text }];
    });
  }
  const hiddenCache = new Map();
  // Visually hidden helpers (sr-only, clip: rect(0 0 0 0)) are on screen for assistive tech
  // only, so no visual rule applies to them or to anything inside them.
  function visuallyHidden(el) {
    if (!el || el === document.documentElement) return false;
    if (hiddenCache.has(el)) return hiddenCache.get(el);
    const st = cs(el), r = el.getBoundingClientRect();
    const own = st.clip === 'rect(0px, 0px, 0px, 0px)' || st.clipPath === 'inset(50%)' || (st.position === 'absolute' && r.width <= 1 && r.height <= 1 && st.overflow !== 'visible');
    const out = own || visuallyHidden(el.parentElement);
    hiddenCache.set(el, out);
    return out;
  }
  // The rect of `el` after every ancestor that clips its overflow (overflow other than
  // visible, or contain: paint), up to but not including `stop`. Follows the containing
  // block: an absolute box escapes clippers below its positioned ancestor, a fixed box
  // escapes them all. Border radius is ignored, so the result is slightly generous.
  function overflowClip(el, stop = null) {
    const r = el.getBoundingClientRect(), out = { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
    let pos = cs(el).position;
    for (let n = el.parentElement; n && n !== stop && n !== document.documentElement; n = n.parentElement) {
      const st = cs(n), positioned = st.position !== 'static' || st.transform !== 'none';
      if (pos === 'fixed' && st.transform === 'none') continue;
      if (pos === 'absolute' && !positioned) continue;
      const clips = /hidden|clip|auto|scroll/.test(st.overflowX + st.overflowY) || /paint|strict|content/.test(st.contain);
      if (clips) {
        const b = n.getBoundingClientRect(), left = b.left + n.clientLeft, top = b.top + n.clientTop;
        out.left = Math.max(out.left, left); out.right = Math.min(out.right, left + n.clientWidth);
        out.top = Math.max(out.top, top); out.bottom = Math.min(out.bottom, top + n.clientHeight);
      }
      if (st.position !== 'static') pos = st.position; else if (st.transform !== 'none') pos = 'static';
    }
    return out;
  }
  // Only boxes with area can be clipped away; zero-size ones (display: contents) are judged below.
  const clippedAway = el => { const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return false; const c = overflowClip(el); return c.right - c.left < 1 || c.bottom - c.top < 1; };
  function visible(el) {
    if (!el?.isConnected || el.closest('[inert]') || visuallyHidden(el)) return false;
    if (clippedAway(el)) return false;
    const b = el.getBoundingClientRect();
    if (el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) && b.width > 0 && b.height > 0) return true;
    if (!generatedText(el).length && (cs(el).visibility !== 'visible' || !textRects(el).length)) return false;
    for (let n = el; n; n = n.parentElement) {
      const st = cs(n);
      if (st.display === 'none' || st.contentVisibility === 'hidden' || (st.display !== 'contents' && parseFloat(st.opacity) === 0)) return false;
    }
    return true;
  }
  const ownText = el => [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').replace(/\s+/g, ' ').trim();
  const words = t => /[\p{L}\p{N}]/u.test(t);

  // ---------- stylesheet lookup, for "was this size declared, and in what unit" ----------
  let sheetRules = null, unreadableSheets = false;
  function flatRules() {
    if (sheetRules) return sheetRules;
    sheetRules = [];
    const walk = (list, parent) => {
      for (const r of list) {
        if (r.media && r.conditionText !== undefined && !(r instanceof CSSStyleRule) && !matchMedia(r.conditionText).matches) continue;
        let sel = parent;
        if (r.selectorText) {
          sel = parent ? (r.selectorText.includes('&') ? r.selectorText.replace(/&/g, `:is(${parent})`) : `:is(${parent}) ${r.selectorText}`) : r.selectorText;
          if (r.style?.length) sheetRules.push([sel, r.style]);
        } else if (parent && r.style?.length) sheetRules.push([parent, r.style]);
        if (r.cssRules) walk(r.cssRules, sel);
      }
    };
    for (const sheet of document.styleSheets) { try { walk(sheet.cssRules, null); } catch { unreadableSheets = true; } }
    return sheetRules;
  }
  function declared(el, props) {
    const out = [];
    for (const [sel, style] of flatRules()) {
      let hit = false;
      try { hit = el.matches(sel); } catch { }
      if (hit) for (const p of props) { const v = style.getPropertyValue(p); if (v) out.push([p, v]); }
    }
    for (const p of props) { const v = el.style?.getPropertyValue(p); if (v) out.push([p, v]); }
    return out;
  }

  // ---------- readable locations ----------
  let headings = [];
  // React, Radix and Base UI ids change between renders; they make poor locations.
  const stableId = id => id && !/^(radix-|base-ui-|headlessui-|react-aria|mui-|:r|«)|_R_|[:«»]/.test(id) && !/^[\d-]/.test(id);
  function selectorFor(el) {
    const parts = [];
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const tag = n.tagName.toLowerCase();
      if (stableId(n.id) && document.querySelectorAll(`#${CSS.escape(n.id)}`).length === 1) { parts.unshift(`#${CSS.escape(n.id)}`); break; }
      if (n === document.documentElement || n === document.body || !n.parentElement) { parts.unshift(tag); break; }
      const same = [...n.parentElement.children].filter(s => s.tagName === n.tagName);
      parts.unshift(same.length > 1 ? `${tag}:nth-of-type(${same.indexOf(n) + 1})` : tag);
    }
    return parts.join(' > ');
  }
  const clip40 = t => { t = String(t).replace(/\s+/g, ' ').trim(); return t.length > 40 ? `${t.slice(0, 40)}…` : t; };
  function label(el) {
    if (el === document.documentElement || el === document.body) return '';
    if (el.matches?.('input, textarea, select')) return el.getAttribute('aria-label') || el.labels?.[0]?.textContent || el.getAttribute('placeholder') || el.getAttribute('name') || '';
    return el.getAttribute?.('aria-label') || el.innerText || el.getAttribute?.('alt') || el.getAttribute?.('title') || '';
  }
  function short(el) {
    const tag = el.tagName.toLowerCase();
    let s = tag + (stableId(el.id) ? `#${el.id}` : '');
    const cls = [...(el.classList || [])].filter(c => c.length <= 24 && !/[:[\]/()!.@%]/.test(c) && !UTILITY.test(c)).slice(0, 3);
    if (cls.length) s += `.${cls.join('.')}`;
    const tid = el.getAttribute('data-testid');
    if (tid) s += `[data-testid="${tid}"]`;
    return s;
  }
  function where(el) {
    let s = short(el);
    const text = clip40(label(el));
    if (text) s += ` "${text}"`;
    const dialog = el.parentElement?.closest('dialog, [role="dialog"], [role="alertdialog"]');
    const landmark = el.parentElement?.closest('nav, header, footer, aside, form, table, [role="navigation"], [role="banner"], [role="contentinfo"]');
    if (dialog) {
      const name = dialog.getAttribute('aria-label') || (dialog.getAttribute('aria-labelledby') && document.getElementById(dialog.getAttribute('aria-labelledby'))?.textContent) || dialog.querySelector('h1, h2, h3')?.textContent || '';
      s += ` in <dialog>${name ? ` "${clip40(name)}"` : ''}`;
    } else if (landmark) s += ` in <${landmark.getAttribute('role') ? landmark.getAttribute('role') : landmark.tagName.toLowerCase()}>`;
    let lo = 0, hi = headings.length - 1, found = null;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1, h = headings[mid];
      if (h === el || h.contains(el)) { found = null; break; }
      if (h.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) { found = h; lo = mid + 1; } else hi = mid - 1;
    }
    if (found && !dialog) s += ` under "${clip40(found.textContent)}"`;
    return s;
  }

  async function critlyCheck(input, context = {}) {
    const policy = normalize(input ?? window.__critlyPolicy ?? {});
    validateSelectors(policy);
    if (context.settle !== false) await settle();
    styleCache.clear(); hiddenCache.clear(); sheetRules = null; unreadableSheets = false;
    const root = document.documentElement, body = document.body;
    if (!body) throw new Error('critly: the page has no <body>. Wait for the interface before checking it.');
    const W = root.clientWidth, H = root.clientHeight, mobile = innerWidth <= 640;
    const viewport = context.viewport || `${innerWidth}x${innerHeight}`;
    const scheme = context.scheme || (root.classList.contains('dark') || matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const rootPx = parseFloat(cs(root).fontSize) || 16;
    const ignoreSel = policy.ignore.join(', ');
    headings = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]')].filter(h => h.textContent.trim());

    // Which rules run, and why the others don't.
    const state = {}, skipped = {};
    for (const [id, [, stage, needsPolicy]] of Object.entries(RULES)) {
      const set = policy.rules[id];
      if (stage === 'v2') { skipped[id] = id === 'focus-ring' ? (set === 'error' ? 'runs in the CLI, which presses Tab' : 'opt-in; the CLI presses Tab') : 'needs interaction; not in this version'; continue; }
      if (set === 'off') { skipped[id] = 'off in the policy'; continue; }
      if (stage === 'guarded' && set !== 'error') { skipped[id] = 'opt-in'; continue; }
      if (needsPolicy && NEEDS[id] && !(Array.isArray(policy[NEEDS[id]]) && policy[NEEDS[id]].length)) { skipped[id] = `needs "${NEEDS[id]}" in the policy`; continue; }
      state[id] = true;
    }

    const findings = [], suppressed = [], merged = new Map();
    const add = (rule, el, actual, fix, opts = {}) => {
      if (!state[rule]) return;
      const selector = selectorFor(el);
      const exception = policy.exceptions.find(e => e.rules.includes(rule) && el.closest(e.selector));
      if (exception) { suppressed.push({ rule, where: where(el), selector, reason: exception.reason, viewport, scheme }); return; }
      const key = `${rule}|${opts.key ?? selector}|${actual}|${fix}`;
      const prior = merged.get(key);
      if (prior) { prior.count++; return; }
      const f = { rule, concept: SITE + RULES[rule][0], severity: opts.severity || 'error', where: where(el), selector, actual, fix, viewport, scheme, count: 1 };
      if (policy.note) f.note = policy.note;
      merged.set(key, f);
      findings.push(f);
    };
    const like = el => `${el.tagName}.${[...(el.classList || [])].sort().join('.')}`;

    // Elements in scope: visible, not ignored, not inside an <svg> (the svg itself counts).
    const all = [...document.querySelectorAll('body, body *')];
    const els = all.filter(el => !(el.parentElement?.closest('svg')) && !(ignoreSel && el.closest(ignoreSel)) && visible(el));
    if (!els.length) throw new Error('critly: the page has no visible content. Wait for the interface (--ready <selector>) before checking it.');
    if (els.length > policy.maxElements) throw new Error(`critly: the page has ${els.length} visible elements, over the limit of ${policy.maxElements}. Check a smaller page, or raise "maxElements" in the policy.`);
    const inScope = new Set(els);
    const decorative = el => !!el.closest('[aria-hidden="true"]');
    const textEls = els.filter(el => words(ownText(el)) && !decorative(el));
    const tw = policy.tailwind;

    // Tokens on :root for the scheme that is showing: colors, text sizes, fonts, radii.
    const rootStyle = cs(root), tokens = { colors: [], text: new Map(), fonts: new Map(), spacing: null };
    const want = policy.colorTokens?.length ? policy.colorTokens.map(p => p.endsWith('*') ? n => n.startsWith(p.slice(0, -1)) : n => n === p) : null;
    const palette = /^--color-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|mauve|olive|mist|taupe|black|white)(-\d+)?$/;
    // Tokens that share a value collapse to one name, picked in @shadcn/lint's priority order.
    const PRIORITY = ['background', 'foreground', 'muted', 'muted-foreground', 'primary', 'primary-foreground', 'secondary', 'secondary-foreground', 'accent', 'accent-foreground', 'destructive', 'destructive-foreground', 'border', 'input', 'ring', 'card', 'card-foreground', 'popover', 'popover-foreground'];
    const rank = n => { const i = PRIORITY.indexOf(n.slice(2)); return i < 0 ? PRIORITY.length + n.length / 100 : i; };
    const byValue = new Map();
    for (let i = 0; i < rootStyle.length; i++) {
      const name = rootStyle[i];
      if (!name.startsWith('--') || name.startsWith('--tw-')) continue;
      const value = rootStyle.getPropertyValue(name).trim();
      if (name.startsWith('--text-') && !name.includes('--', 2)) { const v = cssLength(value, rootPx); if (v) tokens.text.set(Math.round(v * 100) / 100, name.slice(7)); continue; }
      if (name.startsWith('--font-') && !/weight|size/.test(name)) { tokens.fonts.set(firstFamily(value).toLowerCase(), name.slice(7)); continue; }
      if (name === '--spacing') { tokens.spacing = cssLength(value, rootPx); continue; }
      if (want ? !want.some(f => f(name)) : palette.test(name)) continue;
      const c = /^[\d.]+(px|rem|em|%|ms|s|deg)?$/.test(value) ? null : parseColor(value);
      if (!c || c[3] === 0) continue;
      const base = name.replace(/^--color-/, '--'), key = hex(c) + c[3].toFixed(2), prior = byValue.get(key);
      if (!prior || rank(base) < rank(prior.name)) byValue.set(key, { name: base, tw: base.slice(2), rgba: c, lab: toLab(c) });
    }
    tokens.colors = [...byValue.values()];
    const tokenName = (t, prefix, extra) => tw ? `${prefix}-${t.tw} (${t.name}${extra ? `, ${extra}` : ''})` : `${t.name}${extra ? ` (${extra})` : ''}`;
    const twSpace = (prefix, n) => { const step = tokens.spacing || 4, k = n / step; return tw && Math.abs(k * 4 - Math.round(k * 4)) < 0.01 ? `${prefix}-${Math.round(k * 4) / 4}` : null; };
    const sizeName = s => { const n = tokens.text.get(s) || TW_TEXT[s]; return tw && n ? `${s}px (text-${n})` : `${s}px`; };

    const coverage = { url: location.href, viewport, scheme, elements: els.length, text: textEls.length, controls: 0, fields: 0, images: 0, numbers: 0, paragraphs: 0, radiusPairs: 0, colorTokens: tokens.colors.length, rules: Object.keys(state), skipped };

    // ---------- text-contrast ----------
    // WCAG math on the layers the browser paints: the text color over every ancestor
    // background, with opacity groups composited exactly. Anything it can't see through
    // (images, gradients, filters, blend modes, shadows, overlapping boxes) becomes a review.
    const paintedBoxes = els.filter(el => { const st = cs(el); return (parseColor(st.backgroundColor)?.[3] > 0 || st.backgroundImage !== 'none' || /^(IMG|VIDEO|CANVAS|IFRAME|svg|OBJECT|EMBED)$/.test(el.tagName)); }).map(el => [el, el.getBoundingClientRect()]);
    const canvasColor = () => { const c = rootStyle.colorScheme; return /dark/.test(c) && (!/light/.test(c) || matchMedia('(prefers-color-scheme: dark)').matches) ? [18 / 255, 18 / 255, 18 / 255, 1] : [1, 1, 1, 1]; };
    // Text over something unknown (an image, a backdrop-filter, another box) still passes when it
    // clears both a black and a white backdrop: luminance under it can only fall between the two.
    const bounds = (F, B) => {
      if (F[3] < 0.999) return 1;
      const t = luminance(unpm(F)), dark = unpm(over(B, [0, 0, 0, 1])), light = unpm(over(B, [1, 1, 1, 1]));
      const a = luminance(dark), b = luminance(light);
      return t >= Math.min(a, b) && t <= Math.max(a, b) ? 1 : Math.min(contrast(unpm(F), dark), contrast(unpm(F), light));
    };
    // Where a box can paint: its rect, cut by ancestors that clip overflow (rows scrolled out
    // of a list, a sheet's content below a phone frame) and by inset() clip-paths up to the
    // shared ancestor (a segmented control's active pill is often a clipped overlay). Other
    // clip-path shapes: null.
    function paintedArea(box, ca) {
      const out = overflowClip(box, ca);
      for (let n = box; n && n !== ca; n = n.parentElement) {
        const cp = cs(n).clipPath;
        if (cp === 'none') continue;
        const m = cp.match(/^inset\(([^)]*?)(?:\s+round\s[^)]*)?\)$/);
        if (!m) return null;
        const b = n.getBoundingClientRect(), v = m[1].trim().split(/\s+/);
        const [t, rt, bt, l] = [v[0], v[1] ?? v[0], v[2] ?? v[0], v[3] ?? v[1] ?? v[0]].map((x, i) => x.endsWith('%') ? parseFloat(x) / 100 * (i % 2 ? b.width : b.height) : parseFloat(x));
        out.left = Math.max(out.left, b.left + l); out.right = Math.min(out.right, b.right - rt);
        out.top = Math.max(out.top, b.top + t); out.bottom = Math.min(out.bottom, b.bottom - bt);
      }
      return out;
    }
    // Simplified paint order inside the shared ancestor: in-flow text paints above in-flow
    // backgrounds; positioned boxes paint above flow, by z-index, then by document order.
    const zLevel = (n, ca) => { let z = -0.5; for (; n && n !== ca; n = n.parentElement) { const st = cs(n); if (st.position !== 'static') z = st.zIndex === 'auto' ? Math.max(z, 0) : parseInt(st.zIndex, 10); } return z; };
    const inFront = (box, el, ca) => { const a = zLevel(box, ca), b = zLevel(el, ca); return a > b || (a === b && a >= 0 && !!(el.compareDocumentPosition(box) & Node.DOCUMENT_POSITION_FOLLOWING)); };
    function layersBehind(el, rects, fg) {
      const ops = [];
      let F = pm(fg), B = [0, 0, 0, 0], unknown = null;
      const unknownAt = (why, f, b, asLoaded = false) => { if (!unknown) unknown = { why, worst: bounds(f, b), asLoaded }; };
      // A painted box that isn't an ancestor but sits under the text (a sliding tab indicator, a
      // card's background layer) joins the backdrop where its branch meets the text's branch.
      const centers = rects.map(t => [(t.left + t.right) / 2, (t.top + t.bottom) / 2]);
      const under = new Map(), front = [];
      for (const [box, r] of paintedBoxes) {
        if (box === el || box.contains(el) || el.contains(box) || !centers.some(([x, y]) => x > r.left && x < r.right && y > r.top && y < r.bottom)) continue;
        let ca = box.parentElement; while (ca && !ca.contains(el)) ca = ca.parentElement;
        const area = paintedArea(box, ca);
        if (area && !centers.some(([x, y]) => x > area.left && x < area.right && y > area.top && y < area.bottom)) continue;
        if (!ca) continue;
        if (area && inFront(box, el, ca)) { front.push(box); continue; }
        under.set(ca, [...(under.get(ca) || []), area ? box : { clipped: box }]);
      }
      // An opaque box painted over the text hides it: nothing to measure.
      if (front.some(b => parseColor(cs(b).backgroundColor)?.[3] >= 0.999 && parseFloat(cs(b).opacity) === 1)) return { hidden: true };
      for (let n = el; n; n = n.parentElement) {
        const st = cs(n);
        for (const box of (under.get(n) || []).reverse()) {
          if (B[3] >= 0.999 || unknown) break;
          if (box.clipped) { unknownAt(`it sits over ${short(box.clipped)}, which is clipped to a shape (clip-path)`, F, B); break; }
          const bs = cs(box), c = parseColor(bs.backgroundColor);
          if (bs.backgroundImage !== 'none' || /^(IMG|VIDEO|CANVAS|IFRAME|svg|OBJECT|EMBED)$/.test(box.tagName)) { unknownAt(`it sits over ${short(box)}, ${bs.backgroundImage !== 'none' ? 'which has a background image or gradient' : 'an image or media element'}`, F, B); break; }
          if (c && c[3] > 0) { const layer = pm(c).map(v => v * (parseFloat(bs.opacity) || 0)); ops.push(['bg', layer]); F = over(F, layer); B = over(B, layer); }
        }
        if (st.mixBlendMode !== 'normal') return { why: `${short(n)} uses mix-blend-mode: ${st.mixBlendMode}` };
        if (st.filter !== 'none') return { why: `${short(n)} has a filter (${clip40(st.filter)})` };
        if (B[3] < 0.999 && !unknown) {
          for (const pseudo of ['::before', '::after']) {
            const ps = getComputedStyle(n, pseudo);
            if (!/^(none|normal)$/.test(ps.content) && /absolute|fixed/.test(ps.position) && (parseColor(ps.backgroundColor)?.[3] > 0 || ps.backgroundImage !== 'none')) unknownAt(`a ${pseudo} layer on ${short(n)} paints behind it`, F, B);
          }
          if (st.backgroundImage !== 'none') unknownAt(`${short(n)} has a background image or gradient behind it`, F, B);
        }
        const bg = parseColor(st.backgroundColor);
        if (bg && bg[3] > 0) { ops.push(['bg', pm(bg)]); F = over(F, pm(bg)); B = over(B, pm(bg)); }
        const o = st.display === 'contents' ? 1 : parseFloat(st.opacity);
        if (o < 1) { ops.push(['op', o]); F = F.map(v => v * o); B = B.map(v => v * o); }
        if (st.backdropFilter !== 'none' && B[3] < 0.999 && !unknown) unknownAt(`${short(n)} is translucent with backdrop-filter, so whatever scrolls behind it changes the contrast`, F, B, true);
      }
      const cv = pm(canvasColor());
      // A translucent box in front (a scrim) tints text and background alike.
      const tint = c => { let x = pm(c); for (const b of front) { const bc = parseColor(cs(b).backgroundColor); if (bc) x = over(pm(bc).map(v => v * parseFloat(cs(b).opacity)), x); } return unpm(x); };
      const composite = c => { let x = pm(c); for (const [kind, v] of ops) x = kind === 'bg' ? over(x, v) : x.map(y => y * v); return tint(unpm(over(x, cv))); };
      return { bg: tint(unpm(over(B, cv))), composite, unknown };
    }
    // Names the fix: a token in the same color family that passes; for a colored value with no
    // such token, the same hue made darker or lighter; for grays, the nearest text token.
    function contrastFix(fgColor, layers, need) {
      const bg = layers.bg, lab = toLab(fgColor), colored = Math.hypot(lab[1], lab[2]) > 0.03;
      const passing = tokens.colors.map(t => [t, contrast(layers.composite(t.rgba), bg), distance(lab, t.lab)]).filter(([, r]) => r >= need).sort((a, b) => a[2] - b[2]);
      const hue = l => Math.atan2(l[2], l[1]) * 180 / Math.PI, chroma = l => Math.hypot(l[1], l[2]);
      const family = t => colored ? chroma(t.lab) > 0.03 && Math.abs(((hue(t.lab) - hue(lab) + 540) % 360) - 180) < 35 : chroma(t.lab) <= 0.03;
      const near = passing.filter(([t, , d]) => d <= 0.15 && family(t)), text = passing.filter(([t]) => /foreground|text|fg|content/.test(t.name));
      const say = list => list.slice(0, 2).map(([t, r]) => tokenName(t, 'text', fmtRatio(r))).join(' or ');
      if (near.length || (!colored && text.length)) return `Use ${say(near.length ? near : text)}; needs ${need}:1.`;
      let best = null;
      for (const end of [0, 1]) {
        if (contrast(layers.composite([...fromLab([end, lab[1], lab[2]]), fgColor[3]]), bg) < need) continue;
        let lo = lab[0], hi = end;
        for (let i = 0; i < 24; i++) { const mid = (lo + hi) / 2; if (contrast(layers.composite([...fromLab([mid, lab[1], lab[2]]), fgColor[3]]), bg) >= need) hi = mid; else lo = mid; }
        const L = end ? Math.min(1, hi + 0.004) : Math.max(0, hi - 0.004);
        if (!best || Math.abs(L - lab[0]) < best.d) best = { c: fromLab([L, lab[1], lab[2]]), d: Math.abs(L - lab[0]), dark: !end };
      }
      if (!best) return `No text color reaches ${need}:1 on this background; change the background.`;
      const alt = text.length ? ` Or use ${say(text.slice(0, 1))}.` : tokens.colors.length ? ' No color token reaches it here; add one only if the design calls for it, and ask the user first.' : '';
      return `${best.dark ? 'Darken' : 'Lighten'} it to ${hex(best.c)} or ${best.dark ? 'darker' : 'lighter'}${colored ? ', same hue' : ''}; needs ${need}:1.${alt}`;
    }
    function checkContrast(el, st, rects, kind) {
      const size = parseFloat(st.fontSize), bold = parseFloat(st.fontWeight) >= 700;
      const need = size >= 24 || (bold && size >= 18.66) ? 3 : 4.5;
      const review = why => add('text-contrast', el, `can't measure${kind ? ` the ${kind}` : ''}: ${why}`, `Look at it in each scheme listed: it needs ${need}:1. Fix it, or ask the user for a reasoned exception.`, { severity: 'review', key: why });
      if (st.textShadow !== 'none') return review('it has a text-shadow');
      if (/text/.test(st.backgroundClip + st.webkitBackgroundClip)) return review('it is gradient or image text (background-clip: text)');
      if (parseFloat(st.webkitTextStrokeWidth) > 0) return review('it has a text stroke');
      const fg = parseColor(st.webkitTextFillColor || st.color);
      if (!fg) return review(`its color (${st.color}) can't be parsed`);
      if (fg[3] === 0) return;
      const layers = layersBehind(el, rects, fg);
      if (layers.hidden) return;
      if (layers.why) return review(layers.why);
      const shown = layers.composite(fg), r = contrast(shown, layers.bg);
      if (layers.unknown && layers.unknown.worst >= need) return;
      if (layers.unknown && !layers.unknown.asLoaded) return review(`${layers.unknown.why}; over its darkest or lightest parts it can drop to ${fmtRatio(layers.unknown.worst)}`);
      if (layers.unknown && r >= need) return add('text-contrast', el, `${fmtRatio(r)}${kind ? ` (${kind})` : ''} as loaded, but ${layers.unknown.why}; over other content it can drop to ${fmtRatio(layers.unknown.worst)}`, `Look at it in each scheme listed: it needs ${need}:1 over anything that can sit behind it. A more opaque surface behind the text fixes it for good.`, { severity: 'review', key: layers.unknown.why });
      if (r < need) add('text-contrast', el, `${fmtRatio(r)}${kind ? ` (${kind})` : ''}, ${hex(shown)} on ${hex(layers.bg)}`, contrastFix(fg, layers, need), { key: like(el) + hex(shown) + hex(layers.bg) });
    }
    if (state['text-contrast']) {
      for (const el of textEls) {
        if (el.closest(':disabled, [aria-disabled="true"]')) continue;
        checkContrast(el, cs(el), textRects(el));
      }
      for (const el of els.filter(e => e.matches('input:not([type="hidden"],[type="checkbox"],[type="radio"],[type="range"],[type="color"],[type="file"],[type="image"]), textarea, select') && !e.matches(':disabled') && !decorative(e))) {
        const r = [el.getBoundingClientRect()];
        if (el.value && words(el.value)) checkContrast(el, cs(el), r, el.tagName === 'SELECT' ? '' : 'value');
        if (el.matches(':placeholder-shown') && words(el.placeholder || '')) checkContrast(el, getComputedStyle(el, '::placeholder'), r, 'placeholder');
      }
    }

    // ---------- hit-area, icon-button-name ----------
    const controls = els.filter(el => el.matches(CONTROL) && !el.matches(':disabled, [aria-disabled="true"]') && !decorative(el));
    coverage.controls = controls.length;
    const inlineLink = el => (el.matches('a[href], [role="link"]') && !el.matches('[role="button"]')) && cs(el).display === 'inline' && words(el.textContent);
    for (const el of controls) {
      if (inlineLink(el) || el.matches('option, [role="option"]') && el.closest('select')) continue;
      let r = el.getBoundingClientRect(), w = r.width, h = r.height;
      if (el.matches('input[type="checkbox"], input[type="radio"]') && el.labels?.length) {
        const all_ = [r, ...[...el.labels].filter(visible).map(l => l.getBoundingClientRect())];
        w = Math.max(...all_.map(b => b.right)) - Math.min(...all_.map(b => b.left));
        h = Math.max(...all_.map(b => b.bottom)) - Math.min(...all_.map(b => b.top));
      }
      if (cs(el).position !== 'static') for (const pseudo of ['::before', '::after']) {
        const ps = getComputedStyle(el, pseudo);
        if (/^(none|normal)$/.test(ps.content) || ps.display === 'none' || !/absolute|fixed/.test(ps.position) || ps.pointerEvents === 'none') continue;
        w = Math.max(w, parseFloat(ps.width) || 0); h = Math.max(h, parseFloat(ps.height) || 0);
      }
      const min = mobile ? 44 : 24;
      if (w + 0.5 >= min && h + 0.5 >= min) continue;
      // A ::after inset is measured from the padding box, so borders don't count toward it.
      const st_ = cs(el), bx = (parseFloat(st_.borderLeftWidth) || 0) + (parseFloat(st_.borderRightWidth) || 0), by = (parseFloat(st_.borderTopWidth) || 0) + (parseFloat(st_.borderBottomWidth) || 0);
      const nx = Math.max(0, Math.ceil((min - w) / 2)), ny = Math.max(0, Math.ceil((min - h) / 2));
      const n = Math.max(Math.ceil((min - (r.width - bx)) / 2), Math.ceil((min - (r.height - by)) / 2), 0);
      const pad = nx && ny ? (nx === ny ? `${nx}px of padding${twSpace('p', nx) ? ` (${twSpace('p', nx)})` : ''}` : `${nx}px of side padding and ${ny}px top and bottom`) : nx ? `${nx}px of side padding${twSpace('px', nx) ? ` (${twSpace('px', nx)})` : ''}` : `${ny}px of padding top and bottom${twSpace('py', ny) ? ` (${twSpace('py', ny)})` : ''}`;
      add('hit-area', el, `${Math.round(w * 10) / 10}×${Math.round(h * 10) / 10}px`, `Make it at least ${min}×${min}px${mobile ? ' at ≤ 640px wide' : ''}: add ${pad}, or keep the look and extend the target with a ::after { content: ""; position: absolute; inset: -${n}px } on the position: relative control.`, { key: like(el) + Math.round(w) + 'x' + Math.round(h) });
    }
    const ICON_WORDS = { x: 'Close', close: 'Close', 'x-mark': 'Close', search: 'Search', menu: 'Open menu', trash: 'Delete', 'trash-2': 'Delete', copy: 'Copy', settings: 'Settings', plus: 'Add', 'chevron-left': 'Previous', 'chevron-right': 'Next', 'arrow-left': 'Back', share: 'Share', edit: 'Edit', pencil: 'Edit', download: 'Download', moon: 'Toggle theme', sun: 'Toggle theme', github: 'GitHub', 'more-horizontal': 'More options', ellipsis: 'More options' };
    function contentName(n) {
      let out = '';
      for (const c of n.childNodes) {
        if (c.nodeType === 3) out += c.textContent;
        else if (c.nodeType === 1 && c.getAttribute('aria-hidden') !== 'true' && cs(c).display !== 'none') {
          const inner = c.getAttribute('aria-label') || (c.tagName === 'IMG' ? c.getAttribute('alt') || '' : c.tagName.toLowerCase() === 'svg' ? c.querySelector('title')?.textContent || '' : contentName(c));
          out += ` ${inner.trim() ? inner : c.getAttribute('title') || ''} `; // a child's title counts when it has no other name
        }
      }
      return out;
    }
    const accessibleName = el => {
      const ids = el.getAttribute('aria-labelledby');
      const by = ids ? ids.split(/\s+/).map(id => document.getElementById(id)?.textContent || '').join(' ').trim() : '';
      return by || el.getAttribute('aria-label')?.trim() || (el.matches('input') ? el.value || el.getAttribute('alt') || [...(el.labels || [])].map(l => l.textContent).join(' ') : contentName(el)).trim() || el.getAttribute('title')?.trim() || '';
    };
    const visibleWords = el => { const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); for (let t = walker.nextNode(); t; t = walker.nextNode()) if (words(t.textContent) && inScope.has(t.parentElement) && !decorative(t.parentElement)) return true; return false; };
    for (const el of controls.filter(e => e.matches('button, [role="button"], a[href], input[type="image"]'))) {
      if (visibleWords(el) || accessibleName(el)) continue;
      const icon = [...el.querySelectorAll('svg, img, i, [class*="icon"]')][0];
      const iconName = icon && [...(icon.classList || [])].map(c => c.replace(/^(lucide|icon|fa|tabler|ri|bi|heroicon)-/, '')).find(c => ICON_WORDS[c]);
      const guess = iconName ? ICON_WORDS[iconName] : '…';
      add('icon-button-name', el, icon ? 'shows only an icon and has no accessible name' : 'has no text and no accessible name', `Add aria-label="${guess}" (name the action, not the icon), or put visually hidden text inside it: <span class="sr-only">${guess}</span>.`, { key: like(el) });
    }

    // ---------- input-details ----------
    const fields = els.filter(el => el.matches(FIELD) && !decorative(el));
    coverage.fields = fields.length;
    for (const el of fields) {
      const hasLabel = el.getAttribute('aria-labelledby') && accessibleName(el) || el.getAttribute('aria-label')?.trim() || [...(el.labels || [])].some(l => l.textContent.trim()) || el.getAttribute('title')?.trim();
      if (!hasLabel) {
        const ph = el.getAttribute('placeholder');
        add('input-details', el, ph ? `no label (the placeholder "${clip40(ph)}" disappears once someone types, so it isn't one)` : 'no label', `Give it a visible <label for="${el.id || 'field-id'}">, or aria-label="…" if the design has no room for one.`);
      }
      const entry = el.matches('textarea, select, [role="textbox"], [role="searchbox"], [role="combobox"]') || (el.matches('input') && TEXT_ENTRY.test(el.type || ''));
      const size = parseFloat(cs(el).fontSize);
      if (mobile && entry && size < 16) add('input-details', el, `font-size ${px(size)} at ${innerWidth}px wide`, `Set font-size: 16px at ≤ 640px wide${tw ? ' (text-base md:text-sm)' : ''}, so iOS doesn't zoom in on focus. Don't disable zoom instead.`, { key: like(el) + size });
    }

    // ---------- type-scale, font-family, letter-spacing, line-length ----------
    const typeTargets = [...textEls.map(el => [el, cs(el), '']), ...fields.filter(el => el.value || el.placeholder).map(el => [el, cs(el), ''])];
    for (const el of els) if (!decorative(el)) for (const g of generatedText(el)) if (words(g.text)) typeTargets.push([el, g.style, g.pseudo]);
    for (const [el, st, pseudo] of typeTargets) {
      const size = Math.round(parseFloat(st.fontSize) * 100) / 100;
      if (state['type-scale']) {
        const role = policy.typeRoles.find(r => el.closest(r.selector));
        const scale = role ? role.sizes : policy.typeScale;
        if (!scale.some(s => Math.abs(s - size) < 0.1)) {
          const [a, b] = nearest(size, scale);
          add('type-scale', el, `font-size ${px(size)}${pseudo ? ` on ${pseudo}` : ''}`, `Use ${sizeName(a)}${b !== undefined ? ` or ${sizeName(b)}` : ''}${role ? ` (the sizes for ${role.selector})` : ', the nearest steps on the type scale'}.`, { key: like(el) + size });
        }
      }
      if (state['font-family'] && !el.closest(CODE)) {
        const family = firstFamily(st.fontFamily);
        if (!policy.fonts.some(f => f.toLowerCase() === family.toLowerCase())) {
          const opts = policy.fonts.map(f => tw && tokens.fonts.has(f.toLowerCase()) ? `${f} (font-${tokens.fonts.get(f.toLowerCase())})` : f);
          add('font-family', el, `font-family ${family}${pseudo ? ` on ${pseudo}` : ''}`, `Use ${opts.length > 1 ? `one of ${opts.join(', ')}` : opts[0]}. Set it once on body and let it inherit.`, { key: like(el) + family });
        }
      }
    }
    for (const el of state['letter-spacing'] ? textEls.filter(e => !e.closest(CODE + ', abbr')) : []) {
      const st = cs(el), text = ownText(el), size = parseFloat(st.fontSize);
      const ls = st.letterSpacing === 'normal' ? 0 : parseFloat(st.letterSpacing);
      const letters = text.replace(/[^\p{L}]/gu, '');
      const literalCaps = letters.length >= 4 && letters === letters.toUpperCase() && letters !== letters.toLowerCase() && (/\p{L}{2,}\s+\p{L}{2,}/u.test(text) || letters.length >= 6);
      const caps = (st.textTransform === 'uppercase' && letters.length >= 2) || /all-small-caps|all-petite-caps/.test(st.fontVariantCaps) || literalCaps;
      if (caps && ls <= 0.001) add('letter-spacing', el, `all-caps text with letter-spacing ${ls ? px(ls) : 'normal'}`, `Add letter-spacing between 0.05em and 0.1em${tw ? ' (tracking-wider is 0.05em, tracking-widest 0.1em)' : ''}; capitals crowd together at small sizes.`, { key: like(el) + ls });
      else if (!caps && size >= 32 && ls > 0.001 * size) add('letter-spacing', el, `${px(size)} display text with letter-spacing +${px(ls)} (${Math.round(ls / size * 1000) / 1000}em)`, `Remove the positive tracking: use 0 or about -0.02em${tw ? ' (tracking-tight is -0.025em)' : ''}; large text needs less space between letters, not more.`, { key: like(el) + ls });
    }
    const measure = document.createElement('canvas').getContext('2d');
    const SAMPLE = 'The quick brown fox jumps over the lazy dog while five wizards box, and then some ordinary words settle in.';
    for (const el of state['line-length'] ? textEls.filter(e => e.matches('p, li, dd, blockquote, figcaption') && !e.closest(CODE + ', td, th, [role="cell"]')) : []) {
      coverage.paragraphs++;
      const range = document.createRange();
      range.selectNodeContents(el);
      const lines = [];
      for (const r of range.getClientRects()) {
        if (!r.width || !r.height) continue;
        const line = lines.find(l => r.top < l.bottom - 2 && r.bottom > l.top + 2);
        if (line) { line.left = Math.min(line.left, r.left); line.right = Math.max(line.right, r.right); } else lines.push({ top: r.top, bottom: r.bottom, left: r.left, right: r.right });
      }
      if (lines.length < 2) continue;
      const st = cs(el);
      measure.font = `${st.fontStyle} ${st.fontWeight} ${st.fontSize} ${st.fontFamily}`;
      const ls = st.letterSpacing === 'normal' ? 0 : parseFloat(st.letterSpacing) || 0;
      const avg = measure.measureText(SAMPLE).width / SAMPLE.length + ls;
      const widest = Math.max(...lines.map(l => l.right - l.left)), chars = Math.round(widest / avg);
      if (chars <= policy.lineLength + 2) continue;
      const ch = Math.floor(policy.lineLength * avg / (measure.measureText('0').width + ls));
      add('line-length', el, `about ${chars} characters per line (${Math.round(widest)}px of ${st.fontSize} ${firstFamily(st.fontFamily)})`, `Cap the measure near ${policy.lineLength} characters: max-width: ${ch}ch${tw ? ` (max-w-[${ch}ch])` : ''} for this font and size, or a narrower column.`, { key: like(el) + chars });
    }

    // ---------- tabular-numbers (numeric cells inferred, as in lintapple) ----------
    const numeric = t => /^[+−\-–(]?[$€£¥₹]?\s?[\d\s,.:%]+\)?\s?(%|[a-zA-Z]{1,3})?$/.test(t) && /\d/.test(t);
    for (const el of els.filter(e => e.matches('[data-critly-number], td, [role="cell"], [role="gridcell"]'))) {
      const cell = !el.matches('[data-critly-number]'), text = el.textContent.replace(/\s+/g, ' ').trim();
      if (cell && !numeric(text)) continue;
      coverage.numbers++;
      const st = cs(el);
      if (!st.fontVariantNumeric.split(/\s+/).includes('tabular-nums') && !/["']tnum["'](\s+(1|on))?(\s*,|$)/.test(st.fontFeatureSettings))
        add('tabular-numbers', el, `proportional figures (font-variant-numeric: ${st.fontVariantNumeric})`, `Set font-variant-numeric: tabular-nums${tw ? ' (tabular-nums)' : ''} so digits line up and don't shift as values change.`, { key: like(el) });
      const end = st.direction === 'rtl' ? /left|start/ : /right|end/; // includes -webkit-right from align="right"
      if (cell && !end.test(st.textAlign) && !(st.display.includes('flex') && /end|right/.test(st.justifyContent)))
        add('tabular-numbers', el, `numeric cell is ${st.textAlign.replace('-webkit-', '')}-aligned`, `End-align the numeric column: text-align: right${tw ? ' (text-right)' : ''} on its cells and header, so place values line up.`, { key: like(el) + 'align' });
    }

    // ---------- html-background ----------
    const htmlBg = parseColor(rootStyle.backgroundColor), bodyBg = parseColor(cs(body).backgroundColor);
    if (!htmlBg || htmlBg[3] === 0) add('html-background', root, `<html> has no background (${rootStyle.backgroundColor})${bodyBg?.[3] ? `; body is ${hex(bodyBg)}` : ''}`, `Set the page background on <html> too${bodyBg?.[3] ? ` (${hex(bodyBg)})` : ''}${tw ? ', e.g. bg-background on <html>' : ''}, in every color scheme, so overscroll and the area outside body match.`);
    else if (bodyBg && bodyBg[3] > 0 && distance(toLab(htmlBg), toLab(bodyBg)) > 0.02 && htmlBg[3] > 0.99) add('html-background', root, `<html> is ${hex(htmlBg)} but body is ${hex(bodyBg)}`, `Give <html> the same background as body (${hex(bodyBg)}) in this scheme, so overscroll doesn't show a different color.`);

    // ---------- transition-all, layout-animation ----------
    const LAYOUT = /^(width|height|top|left|right|bottom|inset(-.+)?|margin(-.+)?|padding(-.+)?|(min|max)-(width|height)|flex-basis|grid-template-(rows|columns))$/;
    const kebab = s => s.replace(/[A-Z]/g, c => '-' + c.toLowerCase());
    const durations = st => st.transitionDuration.split(',').map(d => parseFloat(d) * (d.trim().endsWith('ms') ? 1 : 1000));
    for (const el of els) {
      const st = cs(el);
      if (st.transitionProperty === 'none') continue;
      const props = st.transitionProperty.split(',').map(s => s.trim()), times = durations(st);
      // Reduced-motion overrides often leave 0.01ms or 1ms: that's no transition at all.
      const timed = props.filter((p, i) => times[i % times.length] > 10);
      if (timed.includes('all')) add('transition-all', el, `transition: all ${times[props.indexOf('all') % times.length]}ms`, `List only what changes: transition-property: color, background-color, box-shadow${tw ? ' (transition-colors, or transition-[color,background-color,box-shadow])' : ''}, or transform and opacity for movement. "all" animates layout properties too.`, { key: like(el) });
      const layout = timed.filter(p => LAYOUT.test(p));
      if (layout.length) add('layout-animation', el, `transition on ${layout.join(', ')}`, `Animate transform and opacity instead: scale or translate the element, or use a clip-path reveal, so the browser doesn't recompute layout every frame.`, { key: like(el) + layout });
    }
    for (const a of document.getAnimations()) {
      const target = a.effect?.target;
      if (!target || !inScope.has(target) || a instanceof CSSTransition) continue;
      const props = [...new Set((a.effect.getKeyframes?.() || []).flatMap(k => Object.keys(k).map(kebab)))].filter(p => LAYOUT.test(p));
      if (props.length) add('layout-animation', target, `${a.animationName ? `@keyframes ${a.animationName}` : 'an animation'} animates ${props.join(', ')}`, `Animate transform and opacity instead (translate or scale, or clip-path for reveals), so each frame skips layout.`, { key: like(target) + props });
    }

    // ---------- image-dimensions ----------
    const images = els.filter(el => el.tagName === 'IMG' && el.getBoundingClientRect().width > 2);
    coverage.images = images.length;
    for (const img of state['image-dimensions'] ? images : []) {
      const st = cs(img), r = img.getBoundingClientRect();
      const attrs = img.hasAttribute('width') && img.hasAttribute('height');
      const ratio = st.aspectRatio !== 'auto' && !/^auto$/.test(st.aspectRatio);
      const set = v => v && !/^(auto|initial|unset|inherit|fit-content|max-content|min-content)$/.test(v.trim());
      const decl = attrs || ratio ? [] : declared(img, ['width', 'height', 'inline-size', 'block-size', 'inset', 'top', 'bottom']);
      const has = p => decl.some(([k, v]) => k === p && set(v));
      const sized = attrs || ratio || ((has('width') || has('inline-size')) && (has('height') || has('block-size'))) || (/absolute|fixed/.test(st.position) && (has('inset') || (has('top') && has('bottom'))));
      const natural = img.naturalWidth ? `${img.naturalWidth}×${img.naturalHeight}` : '';
      if (!sized) add('image-dimensions', img, `no width and height${natural ? ` (natural size ${natural})` : ''} and no aspect-ratio`, `Add width="${img.naturalWidth || Math.round(r.width)}" height="${img.naturalHeight || Math.round(r.height)}" (or aspect-ratio in CSS) so the page reserves its space before it loads.`, { severity: unreadableSheets ? 'review' : 'error', key: like(img) });
      if (img.loading === 'lazy' && r.width * r.height >= 4096 && r.top + scrollY < innerHeight && r.bottom + scrollY > 0) add('image-dimensions', img, `loading="lazy" on a ${Math.round(r.width)}×${Math.round(r.height)}px image that starts above the fold`, `Load it eagerly: remove loading="lazy"${/_next\/image/.test(img.src) ? ' (next/image: add priority, or preload)' : ''}, and lazy-load only what's below the fold.`, { key: like(img) + 'lazy' });
    }

    // ---------- placeholder-content (block-aware text, as in lintapple) ----------
    const builtIn = [[/\blorem ipsum\b|\bdolor sit amet\b/i, 'lorem ipsum'], [/\bjohn doe\b|\bjane doe\b/i, 'a placeholder name'], [/\b(TODO|FIXME)\b/, 'a TODO note'], [/\[object Object\]/, 'an unformatted object'], [/^(undefined|null|NaN|Invalid Date)$/, 'a missing value']];
    const phrases = [...builtIn, ...policy.bannedPhrases.map(p => [new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+'), 'i'), `the banned phrase "${p}"`])];
    const textCache = new Map();
    const textOf = el => {
      if (textCache.has(el)) return textCache.get(el);
      let t = '';
      if (!el.matches(CODE + ', q') && !decorative(el) && (inScope.has(el) || cs(el).display === 'contents')) for (const n of el.childNodes) {
        if (n.nodeType === 3) t += n.textContent;
        else if (n.nodeType === 1) { const d = cs(n).display; t += d.startsWith('inline') || d === 'contents' ? textOf(n) : `\n${textOf(n)}\n`; }
      }
      t = t.replace(/[ \t\r\f\v]+/g, ' ');
      textCache.set(el, t);
      return t;
    };
    const quoted = (t, re) => { const m = t.match(new RegExp(re.source, re.flags.replace('g', ''))); if (!m) return true; const before = t[m.index - 1], after = t[m.index + m[0].length]; return /["“”'‘’«»]/.test(before || '') && /["“”'‘’«»]/.test(after || ''); };
    if (state['placeholder-content']) for (const el of els) {
      const t = textOf(el);
      if (!t.trim()) continue;
      for (const [re, what] of phrases) {
        const line = re.source.startsWith('^') ? t.trim() : t;
        if (!re.test(line) || quoted(line, re) || [...el.children].some(c => re.test(re.source.startsWith('^') ? textOf(c).trim() : textOf(c)))) continue;
        add('placeholder-content', el, `shows ${what}: "${clip40(line.trim())}"`, what === 'a missing value' || what === 'an unformatted object' ? 'A value failed to render. Format it before rendering, and show a real fallback (an em dash, "Not set") when it is missing.' : 'Replace it with real content: a realistic name, a real sentence, or the actual value. For missing data, design an empty state.');
      }
    }
    if (state['placeholder-content']) for (const el of fields) {
      const ph = el.getAttribute('placeholder') || '';
      const hit = phrases.find(([re]) => re.test(ph));
      if (hit) add('placeholder-content', el, `placeholder shows ${hit[1]}: "${clip40(ph)}"`, 'Use a placeholder that shows the format (name@company.com), or none; the label already says what goes there.');
    }

    // ---------- overflow (clip, scroll and containing-block context from lintapple) ----------
    if (state.overflow) {
      const clientBounds = c => { const b = c.getBoundingClientRect(), sx = c.offsetWidth ? b.width / c.offsetWidth : 1, sy = c.offsetHeight ? b.height / c.offsetHeight : 1, left = b.left + c.clientLeft * sx, top = b.top + c.clientTop * sy; return { left, top, right: left + c.clientWidth * sx, bottom: top + c.clientHeight * sy }; };
      const scrolls = (n, axis) => !['inline', 'contents'].includes(cs(n).display) && /^(auto|scroll)$/.test(cs(n)[`overflow${axis}`]) && n !== body && n !== root;
      const boundsCache = new Map();
      const contextFor = el => {
        const ancestors = [];
        let cb = null, overlay = false;
        for (let n = el; n; n = n.parentElement) {
          const st = cs(n);
          overlay ||= st.position === 'fixed' || n.matches('dialog[open], [role="dialog"], [role="alertdialog"]');
          if (cb && n !== cb) continue;
          ancestors.push(n);
          if (st.position === 'fixed') break;
          cb = st.position === 'absolute' ? n.offsetParent ?? root : null;
        }
        const clips = ancestors.filter(n => n !== root && n !== body && n instanceof HTMLElement && !['inline', 'contents'].includes(cs(n).display)).map(n => ({ element: n, x: /^(hidden|clip)$/.test(cs(n).overflowX), y: /^(hidden|clip)$/.test(cs(n).overflowY) })).filter(c => c.x || c.y);
        for (const c of clips) { if (!boundsCache.has(c.element)) boundsCache.set(c.element, clientBounds(c.element)); c.bounds = boundsCache.get(c.element); }
        return { ancestors, clips, overlay, boxX: ancestors.slice(1).some(n => scrolls(n, 'X')), boxY: ancestors.slice(1).some(n => scrolls(n, 'Y')) };
      };
      const scrollsWithin = (ancestors, clip, axis) => ancestors.some(n => n !== clip.element && clip.element.contains(n) && scrolls(n, axis));
      const clipRect = (r, clips, el, self) => { const o = { left: r.left, top: r.top, right: r.right, bottom: r.bottom }; for (const c of clips) { if (!self && c.element === el) continue; if (c.x) { o.left = Math.max(o.left, c.bounds.left); o.right = Math.min(o.right, c.bounds.right); } if (c.y) { o.top = Math.max(o.top, c.bounds.top); o.bottom = Math.min(o.bottom, c.bounds.bottom); } } return o; };
      const viewportClips = st => /hidden|clip/.test(st.overflowX);
      const pageWidth = Math.max(root.scrollWidth, body.scrollWidth), pageOver = pageWidth - W;
      const pageScrolls = pageOver > 1 && !(viewportClips(rootStyle) || (rootStyle.overflowX === 'visible' && viewportClips(cs(body))));
      const meaningful = el => words(ownText(el)) || el.matches(CONTROL + ', img, video, canvas, iframe') || (el.tagName.toLowerCase() === 'svg' && el.getBoundingClientRect().width > 16);
      const escaped = [];
      for (const el of els) {
        if (!(el instanceof HTMLElement || el.tagName.toLowerCase() === 'svg') || decorative(el) && !pageScrolls) continue;
        const ctx = contextFor(el);
        const r = clipRect(el.getBoundingClientRect(), ctx.clips, el, false);
        if (r.right - r.left > 0.5 && r.bottom - r.top > 0.5) {
          const right = r.right - W, left = -r.left;
          const crosses = r.right > 0 && r.left < W;
          if (!ctx.boxX && (right > 1 || left > 1) && (crosses || (right > 1 && pageScrolls)) && (pageScrolls || meaningful(el)) && !escaped.some(e => e.contains(el))) {
            escaped.push(el);
            add('overflow', el, `${right > 1 ? `extends ${Math.round(right)}px past the right edge` : `starts ${Math.round(left)}px past the left edge`} of the ${W}px screen${pageScrolls ? ', so the page scrolls sideways' : ', so it is cut off'}`, `Let it fit: max-width: 100%${tw ? ' (max-w-full)' : ''}, min-width: 0 on flex and grid children, overflow-wrap: anywhere for long words, or give wide content its own horizontal scroll (overflow-x: auto).`, { key: like(el) + Math.round(right) });
          }
          if (ctx.overlay && !ctx.boxY && r.right > 0 && r.left < W && r.top < H && r.bottom > 0 && (r.bottom - H > 1 || -r.top > 1) && meaningful(el) && !escaped.some(e => e.contains(el))) {
            escaped.push(el);
            add('overflow', el, `a fixed element or open dialog runs ${r.bottom - H > 1 ? `${Math.round(r.bottom - H)}px below` : `${Math.round(-r.top)}px above`} the ${H}px-tall screen`, `Keep overlays on screen: max-height: 100dvh with overflow-y: auto inside, and max-width: calc(100vw - 32px).`, { key: like(el) });
          }
        }
        const rects = textRects(el);
        if (!rects.length) continue;
        const st = cs(el), tol = Math.max(2, 0.25 * parseFloat(st.fontSize));
        for (const c of ctx.clips) {
          const truncates = n => cs(n).textOverflow === 'ellipsis' || cs(n).webkitLineClamp !== 'none' || cs(n).getPropertyValue('line-clamp') && !/none/.test(cs(n).getPropertyValue('line-clamp'));
          if (truncates(c.element) || truncates(el)) continue;
          const checkX = c.x && !scrollsWithin(ctx.ancestors, c, 'X'), checkY = c.y && !scrollsWithin(ctx.ancestors, c, 'Y');
          // Cut means partly shown: some of the text is in the box and some runs past it. Text
          // entirely outside (a hidden carousel slide) is hidden on purpose, not cut.
          const shows = rects.some(t => t.right > c.bounds.left && t.left < c.bounds.right && t.bottom > c.bounds.top && t.top < c.bounds.bottom);
          const cut = shows && rects.some(t => (checkX && (c.bounds.left - t.left > tol || t.right - c.bounds.right > tol)) || (checkY && (c.bounds.top - t.top > tol || t.bottom - c.bounds.bottom > tol)));
          if (cut) { add('overflow', el, `text is cut off by ${short(c.element)} (overflow: hidden)`, `Let the text wrap or the box grow (drop the fixed height or width), or truncate on purpose with text-overflow: ellipsis${tw ? ' (truncate or line-clamp-2)' : ''} and show the full text on hover or in a title.`, { key: like(el) + like(c.element) }); break; }
        }
      }
      if (pageScrolls && !escaped.length) add('overflow', root, `the page is ${Math.round(pageOver)}px wider than the ${W}px screen`, 'Find the element that is wider than the page (often a fixed width, a long word or a 100vw box next to a scrollbar) and let it shrink: max-width: 100%, min-width: 0, overflow-wrap: anywhere.');
    }

    // ---------- spacing-scale (guarded) ----------
    if (state['spacing-scale']) {
      const scale = policy.spacing, on = v => v <= 2.01 || scale.some(s => Math.abs(s - v) <= 0.5);
      const fluid = /clamp|min\(|max\(|%|v[wh]|v[ib]|vmin|vmax|\d(em|ch|ex|cq\w+)\b/;
      const SIDES = [['top', 'Top', 't'], ['right', 'Right', 'r'], ['bottom', 'Bottom', 'b'], ['left', 'Left', 'l']];
      for (const el of els) {
        if (!(el instanceof HTMLElement) || /^(inline|contents)$/.test(cs(el).display) || el.matches(CODE)) continue;
        const st = cs(el), off = [];
        for (const [side, Side, k] of SIDES) {
          const v = parseFloat(st[`padding${Side}`]), b = parseFloat(st[`border${Side}Width`]) || 0;
          if (!on(v) && !on(v + b)) off.push([`padding-${side}`, v, `p${k}`]);
        }
        if (/flex|grid/.test(st.display)) for (const [prop, key, k] of [['row-gap', 'rowGap', 'gap-y'], ['column-gap', 'columnGap', 'gap-x']]) {
          const v = parseFloat(st[key]);
          if (Number.isFinite(v) && !on(v)) off.push([prop, v, k]);
        }
        if (!off.length) continue;
        const decl = declared(el, ['padding', ...SIDES.map(s => `padding-${s[0]}`), 'padding-inline', 'padding-block', 'gap', 'row-gap', 'column-gap']);
        if (decl.some(([, v]) => fluid.test(v)) || (!decl.length && unreadableSheets)) continue;
        const shown = [...new Map(off.map(o => [o[1], o])).values()];
        const fixes = shown.map(([prop, v, k]) => { const [a, b] = nearest(v, scale); const name = n => { const c = twSpace(k, n); return c ? `${n}px (${c})` : `${n}px`; }; return `${prop}: ${name(a)}${b !== undefined ? ` or ${name(b)}` : ''}`; });
        add('spacing-scale', el, off.map(([p, v]) => `${p} ${px(v)}`).join(', '), `Use the nearest steps on the spacing scale: ${fixes.join('; ')}.`, { key: like(el) + off.map(o => o[1]).join() });
      }
    }

    // ---------- off-token-color (guarded) ----------
    if (state['off-token-color']) {
      if (!tokens.colors.length) { delete state['off-token-color']; skipped['off-token-color'] = 'no color tokens (custom properties) found on :root'; }
      const DEFAULTS_ = { '#0000ee': 'the browser default link blue', '#551a8b': 'the browser default visited purple', '#efefef': 'the browser default button gray', '#f0f0f0': 'the browser default button gray' };
      const check = (el, color, role, prop) => {
        const c = parseColor(color);
        if (!c || c[3] === 0) return;
        const lab = toLab(c), near = tokens.colors.map(t => [t, distance(lab, t.lab)]).sort((a, b) => a[1] - b[1]);
        if (near[0][1] < 0.008) return;
        const prefer = t => role === 'text' ? /foreground|text/.test(t.name) : !/foreground/.test(t.name);
        const close = near.filter(([, d]) => d <= 0.12).sort((a, b) => Number(prefer(b[0])) - Number(prefer(a[0])) || a[1] - b[1]).map(([t]) => tokenName(t, role === 'text' ? 'text' : prop === 'border' ? 'border' : 'bg'));
        const def = DEFAULTS_[hex(c)];
        const fix = def ? `It's ${def}: style it with a token, e.g. ${close[0] || near[0][0].name}.` : near[0][1] <= 0.02 ? `Same color as ${tokenName(near[0][0], role === 'text' ? 'text' : prop === 'border' ? 'border' : 'bg')}: use the token.` : close.length ? `Nearest tokens: ${close.slice(0, 2).join(', ')}.` : `No token is close; use one of ${capList(tokens.colors.map(t => t.name))}. Add a token only if the design calls for one, and ask the user first.`;
        add('off-token-color', el, `${prop} ${hex(c)}${c[3] < 1 ? ` at ${Math.round(c[3] * 100)}% alpha` : ''} matches no color token`, fix, { key: prop + hex(c) });
      };
      for (const el of state['off-token-color'] ? els : []) {
        if (el.closest(CODE) || el.tagName.toLowerCase() === 'svg') continue;
        const st = cs(el);
        if (words(ownText(el)) && !decorative(el)) check(el, st.color, 'text', 'color');
        if (st.backgroundImage === 'none') check(el, st.backgroundColor, 'surface', 'background');
        const b = SIDES4.map(s => [parseFloat(st[`border${s}Width`]), st[`border${s}Style`], st[`border${s}Color`]]).find(([w, s]) => w > 0 && s !== 'none');
        if (b) check(el, b[2], 'surface', 'border');
      }
    }

    // ---------- nested-radius (guarded) ----------
    if (state['nested-radius']) {
      const paints = el => { const st = cs(el); return parseColor(st.backgroundColor)?.[3] > 0 || st.backgroundImage !== 'none' || SIDES4.some(s => parseFloat(st[`border${s}Width`]) > 0 && st[`border${s}Style`] !== 'none') || st.boxShadow !== 'none'; };
      const radius = el => { const st = cs(el), v = ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius'].map(k => st[k]); return new Set(v).size === 1 && /^\d+(\.\d+)?px$/.test(v[0]) ? parseFloat(v[0]) : v.every(x => x === '0px') ? 0 : null; };
      for (const inner of els.filter(e => e instanceof HTMLElement && paints(e))) {
        let outer = inner.parentElement;
        while (outer && outer !== body && !(inScope.has(outer) && paints(outer))) outer = outer.parentElement;
        if (!outer || outer === body) continue;
        const ri = radius(inner), ro = radius(outer), a = outer.getBoundingClientRect(), b = inner.getBoundingClientRect();
        const strict = outer.hasAttribute('data-critly-radius');
        const insets = [b.left - a.left, b.top - a.top, a.right - b.right, a.bottom - b.bottom];
        if (insets.some(i => i < 0.5) || !ro || cs(inner).transform !== 'none' || cs(outer).transform !== 'none') continue;
        const inset = insets.reduce((x, y) => x + y) / 4, equal = Math.max(...insets) - Math.min(...insets) <= 1;
        if (ri === null || !equal) { if (strict) add('nested-radius', inner, ri === null ? 'corner radii are not one uniform pixel value' : `uneven insets (${insets.map(i => Math.round(i)).join(', ')}px)`, 'This pair is marked data-critly-radius, so it must be concentric: equal insets on all sides and one radius. Fix the inset or the radius.', { severity: 'review' }); continue; }
        if (ro >= Math.min(a.width, a.height) / 2 - 0.5 || ri >= Math.min(b.width, b.height) / 2 - 0.5 || inset >= ro - 0.5) continue;
        coverage.radiusPairs++;
        const expected = Math.max(0, ro - inset);
        if (Math.abs(ri - expected) > 2) add('nested-radius', inner, `radius ${px(ri)} inside ${px(ro)} at a ${px(inset)} inset`, `Set the inner radius to ${px(expected)} (outer ${px(ro)} minus the ${px(inset)} inset, border included), so the curves stay concentric.`, { key: like(inner) + ri + ro });
      }
    }

    return { findings, coverage, suppressed };
  }
  const SIDES4 = ['Top', 'Right', 'Bottom', 'Left'];

  // ---------- focus-ring (opt-in; the CLI presses Tab and calls step() after each press) ----------
  const SIG = ['outlineStyle', 'outlineWidth', 'outlineColor', 'outlineOffset', 'boxShadow', 'borderTopColor', 'borderBottomColor', 'borderTopWidth', 'backgroundColor', 'color', 'textDecorationLine', 'transform', 'opacity'];
  const signature = el => [el, el.parentElement, el.parentElement?.parentElement].filter(Boolean).flatMap(n => [getComputedStyle(n), getComputedStyle(n, '::before'), getComputedStyle(n, '::after')].map(s => SIG.map(k => s[k]).join('|'))).join('#');
  const focus = { before: new Map(), seen: new Set(), policy: null, context: null };
  critlyCheck.focusStart = (policy, context = {}) => {
    focus.policy = normalize(policy ?? {}); focus.context = context; focus.seen = new Set(); focus.before = new Map();
    document.activeElement?.blur?.();
    for (const el of document.querySelectorAll('a[href], button, input, select, textarea, summary, [tabindex], [contenteditable="true"]')) if (visible(el)) focus.before.set(el, signature(el));
    return focus.before.size;
  };
  critlyCheck.focusStep = () => {
    const el = document.activeElement;
    if (!el || el === document.body || focus.seen.has(el)) return { done: true };
    focus.seen.add(el);
    if (!focus.before.has(el) || !visible(el) || (focus.policy.ignore.length && el.closest(focus.policy.ignore.join(', ')))) return { done: false };
    const { viewport = `${innerWidth}x${innerHeight}`, scheme = 'light' } = focus.context;
    const make = (actual, fix) => {
      const exception = focus.policy.exceptions.find(e => e.rules.includes('focus-ring') && el.closest(e.selector));
      const base = { rule: 'focus-ring', where: where(el), selector: selectorFor(el), viewport, scheme };
      if (exception) return { suppressed: { ...base, reason: exception.reason } };
      return { finding: { ...base, concept: SITE + 'focus-rings', severity: 'error', actual, fix, count: 1, ...(focus.policy.note ? { note: focus.policy.note } : {}) } };
    };
    if (signature(el) === focus.before.get(el)) return { done: false, ...make('Tab focus changes nothing visible', 'Style :focus-visible with a ring that contrasts with its surroundings: outline: 2px solid; outline-offset: 2px (Tailwind: focus-visible:ring-2 focus-visible:ring-offset-2). Never remove the outline without a replacement.') };
    const r = el.getBoundingClientRect();
    const points = [[r.left + 2, r.top + 2], [r.right - 2, r.top + 2], [r.left + 2, r.bottom - 2], [r.right - 2, r.bottom - 2], [(r.left + r.right) / 2, (r.top + r.bottom) / 2]].filter(([x, y]) => x >= 0 && y >= 0 && x < innerWidth && y < innerHeight);
    const covers = points.map(([x, y]) => document.elementFromPoint(x, y)).filter(hit => hit && hit !== el && !el.contains(hit) && !hit.contains(el));
    if (points.length && covers.length === points.length) return { done: false, ...make(`the focused control is covered by ${short(covers[0])}`, 'Keep focused controls visible: add scroll-padding-top (or scroll-margin) equal to the sticky header height, or move the overlapping element.') };
    return { done: false };
  };
  critlyCheck.validate = policy => { validateSelectors(normalize(policy ?? {})); return true; };
  critlyCheck.rules = RULES;
  window.__critlyCheck = critlyCheck;
})();
