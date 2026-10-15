// Makes any checkout of this repo (the main one or a worktree) ready to work in, safely rerunnable:
// installs the site's and the package's dependencies when their lockfile changed, gives the
// checkout its own dev port, and links .claude/skills to .agents/skills. Ends with the doctor.
//
//   bun run setup     fix what's missing, then run the doctor
//   bun run doctor    check only; prints the command that fixes each failure
//
// Critly is a static site with no backend and no secrets: the only untracked env file in the
// main checkout is a Vercel CLI token nothing reads, so nothing is copied. .env.local holds PORT.

import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { ROOT, DEFAULT_PORT, readPort } from "./port.mjs";
import { findBrowser } from "./browser.mjs";

const doctorOnly = process.argv.includes("--doctor");
const git = (...args) => execFileSync("git", ["-C", ROOT, ...args], { encoding: "utf8" }).trim();
const norm = (p) => (process.platform === "win32" ? path.resolve(p).toLowerCase() : path.resolve(p));
const same = (a, b) => norm(a) === norm(b);

const MAIN = path.dirname(path.resolve(ROOT, git("rev-parse", "--git-common-dir")));
const isMain = same(MAIN, ROOT);

// Each install records the hash of the lockfile it installed from, so setup only reinstalls
// when the lockfile changed.
const installs = [
  { name: "site deps", dir: ROOT, lock: "bun.lock", command: "bun install --frozen-lockfile" },
  // The npm package keeps its own npm lockfile because it's published with npm.
  { name: "package deps", dir: path.join(ROOT, "packages", "critly"), lock: "package-lock.json", command: "npm ci --no-audit --no-fund" },
];
const stampPath = (install) => path.join(install.dir, "node_modules", ".setup-stamp");
const lockHash = (install) => createHash("sha1").update(fs.readFileSync(path.join(install.dir, install.lock))).digest("hex");
const installed = (install) => {
  try { return fs.readFileSync(stampPath(install), "utf8").trim() === lockHash(install); } catch { return false; }
};

// Ports other checkouts of this repo have claimed, by path.
function otherPorts() {
  const claimed = new Map();
  for (const line of git("worktree", "list", "--porcelain").split("\n")) {
    if (!line.startsWith("worktree ")) continue;
    const dir = line.slice("worktree ".length);
    const port = readPort(dir);
    if (port && !same(dir, ROOT)) claimed.set(port, dir);
  }
  return claimed;
}

// Next listens on every interface, so probe the same way (IPv4 only if this machine has no IPv6).
const isFree = (port, host = "::") =>
  new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", (error) => resolve(error.code === "EADDRINUSE" || host !== "::" ? false : isFree(port, "0.0.0.0")));
    server.listen({ port, host }, () => server.close(() => resolve(true)));
  });

// The main checkout keeps Next's usual 3000. Worktrees get 3100-3899 from a hash of their path,
// stepping past ports that another checkout claimed or something else is using.
async function pickPort() {
  if (isMain) return DEFAULT_PORT;
  const claimed = otherPorts();
  const start = createHash("sha1").update(norm(ROOT)).digest().readUInt32BE(0) % 800;
  for (let i = 0; i < 800; i++) {
    const port = 3100 + ((start + i) % 800);
    if (!claimed.has(port) && (await isFree(port))) return port;
  }
  throw new Error("No free port between 3100 and 3899.");
}

function writePort(port) {
  const file = path.join(ROOT, ".env.local");
  const text = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  const next = /^PORT=.*$/m.test(text) ? text.replace(/^PORT=.*$/m, `PORT=${port}`) : `${text}${text && !text.endsWith("\n") ? "\n" : ""}PORT=${port}\n`;
  fs.writeFileSync(file, next);
}

const SKILLS = path.join(ROOT, ".agents", "skills");
const SKILLS_LINK = path.join(ROOT, ".claude", "skills");
const skillsLinked = () => {
  try { return same(fs.realpathSync(SKILLS_LINK), fs.realpathSync(SKILLS)); } catch { return false; }
};

