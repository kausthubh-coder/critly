import Link from "next/link";

export function ConceptPager({
  prev,
  next,
}: {
  prev?: { title: string; slug: string };
  next?: { title: string; slug: string };
}) {
  return (
    <nav className="mt-16 flex items-center justify-between gap-4 border-t pt-4 text-xs">
      <span>
        {prev && (
          <Link
            href={`/${prev.slug}`}
            className="-mx-2 inline-flex min-h-8 items-center rounded-md px-2 text-muted-foreground hover:text-foreground max-sm:min-h-11"
          >
            ← <span className="ml-1">{prev.title}</span>
          </Link>
        )}
      </span>
      <span>
        {next && (
          <Link
            href={`/${next.slug}`}
            className="-mx-2 inline-flex min-h-8 items-center rounded-md px-2 text-muted-foreground hover:text-foreground max-sm:min-h-11"
          >
            <span className="mr-1">{next.title}</span> →
          </Link>
        )}
      </span>
    </nav>
  );
}
