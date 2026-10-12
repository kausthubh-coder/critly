// A boxed app at rest: its background stops short of the island and the
// home indicator. On hover the background runs to the edges while the
// content stays inside dashed safe-area lines.

const GUIDE = "border-dashed border-sky-500/0 group-hover:border-sky-500/60";

export function SafeAreasThumbnail() {
  return (
    <div className="flex h-20 w-28 items-center justify-center">
      <div className="relative h-20 w-12 overflow-hidden rounded-[11px] bg-card ring-1 ring-border">
        <div className="absolute inset-x-0 top-3.5 bottom-2.5 bg-muted-foreground/20 transition-[top,bottom] duration-500 ease-snappy group-hover:top-0 group-hover:bottom-0" />
        <span className={`absolute inset-x-0 top-3.5 border-t transition-colors duration-500 ${GUIDE}`} />
        <span className={`absolute inset-x-0 bottom-2.5 border-b transition-colors duration-500 ${GUIDE}`} />
        <div className="absolute inset-x-1.5 top-5 flex flex-col gap-1.5">
          <span className="h-1.5 w-6 rounded-full bg-foreground/60" />
          {[8, 6, 7].map((w, i) => (
            <span key={i} className="h-1 rounded-full bg-muted-foreground/40" style={{ width: w * 4 }} />
          ))}
        </div>
        <span className="absolute inset-x-1.5 bottom-3.5 h-2 rounded-full bg-foreground/70" />
        <span className="absolute top-1 left-1/2 h-1.5 w-4 -translate-x-1/2 rounded-full bg-foreground" />
        <span className="absolute bottom-1 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-foreground/60" />
      </div>
    </div>
  );
}
