// Plain-text output. Agents quote the last line, so the last line is the summary.

const plural = (n, word, many = `${word}s`) => `${n.toLocaleString('en-US')} ${n === 1 ? word : many}`;

function runsLabel(runs, report) {
  const vps = [...new Set(runs.map(r => r.split(' ')[0]))], schemes = [...new Set(runs.map(r => r.split(' ')[1]))];
  if (vps.length * schemes.length === runs.length) return `${vps.join(', ')} · ${schemes.join(', ')}`;
  return runs.join(', ');
}

export function scopeLine(report) {
  return `${plural(report.pages.length, 'page')} × ${plural(report.viewports.length, 'viewport')} × ${plural(report.schemes.length, 'scheme')}`;
}

/** The one line worth quoting. */
export function summaryLine(report, error) {
  if (error) {
    const reason = String(error.message || error).split(/(?<=\.)\s/)[0].slice(0, 140);
    return `critly check: could not run (${reason.replace(/\.$/, '')}) · exit 2`;
  }
  const { errors, reviews, suppressed } = report.totals;
  let counts = `${plural(errors, 'error')}${reviews || errors ? `, ${reviews} review` : ''}`;
  if (report.baseline?.written) counts += ` · baseline written to ${report.baseline.path}`;
  else if (report.baseline) counts += report.baseline.increases.length ? ` · up from baseline: ${report.baseline.increases.map(c => `${c.rule} ${c.before}→${c.now}`).join(', ')}` : ` · no rule above baseline (${report.baseline.before})`;
  return `critly check: ${counts} · ${scopeLine(report)}${suppressed ? ` · ${suppressed} suppressed` : ''} · exit ${report.exitCode}`;
}

export function formatText(report, { notices = [] } = {}) {
  const out = [];
  const byPage = new Map(report.pages.map(p => [p, []]));
  for (const f of report.findings) byPage.get(f.page)?.push(f);
  for (const [page, list] of byPage) {
    out.push(page, '');
    if (!list.length) { out.push('  no findings', ''); continue; }
    for (const f of list) {
      out.push(`${f.severity === 'error' ? '✕' : '?'} ${f.rule}  ${f.severity} · ${runsLabel(f.runs, report)}`);
      out.push(`  where   ${f.where}${f.count > 1 ? ` (and ${f.count - 1} more like it)` : ''}`);
      out.push(`  actual  ${f.actual}`);
      out.push(`  fix     ${f.fix}`);
      if (f.note) out.push(`  note    ${f.note}`);
      out.push(`  concept ${f.concept}`, '');
    }
  }
  if (report.totals.suppressed) {
    const by = {};
    for (const s of report.suppressed) by[s.rule] = (by[s.rule] || 0) + 1;
    out.push(`${plural(report.totals.suppressed, 'finding')} suppressed by policy exceptions (${Object.entries(by).map(([r, n]) => `${r} ${n}`).join(', ')}); --json lists them with reasons.`);
  }
  if (report.baseline?.changes?.length) out.push(`baseline ${report.baseline.path}: ${report.baseline.changes.map(c => `${c.rule} ${c.before}→${c.now}`).join(', ')}`);
  const skipped = Object.entries(report.rules.skipped);
  const groups = {};
  for (const [id, why] of skipped) (groups[why] ||= []).push(id);
  const skippedText = Object.entries(groups).map(([why, ids]) => `${ids.join(', ')} (${why})`).join('; ');
  out.push(`checked ${scopeLine(report)} · ${report.totals.elements.toLocaleString('en-US')} elements · ${plural(report.rules.ran.length, 'rule')}${skippedText ? ` · skipped: ${skippedText}` : ''}`);
  for (const n of notices) out.push(n);
  out.push(summaryLine(report));
  return out.join('\n');
}

// ---------- taste ----------

const kinds = byKind => Object.entries(byKind).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${n} ${k}`).join(', ');
const LEAD = { clear: 'leads clearly', weak: 'leads, only just', tie: 'nothing leads', nothing: 'nothing stands out' };

/** The one line worth quoting after a taste pass. */
export function tasteSummaryLine(report, error) {
  if (error) {
    const reason = String(error.message || error).split(/(?<=\.)\s/)[0].slice(0, 140);
    return `critly taste: could not run (${reason.replace(/\.$/, '')}) · exit 2`;
  }
  const screens = report.results.length;
  return `critly taste: ${plural(report.totals.looks, 'thing')} to look at · ${plural(screens, 'screen')} · images in ${report.out} · exit ${report.exitCode}`;
}

export function formatTaste(report) {
  const out = [];
  for (const r of report.results) {
    const f = r.focus, b = r.boxes, e = r.edges;
    out.push(`${r.page} · ${r.viewport}`, '');
    out.push(`  squint  ${r.files.squint}`);
    const runner = f.ranked[1];
    if (f.verdict === 'tie') out.push(`  lead    nothing leads: ${f.lead.where} is only ${f.ratio}× over ${runner.where}`);
    else if (f.lead) out.push(`  lead    ${f.lead.where} ${LEAD[f.verdict]}${runner ? `, ${f.ratio}× over ${runner.where}` : ''}`);
    else out.push(`  lead    ${LEAD.nothing}`);
    out.push(`  boxes   ${b.count}${b.count ? ` (${kinds(b.byKind)})` : ''}, ${plural(b.lines, 'divider line')}, nested ${b.maxDepth} deep`);
    out.push(`  edges   ${plural(e.count, 'left edge')} (${e.text} for text)${e.nearMisses.length ? `, ${plural(e.nearMisses.length, 'near miss', 'near misses')}` : ''}`);
    out.push(`  overlay ${r.files.overlay}`);
    for (const l of r.looks) out.push(`  look    ${l.look}`, `          ${l.concept}`);
    out.push('');
  }
  out.push('Open each squint and overlay image and look at it. These are things to look at, not failures; a screen can have a reason for any of them.');
  out.push(tasteSummaryLine(report));
  return out.join('\n');
}
