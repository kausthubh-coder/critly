// The browser that `critly check` and `critly taste` (lint:ui, taste:ui) drive here. The package
// finds an installed Google Chrome or Microsoft Edge itself (my Windows machine), so then nothing
// changes. Without one (a cloud VM), it points the package at Playwright's Chromium under
// PLAYWRIGHT_BROWSERS_PATH through CRITLY_BROWSER, whatever build the package's playwright-core wants.
//
// No imports beyond node: setup and the doctor load it before any install.
//
//   import { findBrowser } from "./browser.mjs";
//   findBrowser()   // { name, env } to merge into the child's environment, or null when there's none

import fs from "node:fs";
import path from "node:path";

const SYSTEM = [
  [process.env.PROGRAMFILES, "Google", "Chrome", "Application", "chrome.exe"],
  [process.env["PROGRAMFILES(X86)"], "Google", "Chrome", "Application", "chrome.exe"],
  [process.env.LOCALAPPDATA, "Google", "Chrome", "Application", "chrome.exe"],
  [process.env.PROGRAMFILES, "Microsoft", "Edge", "Application", "msedge.exe"],
  [process.env["PROGRAMFILES(X86)"], "Microsoft", "Edge", "Application", "msedge.exe"],
  ["/Applications/Google Chrome.app"],
  ["/Applications/Microsoft Edge.app"],
  ["/opt/google/chrome/chrome"],
  ["/opt/microsoft/msedge/msedge"],
].filter(([root]) => root).map((parts) => path.join(...parts));

export function findBrowser() {
  if (process.env.CRITLY_BROWSER) return { name: `CRITLY_BROWSER (${process.env.CRITLY_BROWSER})`, env: {} };
  const system = SYSTEM.find((file) => fs.existsSync(file));
  if (system) return { name: `${/edge/i.test(system) ? "Microsoft Edge" : "Google Chrome"} (${system})`, env: {} };
  const vm = process.env.PLAYWRIGHT_BROWSERS_PATH && path.join(process.env.PLAYWRIGHT_BROWSERS_PATH, "chromium");
  if (vm && fs.existsSync(vm)) {
    const file = fs.realpathSync(vm);
    return { name: `Playwright's Chromium (${file})`, env: { CRITLY_BROWSER: file } };
  }
  return null;
}
