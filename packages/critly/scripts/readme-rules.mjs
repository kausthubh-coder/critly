// Rewrites the rule table in README.md from src/rules.json (between the rules:begin and
// rules:end markers). Run: npm run readme:rules   (add --check to fail instead of writing)

import { readFile, writeFile } from 'node:fs/promises';

const pkg = new URL('../', import.meta.url);
const rules = JSON.parse(await readFile(new URL('src/rules.json', pkg), 'utf8'));
const STAGE = { v1: 'on', guarded: 'opt-in', v2: 'coming' };

const rows = rules
  .filter(r => r.stage !== 'v2' || r.id === 'focus-ring')
  .map(r => {
    const stage = r.id === 'focus-ring' ? 'opt-in (CLI)' : STAGE[r.stage];
    return `| \`${r.id}\` | [${r.concept}](https://critly.vercel.app/${r.concept}) | ${stage}${r.policy ? ', needs policy' : ''} | ${r.fails} |`;
  });
const coming = rules.filter(r => r.stage === 'v2' && r.id !== 'focus-ring').map(r => `\`${r.id}\``).join(', ');
const table = ['| Rule | Concept | Default | Fails when |', '|---|---|---|---|', ...rows, '', `Coming later (they need an interaction plan): ${coming}.`].join('\n');

const path = new URL('README.md', pkg);
const readme = await readFile(path, 'utf8');
const next = readme.replace(/(<!-- rules:begin[^>]*-->)[\s\S]*?(<!-- rules:end -->)/, `$1\n${table}\n$2`);
if (process.argv.includes('--check')) {
  if (next !== readme) { console.error('README rule table is out of date. Run npm run readme:rules.'); process.exit(1); }
  console.log('README rule table matches rules.json.');
} else {
  await writeFile(path, next);
  console.log(`README rule table: ${rows.length} rules.`);
}
