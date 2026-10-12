import { allConcepts } from "content-collections";
import type { Metadata } from "next";
import Link from "next/link";

import { CodeBlock } from "@/components/app/code-block";
import {
  CHECK_RULES,
  CHECK_RUN,
  SETUP_PROMPT,
  type CheckStage,
} from "@/lib/check";

const TITLE = "Check";
const DESCRIPTION =
  "Lint the running app against Critly's concepts. Every finding names the fix.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/check" },
  openGraph: {
    type: "website",
    title: TITLE,
    description: DESCRIPTION,
    url: "/check",
    images: ["/og/check"],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og/check"],
  },
};

const SAMPLE_OUTPUT = `http://localhost:3000/settings/billing

✕ hit-area  error · 390x844 · light
  where   button "Close" in <dialog> "Edit payment method"
  actual  20×20px
  fix     Make it at least 44×44px at ≤ 640px wide (p-3, or a larger icon button)
  concept https://critly.vercel.app/hit-areas

✕ text-contrast  error · 1440x900 · dark
  where   p.hint "Billed yearly, cancel any time" under "Plan"
  actual  3.1:1 on the card
  fix     Use --muted-foreground (5.2:1) or darker; needs 4.5:1
  concept https://critly.vercel.app/color-roles

checked 3 pages × 2 viewports × 2 schemes · 1,284 elements · 14 rules
critly check: 2 errors, 0 review · exit 1`;

const POLICY = `{
  "fonts": ["Inter", "JetBrains Mono"],
  "typeScale": [12, 14, 16, 20, 24, 48],
  "schemes": { "light": {}, "dark": { "class": "dark", "on": "html" } },
  "pages": ["/", "/settings", "/settings/billing"],
  "exceptions": [
    {
      "selector": ".embed-map *",
      "rules": ["text-contrast"],
      "reason": "Third-party map tiles; we don't control their text."
    }
  ]
}`;

const PLAYWRIGHT = `import { test } from "@playwright/test";
import { expectCritly } from "@kausthubh/critly/playwright";

test("billing page passes the Critly check", async ({ page }, testInfo) => {
  await page.goto("/settings/billing");
  await expectCritly(page, testInfo);
});`;

const STAGES: { stage: CheckStage; title: string; note: string }[] = [
  {
    stage: "v1",
    title: "On by default",
    note: "Measured on one render with no markup. Rules marked policy need your app's values.",
  },
  {
    stage: "guarded",
    title: "Opt-in",
    note: "These infer intent from layout, so they stay off until you turn them on in the policy.",
  },
  {
    stage: "v2",
    title: "Coming",
    note: "These need interaction: pressing Tab, opening dialogs, watching the page load.",
  },
];

const linkClass =
  "text-foreground underline decoration-foreground/20 underline-offset-4 hover:decoration-foreground";

