// Plain-text output. Agents quote the last line, so the last line is the summary.

const plural = (n, word) => `${n.toLocaleString('en-US')} ${word}${n === 1 ? '' : 's'}`;

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
