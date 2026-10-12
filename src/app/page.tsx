import { allConcepts } from "content-collections";
import Link from "next/link";

import { CodeBlock } from "@/components/app/code-block";
import { ConceptCard } from "@/components/app/concept-card";
import { RepoCard } from "@/components/app/repo-card";
import { SectionIcon } from "@/components/app/section-icon";
import { CHECK_RUN, DEFAULT_RULES, SKILLS_INSTALL, TASTE_RUN } from "@/lib/check";
import { isConceptAvailable } from "@/lib/concepts";
import { groupBySection } from "@/lib/sections";

export default function IndexPage() {
  const sections = groupBySection(
    allConcepts.map(({ title, slug, section, order }) => ({
      title,
      slug,
      section,
      order,
    }))
  );
  const conceptCount = allConcepts.filter((c) =>
    isConceptAvailable(c.slug)
  ).length;

  const parts = [
    {
      href: "#library",
      name: "Library",
      detail: `${conceptCount} concepts. Each is one idea with a rule, real numbers and a demo you can feel.`,
    },
    {
      href: "/skills",
      name: "Skills",
      detail:
        "Your agent builds, reviews and audits your interface with the concepts open.",
    },
    {
      href: "/check",
      name: "Check",
      detail: `Lints the running app against ${DEFAULT_RULES.length} rules, and runs a taste pass for what no rule can fail. Every finding names the fix and the concept behind it.`,
    },
  ];

  return (
    <article>
      <h1 className="text-2xl font-semibold tracking-[-0.02em] text-balance">
        Design taste your coding agent can use, and a check it can&apos;t skip.
      </h1>
      <p className="mt-3 text-base text-muted-foreground text-pretty">
        Critly is a library of design-engineering concepts, skills that bring
        them into your agent&apos;s work, and a check that measures your
        running app against them. The three point at each other: a failing
        check links to the concept, and the skill tells the agent to run the
        check before it says it&apos;s done.
      </p>

      <ul className="mt-6 flex flex-col overflow-hidden rounded-xl bg-card shadow-(--custom-shadow)">
        {parts.map((part) => (
          <li key={part.name} className="border-b border-border/60 last:border-b-0">
            <Link
              href={part.href}
              className="flex items-baseline gap-4 px-4 py-3.5 hover:bg-muted"
            >
              <span className="w-14 shrink-0 text-sm font-medium text-foreground">
                {part.name}
              </span>
              <span className="min-w-0 flex-1 text-sm text-muted-foreground text-pretty">
                {part.detail}
              </span>
              <span aria-hidden="true" className="text-muted-foreground">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-lg font-medium">Start</h2>
      <p className="mt-2 text-base text-muted-foreground">
        Install the skills for every agent you use, then ask yours to set up the
        check.
      </p>
      <CodeBlock
        tabs={[
          { label: "Skills", language: "bash", code: SKILLS_INSTALL },
          { label: "Check", language: "bash", code: CHECK_RUN },
          { label: "Taste", language: "bash", code: TASTE_RUN },
        ]}
      />
      <p className="mt-3 text-base text-muted-foreground">
        Critly is open source. To contribute, here&apos;s the repo:
      </p>
      <RepoCard />

      <h2 id="library" className="mt-12 scroll-mt-28 text-lg font-medium">
        Library
      </h2>
      <p className="mt-2 text-base text-muted-foreground text-pretty">
        Short ideas and tricks rather than an exhaustive resource. Concepts
        marked <span className="font-medium text-foreground">Checked</span>{" "}
        have a rule the check measures.
      </p>
      <div className="mt-8 flex flex-col gap-12">
        {sections.map(({ section, concepts }) => (
          <section key={section}>
            <h3 className="flex items-center gap-1.5 text-base font-medium">
              <SectionIcon section={section} size={14} className="mb-px" />
              {section}
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {concepts.map((concept) => (
                <ConceptCard
                  key={concept.slug}
                  slug={concept.slug}
                  title={concept.title}
                  description={
                    allConcepts.find((c) => c.slug === concept.slug)
                      ?.description
                  }
                  section={section}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
