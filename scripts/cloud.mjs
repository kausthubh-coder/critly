// Makes a cloud session (Claude Code on the web, Codex Cloud) ready by itself. A cloud VM starts
// from a bare Linux clone: no global skills, no deps, no .claude/skills link, no Chrome.
//
//   Claude: the SessionStart hook in .claude/settings.json runs `node scripts/cloud.mjs`
//   Codex:  the environment's setup script is `CLOUD=1 node scripts/cloud.mjs`
//
// Local sessions don't set CLAUDE_CODE_REMOTE, CODEX_CI or CLOUD, so it exits at once there.
// stdout becomes the session's context, so only my rules and the last line go there; setup's
// output goes to stderr.

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { ROOT } from "./port.mjs";
import { findBrowser } from "./browser.mjs";

if (process.env.CLAUDE_CODE_REMOTE !== "true" && !process.env.CODEX_CI && process.env.CLOUD !== "1") process.exit(0);

const problems = [];
const run = (command, stdout, cwd = ROOT) => spawnSync(command, { cwd, shell: true, stdio: ["ignore", stdout, "inherit"] }).status === 0;

// 1. My global skills and rules. Its stdout (the rules) passes through to the session.
if (!run("curl -fsSL https://raw.githubusercontent.com/kausthubh-coder/skills/main/cloud/session.sh | bash", "inherit"))
  problems.push("the global skills and rules didn't load");

// 2. Setup: both installs, port, skills link, then the doctor. Its output goes to stderr.
if (!run("node scripts/setup.mjs", process.stderr)) problems.push("setup or the doctor failed (run bun run doctor)");

// 3. A browser for critly check and taste. lint:ui and taste:ui pass it on themselves (port.mjs);
// CRITLY_BROWSER in the session's env covers running the CLI directly. With none on the VM,
// install the Chromium the package's playwright-core wants, which it then finds on its own.
const browser = findBrowser();
if (!browser && !run("node node_modules/playwright-core/cli.js install chromium", process.stderr, `${ROOT}/packages/critly`))
  problems.push("no browser for critly check, and installing Playwright's Chromium failed");
if (browser?.env.CRITLY_BROWSER && process.env.CLAUDE_ENV_FILE)
  fs.appendFileSync(process.env.CLAUDE_ENV_FILE, `export CRITLY_BROWSER=${browser.env.CRITLY_BROWSER}\n`);

console.log(problems.length ? `cloud: critly NOT ready: ${problems.join("; ")}.` : "cloud: critly ready (deps, port, skills, browser). See ## Cloud sessions in AGENTS.md.");
