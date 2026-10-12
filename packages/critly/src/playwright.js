// Use the check inside your own Playwright tests, on whatever state the test reached
// (a dialog, an error, a signed-in page):
//
//   import { expectCritly } from '@kausthubh/critly/playwright';
//   await expectCritly(page, testInfo);

import { AssertionError } from 'node:assert';
import { loadPolicy, validatePolicy } from './policy.js';
import { runOnPage } from './index.js';

async function resolvePolicy(policy, policyPath) {
  if (policy) return validatePolicy(policy);
  return (await loadPolicy(policyPath)).policy;
}

/**
 * Checks the page as it is now. Returns { findings, coverage, suppressed }.
 * policy: a policy object, or omitted to read .critly/policy.json from the working directory.
 */
export async function checkPage(page, policy, { policyPath, scheme } = {}) {
  const p = await resolvePolicy(policy, policyPath);
  const size = page.viewportSize();
  const viewport = size ? `${size.width}x${size.height}` : undefined;
  return runOnPage(page, p, { viewport, scheme });
}

/**
 * Throws an AssertionError listing every finding (errors and reviews) unless the page passes.
 * With testInfo, attaches the JSON report to the Playwright report.
 * options: { policy, policyPath, scheme }
 */
export async function expectCritly(page, testInfo, options = {}) {
  const result = await checkPage(page, options.policy, options);
  if (testInfo?.attach) {
    await testInfo.attach('critly-report.json', { body: JSON.stringify({ url: page.url(), ...result }, null, 2), contentType: 'application/json' });
  }
  if (!result.findings.length) return result;
  const lines = result.findings.map(f => `${f.severity === 'error' ? '✕' : '?'} ${f.rule} (${f.severity}, ${f.viewport}, ${f.scheme})\n  where   ${f.where}\n  actual  ${f.actual}\n  fix     ${f.fix}\n  concept ${f.concept}`);
  const errors = result.findings.filter(f => f.severity === 'error').length;
  throw new AssertionError({
    message: `critly: ${errors} error${errors === 1 ? '' : 's'}, ${result.findings.length - errors} review on ${page.url()}\n\n${lines.join('\n\n')}\n\nFix the UI, not the policy.`,
    actual: result.findings,
    expected: [],
    operator: 'expectCritly',
    stackStartFn: expectCritly,
  });
}