export default function CheckPage() {
  return (
    <article>
      <h1 className="text-base font-medium">Check</h1>
      <p className="mt-3 text-sm text-muted-foreground text-pretty">
        <code className="font-mono text-[13px] text-foreground">critly check</code>{" "}
        opens your running app, measures what it renders at phone and desktop
        widths in light and dark, and fails when the interface breaks a
        concept. Each finding says what to change it to and links the concept
        that explains why. Your agent runs it before it says it&apos;s done, and
        the exit code is the one thing it can&apos;t talk its way past.
      </p>

      <h2 className="mt-10 text-sm font-medium">Set it up with your agent</h2>
      <p className="mt-2 text-sm text-muted-foreground text-pretty">
        Paste this to your agent. It reads the{" "}
        <a href="/setup.md" className={linkClass}>
          setup guide
        </a>
        , drafts your app&apos;s policy from its design tokens, asks you to
        approve it, and adds the check to your scripts and AGENTS.md.
      </p>
      <CodeBlock tabs={[{ label: "Prompt", language: "text", code: SETUP_PROMPT }]} hideHeader />

      <h2 className="mt-10 text-sm font-medium">Or run it yourself</h2>
      <CodeBlock tabs={[{ label: "Run", language: "bash", code: CHECK_RUN }]} hideHeader />
      <p className="mt-3 text-sm text-muted-foreground text-pretty">
        It uses the Chrome or Edge you already have. Exit 0 means it passed, 1
        means there are findings (including ones it couldn&apos;t decide), and 2
        means it couldn&apos;t run. The last line is the summary worth quoting.
      </p>
      <CodeBlock
        tabs={[{ label: "Output", language: "text", code: SAMPLE_OUTPUT, filename: "critly check" }]}
      />

      <h2 className="mt-10 text-sm font-medium">The policy</h2>
      <p className="mt-2 text-sm text-muted-foreground text-pretty">
        <code className="font-mono text-[13px] text-foreground">.critly/policy.json</code>{" "}
        is your design system as numbers: fonts, the type scale, how dark mode
        switches, which pages to check, and exceptions. Every exception needs a
        reason. Fix the interface, not the policy: findings never suggest
        editing it, and agents are told not to without asking you.
      </p>
      <CodeBlock
        tabs={[{ label: "Policy", language: "json", code: POLICY, filename: ".critly/policy.json" }]}
      />

      <h2 className="mt-10 text-sm font-medium">Rules</h2>
      {STAGES.map(({ stage, title, note }) => (
        <section key={stage} className="mt-6">
          <h3 className="text-sm text-foreground">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">{note}</p>
          <ul className="mt-3 flex flex-col">
            {CHECK_RULES.filter((rule) => rule.stage === stage).map((rule) => (
              <li
                key={rule.id}
                id={rule.id}
                className="scroll-mt-28 border-b border-border/60 py-3 last:border-b-0"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <code className="font-mono text-[13px] text-foreground">
                    {rule.id}
                    {rule.policy && (
                      <span className="ml-2 font-sans text-xs text-muted-foreground">
                        policy
                      </span>
                    )}
                  </code>
                  <Link href={`/${rule.concept}`} className="text-xs text-muted-foreground hover:text-foreground">
                    {conceptTitle(rule.concept)} →
                  </Link>
                </div>
                <p className="mt-1 text-sm text-muted-foreground text-pretty">
                  {rule.fails}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <h2 className="mt-10 text-sm font-medium">In your tests</h2>
      <p className="mt-2 text-sm text-muted-foreground text-pretty">
        Already use Playwright? Check any state your tests reach: an open
        dialog, a filled form, a signed-in page.
      </p>
      <CodeBlock
        tabs={[{ label: "Playwright", language: "ts", code: PLAYWRIGHT, filename: "billing.spec.ts" }]}
      />

      <h2 className="mt-10 text-sm font-medium">What it can&apos;t tell you</h2>
      <p className="mt-2 text-sm text-muted-foreground text-pretty">
        The check rules out the mistakes you can measure. It can&apos;t judge
        hierarchy, whitespace, copy or whether a screen feels right; that&apos;s
        what the{" "}
        <Link href="/skills" className={linkClass}>
          review and audit skills
        </Link>{" "}
        are for, along with looking at the screen. When it can&apos;t decide,
        like text over an image, it reports the finding for review instead of
        passing it.
      </p>
      <p className="mt-3 text-sm text-muted-foreground text-pretty">
        The method comes from{" "}
        <a href="https://github.com/gholtzap/lintapple" className={linkClass}>
          lintapple
        </a>{" "}
        and the messages from{" "}
        <a href="https://github.com/shadcn-ui/lint" className={linkClass}>
          @shadcn/lint
        </a>
        . See{" "}
        <Link href="/credits" className={linkClass}>
          Credits
        </Link>
        .
      </p>
    </article>
  );
}

function conceptTitle(slug: string) {
  return allConcepts.find((concept) => concept.slug === slug)?.title ?? slug;
}
