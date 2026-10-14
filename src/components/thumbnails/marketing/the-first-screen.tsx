// A window filled edge to edge by a soft hero: a false floor. On hover the
// hero gives way to a headline and the product, and the next section peeks
// in above a dashed sky fold line.

export function FirstScreenThumbnail() {
  return (
    <div className="relative h-20 w-28 overflow-hidden rounded-xl bg-card ring-1 ring-border">
      <span className="absolute inset-x-0 top-0 flex h-2.5 items-center gap-0.5 border-b border-border px-1.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-1 rounded-full bg-muted-foreground/30" />
        ))}
      </span>
      <span className="absolute inset-x-0 top-2.5 bottom-0 flex items-center justify-center transition-opacity duration-500 group-hover:opacity-0">
        <span className="size-14 rounded-full bg-muted-foreground/15 blur-md" />
        <span className="absolute h-1 w-12 rounded-full bg-muted-foreground/30" />
      </span>
      <span className="absolute inset-x-2 top-4.5 flex gap-1.5 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <span className="flex flex-1 flex-col gap-1">
          <span className="h-1.5 w-full rounded-full bg-foreground/70" />
          <span className="h-1.5 w-3/4 rounded-full bg-foreground/70" />
          <span className="h-1 w-full rounded-full bg-muted-foreground/30" />
          <span className="mt-0.5 h-2 w-6 rounded-full bg-foreground/80" />
        </span>
        <span className="h-10 w-10 rounded-md bg-muted ring-1 ring-border" />
      </span>
      <span className="absolute inset-x-0 bottom-0 h-3.5 translate-y-full border-t border-dashed border-sky-500/0 bg-muted transition-[translate,border-color] duration-500 ease-snappy group-hover:translate-y-0 group-hover:border-sky-500/60" />
    </div>
  );
}
