// A row swipes left to reveal Archive, and the ··· button that does the same
// thing stays visible and gets marked as the gesture's twin.

export function GesturesThumbnail() {
  return (
    <div className="relative h-20 w-28 overflow-hidden rounded-xl bg-muted ring-1 ring-border">
      <div className="absolute inset-x-0 top-1/2 h-8 -translate-y-1/2">
        <div className="absolute inset-y-0 right-0 flex w-10 items-center justify-center bg-muted-foreground/25">
          <span className="h-2 w-3 rounded-[2px] border border-muted-foreground/70" />
        </div>
        <div className="absolute inset-0 flex items-center gap-1.5 bg-card px-2 shadow-xs ring-1 ring-border transition-transform duration-500 ease-snappy group-hover:-translate-x-8">
          <span className="h-1.5 w-12 rounded-full bg-muted-foreground/40" />
          <span className="ml-auto flex h-4 w-5 items-center justify-center gap-px rounded-md border border-dashed border-sky-500/0 transition-colors delay-300 duration-300 group-hover:border-sky-500/70">
            {[0, 1, 2].map((dot) => (
              <span key={dot} className="size-[3px] rounded-full bg-muted-foreground/70" />
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}
