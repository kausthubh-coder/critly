import rules from "../../packages/critly/src/rules.json";

import { SITE_URL } from "@/lib/site";

// The check's rules live with the npm package, so the site, the skill and the
// CLI never disagree about what's checked or which concept a rule belongs to.

export type CheckStage = "v1" | "guarded" | "v2";

export type CheckRule = {
  id: string;
  concept: string;
  stage: CheckStage;
  policy: boolean;
  fails: string;
};

export const CHECK_RULES = rules as CheckRule[];

/** Rules on by default. */
export const DEFAULT_RULES = CHECK_RULES.filter((rule) => rule.stage === "v1");

/** Rules that run today: on by default (v1) or opt-in (guarded). */
export const LIVE_RULES = CHECK_RULES.filter((rule) => rule.stage !== "v2");

export function rulesForConcept(slug: string) {
  return LIVE_RULES.filter((rule) => rule.concept === slug);
}

export const CHECKED_CONCEPTS = new Set(
  CHECK_RULES.filter((rule) => rule.stage === "v1").map((rule) => rule.concept),
);

export const SKILLS_INSTALL = "npx skills add kausthubh-coder/critly -g";
// npm blocked the bare name (too close to "citty"), so the package is scoped;
// the command it installs is still `critly`.
export const CHECK_PACKAGE = "@kausthubh/critly";
export const CHECK_RUN = `npx ${CHECK_PACKAGE} check http://localhost:3000`;
export const TASTE_RUN = `npx ${CHECK_PACKAGE} taste http://localhost:3000`;
export const CHECK_INSTALL = `npm i -D ${CHECK_PACKAGE}`;
export const SETUP_URL = `${SITE_URL}/setup.md`;
export const SETUP_PROMPT = `Read ${SETUP_URL} and set up the Critly check in this project.`;
