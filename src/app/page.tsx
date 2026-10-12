import { allConcepts } from "content-collections";

import { CodeBlock } from "@/components/app/code-block";
import { ConceptCard } from "@/components/app/concept-card";
import { ProseLink } from "@/components/app/prose-link";
import { RepoCard } from "@/components/app/repo-card";
import { SectionIcon } from "@/components/app/section-icon";
import { groupBySection } from "@/lib/sections";
import {
  GITHUB_REPO,
  ORIGINAL_AUTHOR,
  ORIGINAL_NAME,
  ORIGINAL_URL,
  SITE_DESCRIPTION,
} from "@/lib/site";

export default function IndexPage() {
  const sections = groupBySection(
    allConcepts.map(({ title, slug, section, order }) => ({
      title,
      slug,
      section,
      order,
    }))
  );

  return (
    <article>
      <h1 className="text-base font-medium">Index</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {SITE_DESCRIPTION} Each one is a short idea with a rule, real numbers
        and a demo you can feel, meant as a collection of useful ideas and
        tricks rather than an exhaustive resource.
      </p>
      <p className="mt-3 text-sm text-muted-foreground">
        Your coding agent can read them too. Install the skill and it uses
        these concepts to build, review and audit your interface:
      </p>
      <CodeBlock
        hideHeader
        tabs={[
          {
            label: "Terminal",
            language: "bash",
            code: `npx skills add ${GITHUB_REPO} -g`,
          },
        ]}
      />
      <p className="mt-3 text-sm text-muted-foreground">
        Critly is open source. To contribute, here&apos;s the repo:
      </p>
      <RepoCard />
      <p className="mt-3 text-sm text-muted-foreground">
        Critly began as a fork of{" "}
        <ProseLink href={ORIGINAL_URL}>{ORIGINAL_NAME}</ProseLink> by{" "}
        {ORIGINAL_AUTHOR}, who built the site, its design language, the demo
        framework and the first concepts. Critly completes the rest and adds
        the Interaction and Content sections, the newer motion and
        performance concepts, and the review and audit skills. Many of the
        newer concepts were written with AI and checked against their
        sources.
      </p>
      <div className="mt-8 flex flex-col gap-12">
        {sections.map(({ section, concepts }) => (
          <section key={section}>
            <h2 className="flex items-center gap-1.5 text-sm font-medium">
              <SectionIcon section={section} size={14} className="mb-px" />
              {section}
            </h2>
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
