// A sheet rests low over a map with its grabber showing. On hover it is
// flicked up and springs into the next detent, marked by a dashed guide.

export function BottomSheetsThumbnail() {
  return (
    <div className="relative h-20 w-28 overflow-hidden rounded-xl bg-muted ring-1 ring-border">
      <span className="absolute -left-2 top-5 h-1.5 w-32 rotate-12 rounded-full bg-card/80" />
      <span className="absolute top-0 left-10 h-24 w-1.5 rounded-full bg-card/80" />
      <span className="absolute top-4 left-14 size-2.5 rounded-full bg-muted-foreground/40 ring-2 ring-card" />
      <span className="absolute inset-x-0 top-6 border-t border-dashed border-sky-500/0 transition-colors duration-300 group-hover:border-sky-500/60" />
      <div className="absolute inset-x-1 top-14 h-20 rounded-t-lg bg-card shadow-sm ring-1 ring-border transition-transform duration-700 ease-spring group-hover:-translate-y-8">
        <span className="mx-auto mt-1 block h-1 w-5 rounded-full bg-muted-foreground/40" />
        <span className="mx-2 mt-1.5 block h-2 rounded-sm bg-muted" />
        <span className="mx-2 mt-2 block h-1 w-12 rounded-full bg-muted-foreground/30" />
        <span className="mx-2 mt-1.5 block h-1 w-16 rounded-full bg-muted-foreground/30" />
      </div>
    </div>
  );
}
