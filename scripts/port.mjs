// Runs a command on this checkout's dev port. `bun run setup` gives every checkout its own port
// and writes PORT=<n> to .env.local. Next only reads PORT from the real environment, and bun
// doesn't load .env.local for package scripts, so the package scripts go through this file.
//
//   node scripts/port.mjs next dev
//   node scripts/port.mjs node packages/critly/bin/critly.js check http://localhost:{port}

import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const DEFAULT_PORT = 3000;

// The PORT line in <dir>/.env.local, or null.
export function readPort(dir = ROOT) {
  try {
    const match = readFileSync(path.join(dir, ".env.local"), "utf8").match(/^PORT=(\d+)\s*$/m);
    return match ? Number(match[1]) : null;
  } catch {
    return null;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = process.env.PORT || readPort() || DEFAULT_PORT;
  const command = process.argv.slice(2).map((arg) => arg.replaceAll("{port}", String(port)));
  if (!command.length) {
    console.log(port);
  } else {
    const child = spawn(command.join(" "), { stdio: "inherit", shell: true, env: { ...process.env, PORT: String(port) } });
    child.on("exit", (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
    for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
  }
}
