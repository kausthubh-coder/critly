import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";

import { GITHUB_REPO, GITHUB_URL } from "@/lib/site";

// A link preview for the repository, sized and surfaced like a code block so
// the two sit together on the index page. The height equals a headerless
// one-line code block: 1rem padding on each side plus one 0.75rem line at
// 1.625 line-height (see `.code-block-panel .shiki` in globals.css).
export function RepoCard() {
  return (
    <a
      href={GITHUB_URL}
      target="_blank"
      rel="noreferrer"
      className="group my-6 flex h-[calc(2rem+1.625*0.75rem)] items-center gap-3 rounded-xl bg-card px-4 pr-4.5 shadow-(--custom-shadow) transition-colors hover:bg-muted"
    >
      {/* Official mark from svgl.app, one variant per theme. */}
      <Image
        aria-hidden="true"
        alt=""
        src="/logos/github-light.svg"
        width={20}
        height={20}
        className="size-4 shrink-0 dark:hidden"
        unoptimized
      />
      <Image
        aria-hidden="true"
        alt=""
        src="/logos/github-dark.svg"
        width={20}
        height={20}
        className="hidden size-4 shrink-0 dark:block"
        unoptimized
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm text-foreground">
          {GITHUB_REPO}
        </span>
      </span>
      <ArrowUpRightIcon className="size-4 shrink-0 text-muted-foreground" />
    </a>
  );
}
