// Regenerates the self-contained agent skill in skills/critly
// from the launched concepts in content/. Run with `bun run build:skill` after
// publishing or editing a concept, and commit the result.

import { readdir, readFile, writeFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

import { isConceptLaunched } from "../src/lib/concepts";
import {
  conceptMarkdown,
  conceptUrl,
  type MarkdownConcept,
} from "../src/lib/markdown";
import { SECTIONS } from "../src/lib/sections";

const ROOT = path.resolve(import.meta.dirname, "..");
const CONTENT_DIR = path.join(ROOT, "content");
const SKILL_DIR = path.join(ROOT, "skills", "critly");
const REFERENCES_DIR = path.join(SKILL_DIR, "references");

type Concept = MarkdownConcept & { order: number };

async function loadConcepts(): Promise<Concept[]> {
  const concepts: Concept[] = [];
  for (const section of await readdir(CONTENT_DIR)) {
    const dir = path.join(CONTENT_DIR, section);
    for (const file of await readdir(dir)) {
      if (!file.endsWith(".mdx")) continue;
      const slug = file.replace(/\.mdx$/, "");
      if (!isConceptLaunched(slug)) continue;
      const { data, content } = matter(await readFile(path.join(dir, file), "utf8"));
      concepts.push({
        title: data.title,
        description: data.description,
        section: data.section,
        slug,
        order: data.order ?? 0,
        publishedAt: data.publishedAt,
        content,
        sourcePath: `${section}/${file}`,
        resources: (data.resources ?? []).map(
          (r: { url: string; title?: string; description?: string }) => ({
            url: r.url,
            title: r.title ?? new URL(r.url).hostname.replace(/^www\./, ""),
            description: r.description,
          }),
        ),
      });
    }
  }
  return concepts.sort(
    (a, b) =>
      SECTIONS.indexOf(a.section as (typeof SECTIONS)[number]) -
        SECTIONS.indexOf(b.section as (typeof SECTIONS)[number]) ||
      a.order - b.order ||
      a.title.localeCompare(b.title),
  );
}

// Demotes every heading one level so a concept sits under its section
// heading. Skips fenced code blocks.
function demoteHeadings(markdown: string) {
  let inFence = false;
  return markdown
    .split("\n")
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
      if (!inFence && /^#{1,5} /.test(line)) return `#${line}`;
      return line;
    })
    .join("\n");
}

// GitHub-style heading anchor, so the index can deep-link into a reference file.
function anchor(title: string) {
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N} -]/gu, "")
    .replace(/ /g, "-");
}

// The rule each article states once in bold, as a sentence. Falls back to the
// one-line description for the few articles that state it differently.
function ruleOf(concept: Concept) {
  const prose = concept.content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/<CodeBlock[\s\S]*?\/>/g, "")
    .replace(/\s+/g, " ");
  const bold = prose
    .split("**")
    .filter((_, i) => i % 2 === 1)
    .map((s) => s.trim());
  const rule = bold.find((s) => s.length >= 20 && /[.!?]$/.test(s));
  if (!rule) return concept.description;
  return rule.charAt(0).toUpperCase() + rule.slice(1);
}

function referenceFile(section: string) {
  return `${section.toLowerCase()}.md`;
}

async function main() {
  const concepts = await loadConcepts();
  const bySection = SECTIONS.map((section) => ({
    section,
    concepts: concepts.filter((c) => c.section === section),
  })).filter((s) => s.concepts.length > 0);

  await rm(REFERENCES_DIR, { recursive: true, force: true });
  await mkdir(REFERENCES_DIR, { recursive: true });

  for (const { section, concepts } of bySection) {
    const body = concepts.map((c) => demoteHeadings(conceptMarkdown(c))).join("\n\n");
    await writeFile(
      path.join(REFERENCES_DIR, referenceFile(section)),
      `# ${section}\n\n${body}`,
    );
  }

  // A short checklist, cheap enough to re-read mid-task and before finishing.
  const rules = bySection.flatMap(({ section, concepts }) => [
    `## ${section}`,
    "",
    ...concepts.map(
      (c) =>
        `- **${c.title}**: ${ruleOf(c)} ([full](${referenceFile(section)}#${anchor(c.title)}))`,
    ),
    "",
  ]);
  await writeFile(
    path.join(REFERENCES_DIR, "rules.md"),
    [
      "# Rules",
      "",
      "One rule per concept. Re-read this before you finish any UI change, and open the full reference for every rule your change touches.",
      "",
      ...rules,
    ]
      .join("\n")
      .trimEnd() + "\n",
  );

  const index = bySection.flatMap(({ section, concepts }) => [
    `### ${section}`,
    "",
    ...concepts.map(
      (c) =>
        `- **${c.title}**: ${c.description} ([reference](references/${referenceFile(section)}#${anchor(c.title)}), [demo](${conceptUrl(c.slug)}))`,
    ),
    "",
  ]);

  const skillPath = path.join(SKILL_DIR, "SKILL.md");
  const skill = await readFile(skillPath, "utf8");
  const start = "<!-- concepts:start -->";
  const end = "<!-- concepts:end -->";
  const [before, rest] = skill.split(start);
  const after = rest?.split(end)[1];
  if (after === undefined) {
    throw new Error(`SKILL.md is missing the ${start} / ${end} markers`);
  }
  await writeFile(
    skillPath,
    // Stamp the build date so installed copies can tell when they're stale.
    `${before}${start}\n${index.join("\n").trimEnd()}\n${end}${after}`.replace(
      /version: "[^"]*"/,
      `version: "${new Date().toISOString().slice(0, 10)}"`,
    ),
  );

  console.log(
    `Wrote ${concepts.length} concepts across ${bySection.length} reference files.`,
  );
}

main();
