// A pushed screen covers the list. On hover a swipe from the dashed left
// edge drags it most of the way off, and the list slides in underneath at
// a slower pace.

export function BackNavigationThumbnail() {
  return (
    <div className="relative h-20 w-28 overflow-hidden rounded-xl bg-muted ring-1 ring-border">
      <div className="absolute inset-0 flex -translate-x-8 flex-col gap-1.5 p-2 transition-transform duration-700 ease-snappy group-hover:-translate-x-3">
        <span className="h-1.5 w-8 rounded-full bg-muted-foreground/50" />
        {[14, 11, 13, 10].map((width, i) => (
          <span key={i} className="h-1.5 rounded-full bg-muted-foreground/25" style={{ width: width * 4 }} />
        ))}
      </div>
      <div className="absolute inset-0 flex flex-col gap-1.5 bg-card p-2 ring-1 ring-border transition-[translate,box-shadow] duration-700 ease-snappy group-hover:translate-x-16 group-hover:shadow-lg">
        <span className="flex items-center gap-0.5">
          <span className="size-1.5 rotate-45 border-b border-l border-muted-foreground/70" />
          <span className="h-1 w-5 rounded-full bg-muted-foreground/40" />
        </span>
        <span className="mt-1 h-2 w-12 rounded-full bg-muted-foreground/45" />
        <span className="h-1 w-20 rounded-full bg-muted-foreground/25" />
        <span className="h-1 w-16 rounded-full bg-muted-foreground/25" />
      </div>
      <span className="absolute inset-y-1 left-1.5 border-l border-dashed border-sky-500/0 transition-colors duration-300 group-hover:border-sky-500/60" />
    </div>
  );
}
