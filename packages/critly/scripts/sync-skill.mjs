// Keeps the two copies of the rules in step:
// 1. rewrites the RULES table inside src/check.js from src/rules.json (check.js must stay
//    self-contained, so it carries its own copy), and the rule enum in policy.schema.json;
// 2. copies src/check.js and src/taste.js to skills/critly-audit/scripts/, so the skill's
//    paste-into-a-browser path runs exactly what the CLI runs.
// Run: npm run sync:skill   (add --check to fail instead of writing, for CI)

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const pkg = new URL('../', import.meta.url);
const checkOnly = process.argv.includes('--check');
const rules = JSON.parse(await readFile(new URL('src/rules.json', pkg), 'utf8'));

const block = ['  const RULES = {', ...rules.map(r => `    ${JSON.stringify(r.id)}: [${JSON.stringify(r.concept)}, ${JSON.stringify(r.stage)}, ${r.policy ? 1 : 0}],`), '  };'].join('\n');
const checkPath = new URL('src/check.js', pkg);
const source = await readFile(checkPath, 'utf8');
const updated = source.replace(/(\/\/ rules:begin[^\n]*\n)[\s\S]*?(\n\s*\/\/ rules:end)/, `$1${block}$2`);

const schemaPath = new URL('policy.schema.json', pkg);
const schema = JSON.parse(await readFile(schemaPath, 'utf8'));
const enumNow = JSON.stringify(schema.$defs.ruleId.enum);
schema.$defs.ruleId.enum = rules.map(r => r.id);

const skillPath = new URL('../../skills/critly-audit/scripts/check.js', pkg);
const tastePath = new URL('src/taste.js', pkg);
const skillTastePath = new URL('../../skills/critly-audit/scripts/taste.js', pkg);
// A Windows checkout turns LF into CRLF; that isn't a difference worth failing on.
const read = async url => { try { return (await readFile(url, 'utf8')).replace(/\r\n/g, '\n'); } catch { return null; } };
const skill = await read(skillPath);
const tasteSource = await read(tastePath);
const skillTaste = await read(skillTastePath);

const stale = [];
if (updated !== source) stale.push('src/check.js RULES table');
if (enumNow !== JSON.stringify(schema.$defs.ruleId.enum)) stale.push('policy.schema.json rule enum');
if (skill !== updated) stale.push('skills/critly-audit/scripts/check.js');
if (skillTaste !== tasteSource) stale.push('skills/critly-audit/scripts/taste.js');

if (checkOnly) {
  if (stale.length) { console.error(`Out of date: ${stale.join(', ')}. Run npm run sync:skill.`); process.exit(1); }
  console.log('check.js, the schema and the skill copies match rules.json and src.');
} else {
  if (updated !== source) await writeFile(checkPath, updated);
  await writeFile(schemaPath, JSON.stringify(schema, null, 2) + '\n');
  await mkdir(dirname(fileURLToPath(skillPath)), { recursive: true });
  await writeFile(skillPath, updated);
  await writeFile(skillTastePath, tasteSource);
  console.log(`Synced ${rules.length} rules; copied src/check.js and src/taste.js to ${fileURLToPath(new URL('.', skillPath))}`);
}
