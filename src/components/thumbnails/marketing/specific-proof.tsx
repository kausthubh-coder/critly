// A quote card. At rest the quote is grey bars signed by nobody. On hover a
// figure (the "from → to" bar) and a name and role appear, and a sky marker
// sits on the number, the part a reader can check.

export function SpecificProofThumbnail() {
  return (
    <div className="flex w-32 flex-col gap-2 rounded-xl bg-card p-3 shadow-xs ring-1 ring-border">
      <div className="flex items-center gap-1">
        <div className="h-1.5 w-8 rounded-full bg-muted-foreground/30" />
        <div className="relative h-1.5 w-10 rounded-full bg-muted-foreground/30 transition-colors duration-500 ease-snappy group-hover:bg-foreground/80">
          <span className="absolute -inset-1 rounded-full border border-dashed border-sky-500/0 transition-[border-color] duration-500 group-hover:border-sky-500/60" />
        </div>
      </div>
      <div className="h-1.5 w-20 rounded-full bg-muted-foreground/30" />
      <div className="mt-1 flex items-center gap-1.5">
        <div className="size-4 shrink-0 rounded-full bg-muted-foreground/20 transition-colors duration-500 group-hover:bg-foreground/70" />
        <div className="flex flex-col gap-1">
          <div className="h-1 w-6 rounded-full bg-muted-foreground/30 transition-[width,background-color] duration-500 ease-snappy group-hover:w-12 group-hover:bg-foreground/70" />
          <div className="h-1 w-0 rounded-full bg-muted-foreground/40 transition-[width] delay-100 duration-500 ease-snappy group-hover:w-16" />
        </div>
      </div>
    </div>
  );
}
