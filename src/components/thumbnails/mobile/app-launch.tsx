// A phone opening: at rest it sits on a logo; on hover the logo goes and the
// app's own bars and rows are there instead.

export function AppLaunchThumbnail() {
  return (
    <div className="relative h-20 w-12 overflow-hidden rounded-[10px] bg-card ring-1 ring-border">
      <span className="absolute top-1/2 left-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-md bg-foreground transition-[opacity,scale] duration-300 ease-snappy group-hover:scale-75 group-hover:opacity-0" />
      <div className="absolute inset-0 flex flex-col gap-1.5 px-1.5 pt-2.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <span className="h-1.5 w-5 rounded-full bg-muted-foreground/50" />
        {[0, 1, 2].map((i) => (
          <span key={i} className="flex items-center gap-1">
            <span className="size-2.5 shrink-0 rounded-[3px] bg-muted-foreground/25" />
            <span className="h-1 flex-1 rounded-full bg-muted-foreground/25" />
          </span>
        ))}
      </div>
      <span className="absolute inset-x-0 bottom-0 h-3 border-t border-border bg-muted/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
  );
}
