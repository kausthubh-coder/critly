/*!
 * Critly taste pass · https://critly.vercel.app/taste-pass · MIT License, Copyright (c) 2026 Kausthubh
 *
 * One self-contained, read-only browser script with no dependencies. It measures the three
 * looks of a taste pass on the screen as it is: the squint test, the boxes and edges, and the
 * one thing the screen leads with. It never fails anything. The numbers point your eyes at
 * what to look at; the judgment stays with you.
 *
 *   await window.__critlyTaste()                  → { squint, boxes, edges, focus, looks, coverage }
 *   window.__critlyTaste.overlay(report)          draws the boxes, edges and lead on the page
 *   window.__critlyTaste.squint(true)             blurs the page so your own screenshot squints
 *   window.__critlyTaste.clear()                  removes both
 *
 * Options: { root: "<selector>" | element, ignore: ["<selector>"], blur: 6 }. It looks at the
 * screen: what fits in the viewport right now, which is what people see first. Scroll first to
 * look further down. With a root, it looks at that element's box instead (one panel, one dialog).
 * Positions in the report are px from the left of the screen, or of the root.
 * Node runs it through `critly taste <url>`, which also hands it a screenshot, so the squint is
 * measured on real pixels instead of estimated from styles.
 */
(() => {
  'use strict';
  const SITE = 'https://critly.vercel.app/';
  // Starting points for a look, never pass or fail. Sourced numbers say so; the rest are ours.
  const T = {
    box: [32, 24],      // smallest box worth counting, w × h in px
    nearMiss: [2, 8],   // two content edges this far apart (px) look like a mistake
    double: 4,          // a box this close inside another box doubles the edge
    deep: 3,            // a box in a box in a box. Appian: nested borders add clutter
    tie: 1.2,           // lead / runner-up under this: nothing leads
    lead: 1.5,          // and under this: it leads, but only just
    solidPerView: 2,    // Apple HIG: one or two prominent buttons per view
    bold: 0.3,          // share of text drawn at 600+ before "everything is bold"
    blur: 6,            // squint radius (σ) in CSS px. NN/g blurs at 5 and 10; at ~40px per
                        // degree, 4–8px keeps what the eye takes in first (Schyns & Oliva 1994)
  };
  const CONTROL = 'button, [role="button"], [role="tab"], [role="switch"], [role="checkbox"], [role="radio"], [role="menuitem"], [role="option"], a[href], input:not([type="hidden"]), select, textarea, summary';
  const MEDIA = 'img, svg, video, canvas, picture, iframe, [role="img"]';
  const SKIP = 'script, style, noscript, template, head, meta, link, br, wbr, [data-critly-taste]';
  const AREA = 'section, form, dialog, [role="dialog"], header, nav, main, aside, footer, article, figure';

  // ---------- color ----------
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const paint = canvas.getContext('2d', { willReadFrequently: true });
  const colorCache = new Map();
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
  function lab([r, g, b]) {
    const lr = lin(r), lg = lin(g), lb = lin(b);
    const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
    const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
    const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
    return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
  }
  const over = (top, back) => { const a = top[3]; return [0, 1, 2].map(i => top[i] * a + back[i] * (1 - a)).concat(1); };
  const chroma = c => { const [, a, b] = lab(c); return Math.hypot(a, b); };
  const lightness = c => lab(c)[0];
  const gap = (a, b) => { const x = lab(a), y = lab(b); return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]); };
  const differs = (a, b, by = 0.02) => gap(a, b) > by;

  // ---------- the page ----------
  let styles = new Map();
  const cs = el => { let s = styles.get(el); if (!s) { s = getComputedStyle(el); styles.set(el, s); } return s; };
  const canvasColor = () => /dark/.test(cs(document.documentElement).colorScheme) && matchMedia('(prefers-color-scheme: dark)').matches ? [18 / 255, 18 / 255, 18 / 255, 1] : [1, 1, 1, 1];
  // What an element is painted on: its ancestors' background colors composited from the root
  // down. Images, gradients and overlapping siblings aren't seen, so this is the usual case only.
  const backCache = new Map();
  function backdrop(el) {
    if (!el || el.nodeType !== 1) return canvasColor();
    if (backCache.has(el)) return backCache.get(el);
    const below = backdrop(el.parentElement);
    const bg = parseColor(cs(el).backgroundColor);
    const out = bg && bg[3] > 0 ? over(bg, below) : below;
    backCache.set(el, out);
    return out;
  }
  const behind = el => backdrop(el.parentElement);

  function hiddenForSight(el) {
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const st = cs(n), r = n.getBoundingClientRect();
      if (st.clip === 'rect(0px, 0px, 0px, 0px)' || st.clipPath === 'inset(50%)') return true;
      if (st.position === 'absolute' && r.width <= 1 && r.height <= 1) return true;
    }
    return false;
  }

  const ownText = el => [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').replace(/\s+/g, ' ').trim();
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

  // ---------- readable locations (the same shape critly check prints) ----------
  const UTILITY = /^(-?(m|p)[xytrblse]?-|flex|grid|block|inline|hidden|items-|justify-|gap-|space-|w-|h-|size-|min-|max-|text-|bg-|border|rounded|font-|leading-|tracking-|shadow|ring|outline|transition|duration|ease|opacity|z-|top-|left-|right-|bottom-|inset|absolute|relative|fixed|sticky|overflow|truncate|shrink|grow|basis|col-|row-|divide|aspect|object|cursor|select-|pointer|sr-only|underline|uppercase|whitespace|line-clamp|scale|rotate|translate|group|peer|dark|container|mx-auto|isolate|tabular|backdrop|blur|will-|sm|md|lg|xl|2xl)/;
  const stableId = id => id && !/^(radix-|base-ui-|headlessui-|react-aria|mui-|:r|«)|_R_|[:«»]/.test(id) && !/^[\d-]/.test(id);
  const clip = (t, n = 32) => { t = String(t).replace(/\s+/g, ' ').trim(); return t.length > n ? `${t.slice(0, n)}…` : t; };
  function short(el) {
    let s = el.tagName.toLowerCase() + (stableId(el.id) ? `#${el.id}` : '');
    const cls = [...(el.classList || [])].filter(c => c.length <= 24 && !/[:[\]/()!.@%]/.test(c) && !UTILITY.test(c)).slice(0, 2);
    if (cls.length) s += `.${cls.join('.')}`;
    const tid = el.getAttribute('data-testid');
    if (tid) s += `[data-testid="${tid}"]`;
    return s;
  }
  function name(el) {
    if (el.matches('input, textarea, select')) return el.getAttribute('aria-label') || el.labels?.[0]?.textContent || el.getAttribute('placeholder') || '';
    return el.getAttribute('aria-label') || el.innerText || el.getAttribute('alt') || el.getAttribute('title') || '';
  }
  const where = el => { const t = clip(name(el)); return t ? `${short(el)} "${t}"` : short(el); };
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

  // ---------- what draws an edge ----------
  function shadowLayers(value) {
    if (!value || value === 'none') return [];
    return value.split(/,(?![^(]*\))/).map(layer => {
      const color = parseColor(layer.match(/(rgba?|oklch|oklab|lab|lch|hsla?|color)\([^)]*\)|#[\da-f]{3,8}/i)?.[0] || 'rgb(0, 0, 0)');
      const nums = (layer.replace(/(rgba?|oklch|oklab|lab|lch|hsla?|color)\([^)]*\)/gi, '').match(/-?[\d.]+px/g) || []).map(parseFloat);
      return { inset: /\binset\b/.test(layer), alpha: color ? color[3] : 1, size: nums.reduce((a, n) => a + Math.abs(n), 0) };
    });
  }
  // How a box is drawn: a border on three or four sides, a shadow or ring, an outline, or a fill
  // that differs from what it sits on. A border on one or two sides is a divider line instead.
  function drawing(el) {
    const st = cs(el), back = behind(el), out = [];
    const sides = ['Top', 'Right', 'Bottom', 'Left'].filter(s => {
      const w = parseFloat(st[`border${s}Width`]), style = st[`border${s}Style`], c = parseColor(st[`border${s}Color`]);
      return w >= 0.5 && style !== 'none' && style !== 'hidden' && c && c[3] >= 0.08 && differs(over(c, back), back);
    });
    if (sides.length >= 3) out.push('border');
    if (shadowLayers(st.boxShadow).some(l => !l.inset && l.alpha >= 0.04 && l.size > 0)) out.push('shadow');
    const oc = parseColor(st.outlineColor);
    if (st.outlineStyle !== 'none' && parseFloat(st.outlineWidth) > 0 && oc && oc[3] >= 0.08 && !el.matches(':focus-visible')) out.push('outline');
    const bg = parseColor(st.backgroundColor);
    if ((bg && bg[3] >= 0.08 && differs(over(bg, back), back, 0.015)) || /gradient\(|url\(/.test(st.backgroundImage)) out.push('fill');
    return { kinds: out, lineSides: sides.length && sides.length < 3 ? sides.length : 0 };
  }

  // ---------- squint, on pixels (the CLI passes a screenshot) ----------
  function loadImage(src) {
    return new Promise((ok, fail) => { const img = new Image(); img.onload = () => ok(img); img.onerror = () => fail(new Error('critly: the screenshot could not be decoded.')); img.src = src; });
  }
  // Blur the screenshot the way a squint does, and keep how far each cell is from the background
  // color in OKLab (lightness and color both). What stays far from it after the blur is what
  // reads at a glance. Achanta et al. 2009 measure saliency the same way, against the mean color;
  // the most common color is used here, since UI is mostly background.
  async function squintMap(src, blur, w, h) {
    const img = await loadImage(src);
    const cell = 4, cw = Math.ceil(w / cell), ch = Math.ceil(h / cell);
    const c = document.createElement('canvas');
    c.width = cw; c.height = ch;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.filter = `blur(${blur / cell}px)`;
    ctx.drawImage(img, 0, 0, cw, ch);
    const data = ctx.getImageData(0, 0, cw, ch).data;
    const labs = [], counts = new Map();
    for (let i = 0; i < cw * ch; i++) {
      const rgb = [data[i * 4] / 255, data[i * 4 + 1] / 255, data[i * 4 + 2] / 255];
      labs.push(lab(rgb));
      const key = rgb.map(v => Math.round(v * 31)).join(',');
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    const common = [...counts].sort((a, b) => b[1] - a[1])[0][0].split(',').map(v => v / 31);
    const bg = lab(common);
    const dev = labs.map(v => Math.hypot(v[0] - bg[0], v[1] - bg[1], v[2] - bg[2]));
    // The picture to look at: the same squint at full size.
    const full = document.createElement('canvas');
    full.width = w; full.height = h;
    const fctx = full.getContext('2d');
    fctx.filter = `blur(${blur}px)`;
    fctx.drawImage(img, 0, 0, w, h);
    return {
      background: '#' + common.map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join(''), image: full.toDataURL('image/png'),
      // How strong the box reads: the 80th percentile of its cells, kept clear of its edges, so
      // a dark neighbor's blur or a small badge floating over it (a dev-tools button) doesn't
      // count as its weight.
      at(r) {
        const cells = [];
        const inset = Math.min(blur, r.width / 4, r.height / 4);
        const x0 = Math.max(0, Math.floor((r.left + inset) / cell)), x1 = Math.min(cw - 1, Math.floor((r.right - inset - 1) / cell));
        const y0 = Math.max(0, Math.floor((r.top + inset) / cell)), y1 = Math.min(ch - 1, Math.floor((r.bottom - inset - 1) / cell));
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) cells.push(dev[y * cw + x]);
        cells.sort((a, b) => a - b);
        return cells.length ? cells[Math.floor((cells.length - 1) * 0.8)] : 0;
      },
    };
  }

  async function taste(options = {}) {
    const opts = { blur: T.blur, ignore: [], ...options };
    styles = new Map(); backCache.clear();
    await document.fonts?.ready;
    const root = typeof opts.root === 'string' ? document.querySelector(opts.root) : opts.root || document.body;
    if (!root) throw new Error(`critly: nothing matches root ${JSON.stringify(opts.root)}.`);
    const W = document.documentElement.clientWidth, H = innerHeight;
    const rr = opts.root ? root.getBoundingClientRect() : null;
    const area = rr ? { left: rr.left, top: rr.top, right: rr.right, bottom: rr.bottom } : { left: 0, top: 0, right: W, bottom: H };
    const ox = area.left, oy = area.top;
    const at = x => Math.round((x - ox) * 2) / 2;
    const ignore = [SKIP, ...opts.ignore].join(', ');
    const inArea = r => r.width > 0 && r.height > 0 && r.right > area.left && r.left < area.right && r.bottom > area.top && r.top < area.bottom;
    const cut = r => { const left = Math.max(r.left, area.left), right = Math.min(r.right, area.right), top = Math.max(r.top, area.top), bottom = Math.min(r.bottom, area.bottom); return { left, right, top, bottom, width: Math.max(0, right - left), height: Math.max(0, bottom - top) }; };
    const screenArea = (area.right - area.left) * (area.bottom - area.top);

    const all = [];
    for (const el of root.querySelectorAll('*')) {
      if (el.closest(ignore)) continue;
      if (!el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) continue;
      const r = el.getBoundingClientRect();
      if (!inArea(r) || hiddenForSight(el)) continue;
      all.push([el, r]);
      if (all.length > 8000) throw new Error('critly: more than 8,000 visible elements on screen; pass a root selector to narrow it.');
    }
    const rectOf = new Map(all);

    // ---------- boxes ----------
    const boxOf = new Map(), lines = [];
    for (const [el, r] of all) {
      if (el.matches(CONTROL) || el.matches(MEDIA) || el.closest('svg')) continue;
      const st = cs(el);
      if (st.display === 'inline' || st.display === 'contents') continue;
      const { kinds, lineSides } = drawing(el);
      if (el.tagName === 'HR' || (lineSides && !kinds.length)) { if (r.width >= T.box[0] || r.height >= T.box[1]) lines.push(el); continue; }
      if (!kinds.length || r.width < T.box[0] || r.height < T.box[1]) continue;
      const c = cut(r);
      if (c.width * c.height >= screenArea * 0.9) continue; // the page's own surface, not a box on it
      boxOf.set(el, { el, r, kinds, depth: 1, parent: null });
    }
    for (const box of boxOf.values()) {
      for (let n = box.el.parentElement; n; n = n.parentElement) if (boxOf.has(n)) { box.parent = boxOf.get(n); break; }
    }
    const depthOf = b => b.parent ? depthOf(b.parent) + 1 : 1;
    for (const box of boxOf.values()) box.depth = depthOf(box);
    const boxes = [...boxOf.values()];
    const maxDepth = Math.max(0, ...boxes.map(b => b.depth));
    const chain = b => { const out = [where(b.el)]; for (let n = b.parent; n; n = n.parent) out.unshift(short(n.el)); return out.join(' > '); };
    const deepest = boxes.filter(b => b.depth >= T.deep && !boxes.some(o => o.parent === b));
    const doubles = boxes.filter(b => b.parent && ['left', 'top'].every(s => b.r[s] - b.parent.r[s] <= T.double) && ['right', 'bottom'].every(s => b.parent.r[s] - b.r[s] <= T.double));
    const bordered = b => b.kinds.includes('border') || b.kinds.includes('outline');
    const doubled = new Set(doubles);
    const nestedLines = boxes.filter(b => b.parent && bordered(b) && bordered(b.parent) && !doubled.has(b));
    const byKind = {};
    for (const b of boxes) for (const k of b.kinds) byKind[k] = (byKind[k] || 0) + 1;

    // ---------- edges: where things start ----------
    // An area is the nearest box or landmark: edges are compared, and buttons counted, within one.
    const areaOf = el => { for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) if (boxOf.has(n) || n.matches(AREA)) return n; return document.body; };
    // Centered by its layout (a centered flex row, a narrower item in a centered column), so its
    // left edge is wherever its width puts it. Looks up to its area.
    const centered = el => {
      for (let n = el; n && n.parentElement && n !== document.body; n = n.parentElement) {
        const p = n.parentElement, st = cs(p), r = n.getBoundingClientRect(), pr = p.getBoundingClientRect();
        const narrower = r.width < pr.width - parseFloat(st.paddingLeft) - parseFloat(st.paddingRight) - 1;
        if (/flex/.test(st.display)) {
          if (/row/.test(st.flexDirection) && /center|space-around|space-evenly/.test(st.justifyContent) && narrower) return true;
          if (/column/.test(st.flexDirection) && (cs(n).alignSelf === 'center' || (cs(n).alignSelf === 'auto' && st.alignItems === 'center')) && narrower) return true;
        }
        if (/grid/.test(st.display) && (cs(n).justifySelf === 'center' || st.justifyItems === 'center') && narrower) return true;
        if (st.textAlign === 'center' && /inline/.test(cs(n).display)) return true;
        if (boxOf.has(p) || p.matches(AREA)) return false;
      }
      return false;
    };
    // Where a control visibly starts: its box when it paints one, else its icon or label.
    const visibleLeft = (el, r) => {
      if (drawing(el).kinds.length) return r.left;
      let left = Infinity;
      for (const n of [el, ...el.querySelectorAll('*')]) {
        if (n.matches(MEDIA) && !n.parentElement.closest(MEDIA)) { const m = n.getBoundingClientRect(); if (m.width > 0) left = Math.min(left, m.left); }
        for (const t of textRects(n)) left = Math.min(left, t.left);
      }
      return Number.isFinite(left) ? left : r.left;
    };
    const starts = [];
    const inSentence = el => cs(el).display === 'inline' && el.parentElement && ownText(el.parentElement).length > 0;
    // Pushed to the end of its row (space-between, margin-left: auto, a right-aligned cell), so
    // its left edge is wherever its width ends. Its right edge is the one that lines up.
    const endAnchored = (el, r) => {
      const p = el.parentElement;
      if (!p || p === document.body) return false;
      const st = cs(p), pr = p.getBoundingClientRect();
      const left = pr.left + parseFloat(st.borderLeftWidth) + parseFloat(st.paddingLeft), right = pr.right - parseFloat(st.borderRightWidth) - parseFloat(st.paddingRight);
      return Math.abs(r.right - right) <= 1 && r.left - left > 1 && r.width < (right - left) * 0.6;
    };
    for (const [el, r] of all) {
      if (boxOf.has(el)) { starts.push({ x: r.left, el, kind: 'box' }); continue; }
      if (el.matches(CONTROL)) { if (!inSentence(el) && !el.parentElement.closest(CONTROL) && !endAnchored(el, r) && !centered(el)) starts.push({ x: visibleLeft(el, r), el, kind: 'control' }); continue; }
      if (el.closest(CONTROL)) continue;
      if (el.matches(MEDIA)) { if (!el.parentElement.closest(MEDIA) && r.width >= 12 && r.height >= 12 && !centered(el)) starts.push({ x: r.left, el, kind: 'media' }); continue; }
      if (el.closest('svg')) continue;
      if (!/[\p{L}\p{N}]/u.test(ownText(el)) || inSentence(el)) continue;
      const align = cs(el).textAlign;
      if (/center|right|end/.test(align) && !(align === 'end' && cs(el).direction === 'rtl')) continue;
      const rects = textRects(el).filter(inArea);
      if (rects.length && !endAnchored(el, r) && !centered(el)) starts.push({ x: Math.min(...rects.map(t => t.left)), el, kind: 'text' });
    }
    const cluster = list => {
      const sorted = [...list].sort((a, b) => a.x - b.x), out = [];
      for (const s of sorted) {
        const last = out.at(-1);
        if (last && s.x - last.raw <= 1) last.items.push(s);
        else out.push({ x: at(s.x), raw: s.x, items: [s] });
      }
      return out;
    };
    const edgeList = cluster(starts.filter(s => s.x >= area.left - 1 && s.x < area.right));
    const content = cluster(starts.filter(s => s.kind !== 'box'));
    const related = (a, b) => a.contains(b) || b.contains(a);
    const nearMisses = [];
    for (let i = 0; i < content.length; i++) {
      for (let j = i + 1; j < content.length; j++) {
        const dx = content[j].x - content[i].x;
        if (dx > T.nearMiss[1]) break;
        if (dx < T.nearMiss[0]) continue;
        const pair = (s, t) => !related(s.el, t.el) && areaOf(s.el) === areaOf(t.el);
        const a = content[i].items.find(s => content[j].items.some(t => pair(s, t)));
        const b = a && content[j].items.find(t => pair(a, t));
        if (a && b) nearMisses.push({ at: [content[i].x, content[j].x], count: content[i].items.length + content[j].items.length, a: where(a.el), b: where(b.el), selectors: [selectorFor(a.el), selectorFor(b.el)] });
      }
    }
    nearMisses.sort((a, b) => b.count - a.count);

    // ---------- focus: what reads first ----------
    const map = opts.screenshot ? await squintMap(opts.screenshot, opts.blur, W, H) : null;
    const candidates = [];
    const unitOf = new Set();
    for (const [el, r] of all) {
      const st = cs(el), back = behind(el);
      let kind = null, intensity = 0, rect = cut(r);
      if (el.matches(CONTROL) && !inSentence(el) && !el.parentElement.closest(CONTROL)) {
        const bg = parseColor(st.backgroundColor);
        if (bg && bg[3] >= 0.5 && differs(over(bg, back), back, 0.05)) {
          const fill = over(bg, back);
          kind = 'solid control';
          intensity = gap(fill, back);
        }
      } else if (boxOf.has(el) && boxOf.get(el).kinds.includes('fill')) {
        const bg = parseColor(st.backgroundColor);
        if (bg && bg[3] >= 0.5) {
          const fill = over(bg, back);
          const strength = Math.abs(lightness(fill) - lightness(back));
          if (strength >= 0.12) { kind = 'filled box'; intensity = gap(fill, back); }
        }
      } else if (el.matches(MEDIA) && !el.parentElement.closest(MEDIA) && !el.closest(CONTROL) && r.width >= 24 && r.height >= 24) {
        kind = 'media'; intensity = el.matches('svg') ? 0.25 : 0.4;
      } else if (!el.closest(CONTROL) && /[\p{L}\p{N}]/u.test(ownText(el)) && !inSentence(el)) {
        const color = parseColor(st.color);
        const rects = textRects(el).filter(inArea).map(cut);
        if (color && rects.length) {
          const ink = over(color, back);
          const weight = parseFloat(st.fontWeight) || 400, size = parseFloat(st.fontSize) || 16;
          // Strokes thicken with weight and size, so more of the glyph survives the blur. 0.2 is
          // calibrated against the pixel squint on the fixtures and the Critly site.
          const density = Math.min(0.6, 0.2 * (weight / 400) * Math.max(1, size / 20));
          kind = 'text';
          intensity = gap(over([...ink.slice(0, 3), color[3]], back), back) * density;
          rect = rects.reduce((u, t) => ({ left: Math.min(u.left, t.left), top: Math.min(u.top, t.top), right: Math.max(u.right, t.right), bottom: Math.max(u.bottom, t.bottom) }), { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity });
          rect.width = rect.right - rect.left; rect.height = rect.bottom - rect.top;
          // The eye lands on the strongest line, and a line pulls by its size more than its length,
          // so text weighs as its biggest line with the width capped at three line heights.
          rect.ink = Math.max(...rects.map(t => Math.min(t.width, 3 * t.height) * t.height));
          rect.inked = rects.reduce((n, t) => n + t.width * t.height, 0);
        }
      }
      if (!kind || rect.width <= 0 || rect.height <= 0) continue;
      const size = rect.ink ?? rect.width * rect.height;
      if (map) intensity = map.at(rect);
      candidates.push({ el, kind, rect, intensity, score: intensity * Math.sqrt(size) });
      unitOf.add(el);
    }
    // One unit per thing: a filled card that outweighs its contents is the unit; otherwise its
    // contents are. Text inside a button belongs to the button (skipped above).
    candidates.sort((a, b) => b.score - a.score);
    const units = [];
    for (const c of candidates) {
      if (c.score <= 0) continue;
      if (units.some(u => u.el.contains(c.el) || c.el.contains(u.el))) continue;
      units.push(c);
    }
    const top = units[0], runner = units[1];
    const ratio = top && runner ? top.score / runner.score : top ? Infinity : 0;
    const verdict = !top ? 'nothing' : ratio < T.tie ? 'tie' : ratio < T.lead ? 'weak' : 'clear';
    const tied = top ? units.filter(u => u.score >= top.score / T.tie) : [];
    const describe = u => ({ where: where(u.el), selector: selectorFor(u.el), kind: u.kind, weight: Math.round(u.score / top.score * 100) / 100, rect: [Math.round(u.rect.left - ox), Math.round(u.rect.top - oy), Math.round(u.rect.width), Math.round(u.rect.height)] });
    const solid = units.filter(u => u.kind === 'solid control' && u.intensity >= (map ? 0.2 : 0.25));
    // Atlassian: one primary button per page or area.
    const sharing = new Map();
    for (const u of solid) { const a = areaOf(u.el); sharing.set(a, [...(sharing.get(a) || []), u]); }
    const crowded = [...sharing.values()].filter(list => list.length > 1);
    // "If everything is contrasted, nothing stands out" (NN/g): how much of the text is heavy.
    let inked = 0, heavy = 0;
    for (const c of candidates) if (c.kind === 'text') { const a = c.rect.inked || 0; inked += a; if ((parseFloat(cs(c.el).fontWeight) || 400) >= 600) heavy += a; }
    const boldShare = inked ? heavy / inked : 0;

    // ---------- looks: what to go and look at ----------
    const looks = [];
    const look = (id, concept, text, at) => looks.push({ id, concept: SITE + concept, look: text, ...(at ? { where: at } : {}) });
    if (verdict === 'tie') look('no-lead', 'visual-hierarchy', `Nothing leads: ${tied.slice(0, 3).map(u => where(u.el)).join(', ')} weigh within ${Math.round((T.tie - 1) * 100)}% of each other. Decide which one this screen is for, and quiet the others with tone or weight, not size.`, tied.map(u => selectorFor(u.el)));
    else if (verdict === 'weak') look('weak-lead', 'visual-hierarchy', `${where(top.el)} leads, but only ${ratio.toFixed(2)}× over ${where(runner.el)}. If it is the point of the screen, quiet the runner-up; if it isn't, the screen leads with the wrong thing.`, [selectorFor(top.el), selectorFor(runner.el)]);
    if (solid.length > T.solidPerView) look('solid-actions', 'visual-hierarchy', `${solid.length} solid buttons on one screen (${solid.slice(0, 4).map(u => where(u.el)).join(', ')}). Keep one solid primary per area; make the rest secondary or plain.`, solid.map(u => selectorFor(u.el)));
    else for (const list of crowded.slice(0, 2)) look('solid-actions', 'visual-hierarchy', `${list.length} solid buttons in one group (${list.map(u => where(u.el)).join(', ')}). Keep the one that does the main job solid, and make the others secondary or plain.`, list.map(u => selectorFor(u.el)));
    if (boldShare > T.bold && inked > 0) look('all-bold', 'visual-hierarchy', `${Math.round(boldShare * 100)}% of the text on screen is 600 or heavier. When everything is bold nothing leads; step details down to 400 and a lighter tone.`);
    const deepGroups = new Map();
    for (const b of deepest) deepGroups.set(b.parent, [...(deepGroups.get(b.parent) || []), b]);
    for (const [, list] of [...deepGroups].slice(0, 3)) look('deep-boxes', 'whitespace', `A box in a box in a box (${list[0].depth} deep): ${chain(list[0])}${list.length > 1 ? `, and ${list.length - 1} more like it` : ''}. Let the inner group sit on its parent's surface and separate it with space.`, list.map(b => selectorFor(b.el)));
    for (const b of nestedLines.filter((b, i, all) => all.findIndex(o => o.parent === b.parent) === i && !deepest.some(d => b.el.contains(d.el))).slice(0, 2)) look('nested-borders', 'shadows-not-borders', `A bordered box inside a bordered box: ${where(b.el)} in ${where(b.parent.el)}. Keep the outer edge and separate the inner group with space or a background tone.`, [selectorFor(b.el), selectorFor(b.parent.el)]);
    for (const b of doubles.slice(0, 3)) look('double-edge', 'shadows-not-borders', `Two edges where one would do: ${where(b.el)} sits ${Math.round(Math.max(b.r.left - b.parent.r.left, b.r.top - b.parent.r.top))}px inside ${where(b.parent.el)}, and both draw one. Drop the inner edge or the outer one.`, [selectorFor(b.el), selectorFor(b.parent.el)]);
    for (const n of nearMisses.slice(0, 3)) look('near-miss-edge', 'alignment', `Edges ${n.at[1] - n.at[0]}px apart: ${n.a} starts at ${n.at[0]}px and ${n.b} at ${n.at[1]}px. Line them up on one edge.`, n.selectors);
    if (boxes.length >= 6 && (byKind.border || 0) > boxes.length * 0.6 && lines.length >= boxes.length) look('drawn-groups', 'whitespace', `${boxes.length} boxes and ${lines.length} divider lines, most drawn with borders. Try grouping with space and one background tone first, and keep lines for where space can't do it.`);

    return {
      viewport: `${innerWidth}x${innerHeight}`,
      squint: map ? { method: 'pixels', blur: opts.blur, background: map.background, image: map.image } : { method: 'styles', blur: opts.blur },
      boxes: { count: boxes.length, byKind, lines: lines.length, maxDepth, nestedBorders: nestedLines.length, deep: deepest.map(b => ({ depth: b.depth, chain: chain(b), selector: selectorFor(b.el) })), doubles: doubles.map(b => ({ inner: where(b.el), outer: where(b.parent.el), selector: selectorFor(b.el) })) },
      edges: { count: edgeList.length, text: cluster(starts.filter(s => s.kind === 'text')).length, at: edgeList.map(c => c.x), nearMisses },
      focus: { verdict, ratio: Number.isFinite(ratio) ? Math.round(ratio * 100) / 100 : null, lead: top ? describe(top) : null, ranked: units.slice(0, 5).map(describe), solidActions: solid.length, boldShare: Math.round(boldShare * 100) / 100 },
      looks,
      coverage: { elements: all.length, starts: starts.length, candidates: candidates.length },
      // Everything the overlay draws, in px from the origin (the screen, or the root).
      _draw: { origin: [ox, oy], size: [area.right - area.left, area.bottom - area.top], boxes: boxes.map(b => ({ r: [b.r.left - ox, b.r.top - oy, b.r.width, b.r.height], depth: b.depth })), edges: edgeList.map(c => ({ x: c.x, n: c.items.length })), misses: nearMisses.flatMap(n => n.at), ranked: units.slice(0, 2).map(u => [u.rect.left - ox, u.rect.top - oy, u.rect.width, u.rect.height]) },
    };
  }

  // ---------- drawing it on the page ----------
  const LAYER = 'data-critly-taste';
  function clear() {
    document.querySelectorAll(`[${LAYER}]`).forEach(n => n.remove());
    if (document.documentElement.dataset.critlySquint) { document.documentElement.style.filter = document.documentElement.dataset.critlySquint === '-' ? '' : document.documentElement.dataset.critlySquint; delete document.documentElement.dataset.critlySquint; }
  }
  function overlay(report) {
    clear();
    const d = report._draw;
    const layer = document.createElement('div');
    layer.setAttribute(LAYER, '');
    const [ox, oy] = d.origin, [w, h] = d.size;
    layer.style.cssText = `position:fixed;left:${ox}px;top:${oy}px;width:${w}px;height:${h}px;z-index:2147483647;pointer-events:none;font:600 11px/1 ui-sans-serif,system-ui,sans-serif;`;
    const add = css => { const n = document.createElement('div'); n.style.cssText = `position:absolute;${css}`; layer.appendChild(n); return n; };
    const depthColor = n => n >= T.deep ? '#e5484d' : n === 2 ? '#f5a524' : '#0ea5e9';
    const misses = new Set(d.misses);
    for (const e of d.edges) add(`left:${e.x}px;top:0;bottom:0;border-left:1px ${e.n > 1 ? 'solid' : 'dotted'} ${misses.has(e.x) ? '#e5484d' : 'rgba(14,165,233,.45)'};`);
    for (const b of d.boxes) {
      const n = add(`left:${b.r[0]}px;top:${b.r[1]}px;width:${b.r[2]}px;height:${b.r[3]}px;outline:1.5px dashed ${depthColor(b.depth)};outline-offset:-1px;`);
      if (b.depth > 1) n.innerHTML = `<span style="position:absolute;top:2px;left:2px;padding:2px 4px;border-radius:4px;background:${depthColor(b.depth)};color:#fff">${b.depth}</span>`;
    }
    d.ranked.forEach((r, i) => {
      const n = add(`left:${r[0] - 4}px;top:${r[1] - 4}px;width:${r[2] + 8}px;height:${r[3] + 8}px;border:2px solid ${i ? 'rgba(124,58,237,.5)' : '#7c3aed'};border-radius:6px;`);
      n.innerHTML = `<span style="position:absolute;top:-10px;left:-10px;display:grid;place-items:center;width:20px;height:20px;border-radius:50%;background:${i ? '#a78bfa' : '#7c3aed'};color:#fff">${i + 1}</span>`;
    });
    const f = report.focus;
    const legend = add('right:8px;bottom:8px;padding:8px 10px;border-radius:8px;background:rgba(17,17,17,.88);color:#fff;font-weight:500;line-height:1.5;max-width:320px;');
    legend.textContent = `${report.boxes.count} boxes, ${report.boxes.maxDepth} deep · ${report.edges.count} left edges${report.edges.nearMisses.length ? `, ${report.edges.nearMisses.length} near miss${report.edges.nearMisses.length > 1 ? 'es' : ''}` : ''} · lead: ${f.verdict}${f.ratio ? ` (${f.ratio}×)` : ''}`;
    document.body.appendChild(layer);
    return layer;
  }
  function squint(on = true, blur = T.blur) {
    const html = document.documentElement;
    if (!on) { clear(); return; }
    if (!html.dataset.critlySquint) html.dataset.critlySquint = html.style.filter || '-';
    html.style.filter = `grayscale(1) blur(${blur}px)`;
  }

  taste.overlay = overlay;
  taste.squint = squint;
  taste.clear = clear;
  taste.thresholds = T;
  window.__critlyTaste = taste;
})();
