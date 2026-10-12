// Finds a browser without downloading one: the system Chrome, then Edge, then a Chromium that
// Playwright already installed (for this playwright-core, or the project's own `playwright`).

import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from 'playwright-core';
import { CritlyError } from './policy.js';

const require = createRequire(import.meta.url);
const coreVersion = JSON.parse(readFileSync(require.resolve('playwright-core/package.json'), 'utf8')).version;

export async function launchBrowser({ cwd = process.cwd() } = {}) {
  const custom = process.env.CRITLY_BROWSER;
  if (custom) {
    try { return await chromium.launch({ executablePath: custom }); }
    catch (error) { throw new CritlyError(`Couldn't start the browser at CRITLY_BROWSER=${custom}: ${firstLine(error)}`); }
  }
  for (const channel of ['chrome', 'msedge']) {
    try { return await chromium.launch({ channel }); } catch { /* try the next one */ }
  }
  try { return await chromium.launch(); } catch { /* not installed for this version */ }
  try {
    const projectRequire = createRequire(resolve(cwd, 'package.json'));
    const { chromium: projectChromium } = projectRequire('playwright');
    return await projectChromium.launch();
  } catch { /* no project playwright, or its browser isn't installed */ }
  throw new CritlyError(
    'No browser found. Critly runs in your installed Google Chrome or Microsoft Edge. Install one of them, ' +
    `or download Chromium with: npx playwright-core@${coreVersion} install chromium`,
  );
}

const firstLine = error => String(error?.message || error).split('\n')[0];
