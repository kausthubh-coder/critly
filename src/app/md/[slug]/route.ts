import { allConcepts } from "content-collections";

import { isConceptAvailable } from "@/lib/concepts";
import { conceptMarkdown, conceptUrl } from "@/lib/markdown";

// Reached via `/<slug>.md` or `Accept: text/markdown` (see src/proxy.ts).

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return allConcepts
    .filter((concept) => isConceptAvailable(concept.slug))
    .map((concept) => ({ slug: concept.slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const concept = allConcepts.find((c) => c.slug === slug);
  if (!concept || !isConceptAvailable(slug)) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(conceptMarkdown(concept), {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      link: `<${conceptUrl(slug)}>; rel="canonical"`,
      vary: "Accept",
    },
  });
}
