import { NextResponse, type NextRequest } from "next/server";

// Serves the Markdown version of a concept at `/<slug>.md`, and to any client
// that asks for `text/markdown` via the Accept header. Both rewrite to the
// prerendered route handler at `/md/<slug>`.

const NON_CONCEPT_PAGES = new Set(["goats", "resources"]);

function prefersMarkdown(accept: string | null) {
  if (!accept) return false;
  let markdown = -1;
  let html = -1;
  accept.split(",").forEach((entry, index) => {
    const [type, ...params] = entry.trim().split(";");
    const q = Number(
      params.find((p) => p.trim().startsWith("q="))?.split("=")[1] ?? 1,
    );
    if (q <= 0) return;
    // Earlier entries win ties, so fold position into the score.
    const score = q * 1000 - index;
    if (type.trim() === "text/markdown") markdown = score;
    if (type.trim() === "text/html") html = score;
  });
  return markdown > html;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const explicit = pathname.match(/^\/([\w-]+)\.md$/);
  if (explicit) {
    const url = request.nextUrl.clone();
    url.pathname = `/md/${explicit[1]}`;
    return NextResponse.rewrite(url);
  }

  const page = pathname.match(/^\/([\w-]+)$/);
  if (
    page &&
    !NON_CONCEPT_PAGES.has(page[1]) &&
    prefersMarkdown(request.headers.get("accept"))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = `/md/${page[1]}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  // Single-segment paths only; everything under `/_next`, `/og`, etc. skips this.
  matcher: "/:path",
};
