import type { Metadata } from "next";
import Link from "next/link";

import { CodeBlock } from "@/components/app/code-block";
import { SKILLS_INSTALL } from "@/lib/check";

const TITLE = "Skills";
const DESCRIPTION =
  "Critly's concepts as agent skills: build, review and audit with them.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/skills" },
  openGraph: {
    type: "website",
    title: TITLE,
    description: DESCRIPTION,
    url: "/skills",
    images: ["/og/skills"],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og/skills"],
  },
};

const SKILLS = [
  {
    name: "critly",
    detail:
      "Build and review. Picks the concepts that match the work, applies their exact values, runs a taste pass on every screen it touches, and reviews with a table: what it was, what it should be, and the concept behind each change.",
    ask: "Review the settings page with critly.",
  },
  {
    name: "critly-audit",
    detail:
      "Audit a whole app from a URL, the code, or both: the system, the composition, the details and the speed. It writes the app's design policy and sets up the check.",
    ask: "Audit my app at localhost:3000 and fix what you find.",
  },
];

const AGENTS_LINES = `- UI work: use the \`critly\` skill. Read \`.critly/direction.md\` (the look) and \`.critly/policy.json\` (the values) before choosing type, color or spacing. Use only the policy's values, and never edit it to pass.
- After any UI change, run \`npm run lint:ui\` and fix every error until it exits 0. Exit 2 means it couldn't run; say so, it is not a pass. Then run \`npm run taste:ui\`, open the squint and overlay images for each changed screen, and fix each look or say why the screen needs it before saying it's done.`;

export default function SkillsPage() {
  return (
    <article>
      <h1 className="text-2xl font-semibold tracking-[-0.02em]">Skills</h1>
      <p className="mt-3 text-base text-muted-foreground text-pretty">
        The same concepts as the library, written for your coding agent. They
        are plain files: your agent reads them while it builds and reviews, and
        nothing runs until it does. They work in Claude Code, Codex, Cursor and
        most other agents.
      </p>

      <h2 className="mt-10 text-lg font-medium">Install</h2>
      <CodeBlock
        tabs={[
          { label: "Every agent", language: "bash", code: SKILLS_INSTALL },
          {
            label: "This project only",
            language: "bash",
            code: "npx skills add kausthubh-coder/critly",
          },
          { label: "Update", language: "bash", code: "npx skills update -g" },
        ]}
      />
      <p className="mt-3 text-base text-muted-foreground text-pretty">
        Install globally so every project gets updates. A copy vendored inside
        one project goes stale; the skill notices and tells you once.
      </p>

      <h2 className="mt-10 text-lg font-medium">The skills</h2>
      <ul className="mt-2 flex flex-col">
        {SKILLS.map((skill) => (
          <li key={skill.name} className="border-b border-border/60 py-4 last:border-b-0">
            <code className="font-mono text-[13px] text-foreground">
              {skill.name}
            </code>
            <p className="mt-1.5 text-base text-muted-foreground text-pretty">
              {skill.detail}
            </p>
            <p className="mt-2 text-base text-pretty">
              <span className="text-muted-foreground">Ask: </span>
              <span className="text-foreground">&ldquo;{skill.ask}&rdquo;</span>
            </p>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-lg font-medium">Keep your agent on it</h2>
      <p className="mt-2 text-base text-muted-foreground text-pretty">
        Agents read a skill once and rarely come back to it. AGENTS.md is in
        context for every task, whether or not the agent picks the skill, and
        it survives when a long session is compacted. In our tests, agents with
        these two lines ran the{" "}
        <Link href="/check" className="text-foreground underline decoration-foreground/20 underline-offset-4 hover:decoration-foreground">
          check
        </Link>{" "}
        every time and finished with no errors; agents with only the skill
        never ran it. The check&apos;s setup adds them for you.
      </p>
      <CodeBlock
        tabs={[
          {
            label: "AGENTS.md",
            language: "markdown",
            code: AGENTS_LINES,
            filename: "AGENTS.md",
          },
        ]}
      />
    </article>
  );
}