async function setup() {
  for (const install of installs) {
    if (installed(install)) continue;
    console.log(`> ${install.command}   (${path.relative(ROOT, install.dir) || "."})`);
    const result = spawnSync(install.command, { cwd: install.dir, stdio: "inherit", shell: true });
    if (result.status !== 0) throw new Error(`${install.command} failed in ${install.dir}`);
    fs.writeFileSync(stampPath(install), lockHash(install));
  }

  const port = readPort();
  const claimedBy = port && otherPorts().get(port);
  if (!port || claimedBy || (isMain && port !== DEFAULT_PORT)) {
    const picked = await pickPort();
    writePort(picked);
    console.log(`> PORT=${picked} written to .env.local${claimedBy ? ` (${port} belongs to ${claimedBy})` : ""}`);
  }

  if (!skillsLinked()) {
    fs.mkdirSync(path.dirname(SKILLS_LINK), { recursive: true });
    // Replace a stale link, but never delete a real folder (or recurse through a junction).
    const existing = fs.lstatSync(SKILLS_LINK, { throwIfNoEntry: false });
    if (existing && !existing.isSymbolicLink()) throw new Error(".claude/skills is a real folder; move its skills to .agents/skills and delete it");
    if (existing) try { fs.unlinkSync(SKILLS_LINK); } catch { fs.rmdirSync(SKILLS_LINK); }
    fs.symlinkSync(process.platform === "win32" ? SKILLS : path.join("..", ".agents", "skills"), SKILLS_LINK, "junction");
    console.log("> linked .claude/skills to .agents/skills");
  }
}

async function doctor() {
  const failures = [];
  const report = (ok, name, detail, fix) => {
    console.log(`${ok ? "ok  " : "FAIL"} ${name}: ${detail}${ok || !fix ? "" : `   fix: ${fix}`}`);
    if (!ok) failures.push(name);
  };

  for (const install of installs) {
    const where = path.relative(ROOT, install.dir) || ".";
    report(installed(install), install.name, installed(install) ? `match ${install.lock}` : `missing or older than ${where}/${install.lock}`, "bun run setup");
  }

  const port = readPort();
  const claimedBy = port && otherPorts().get(port);
  if (!port) report(false, "port", "no PORT in .env.local", "bun run setup");
  else if (claimedBy) report(false, "port", `${port} is also claimed by ${claimedBy}`, "bun run setup");
  else report(true, "port", `${port} (${(await isFree(port)) ? "free" : "in use, by this checkout's dev server if you started one"})`);

  report(skillsLinked(), "skills link", skillsLinked() ? ".claude/skills -> .agents/skills" : ".claude/skills is missing or points elsewhere", "bun run setup");
  const browser = findBrowser();
  report(!!browser, "browser", browser ? `${browser.name} for lint:ui and taste:ui` : "no Chrome, Edge or Playwright Chromium", "install Google Chrome, or set CRITLY_BROWSER to a Chromium");
  report(true, "backend", "none (static site, nothing shared between checkouts)");
  report(true, "env", "nothing to copy; .env.local only holds PORT");

  let behind = "unknown (no origin/main)";
  try { behind = `${git("rev-list", "--count", "HEAD..origin/main")} commits behind origin/main as of the last fetch`; } catch {}
  report(true, "git", `${isMain ? "main checkout" : "worktree"} on ${git("branch", "--show-current") || "detached HEAD"}, ${behind}`);

  const summary = failures.length
    ? `critly NOT ready: ${failures.join(", ")} failing. Run bun run setup.`
    : `critly ready: http://localhost:${port} · ${isMain ? "main checkout" : "worktree"} · deps ok · no backend · ${behind.split(" as of")[0]}`;
  console.log(`\n${summary}`);
  return failures.length ? 1 : 0;
}

try {
  if (!doctorOnly) await setup();
  process.exit(await doctor());
} catch (error) {
  console.error(`setup failed: ${error.message}`);
  process.exit(1);
}
