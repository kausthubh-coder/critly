// At rest, three screens that came out the same: one card shape, one bar,
// one button. On hover each takes a different direction (heavy condensed
// bars, a dot strip, ruled lines), and a dashed sky guide traces the one in
// the middle back to the noun it came from.

export function DirectionFirstThumbnail() {
  const screen =
    "relative h-16 w-9 overflow-hidden rounded-md bg-card p-1.5 ring-1 ring-border transition-[border-radius] duration-500 ease-snappy";
  const fade = "transition-opacity duration-500 ease-snappy";
  return (
    <div className="relative flex items-end gap-2 pt-3">
      <span className="absolute -top-1 left-1/2 h-2 w-8 -translate-x-1/2 rounded-full border border-dashed border-sky-500/0 transition-colors duration-500 group-hover:border-sky-500/60" />
      <span className="absolute top-1 left-1/2 h-2 -translate-x-1/2 border-l border-dashed border-sky-500/0 transition-colors duration-500 group-hover:border-sky-500/60" />

      {/* Heavy condensed */}
      <div className={`${screen} group-hover:rounded-none`}>
        <span className={`absolute inset-x-1.5 top-1.5 h-1 rounded-full bg-muted-foreground/40 ${fade} group-hover:opacity-0`} />
        <span className={`absolute inset-x-0 top-1.5 h-1 bg-foreground/80 opacity-0 ${fade} group-hover:opacity-100`} />
        <span className={`absolute top-4 left-1.5 h-5 w-1.5 bg-foreground/80 opacity-0 ${fade} group-hover:opacity-100`} />
        <span className={`absolute top-4 left-3.5 h-5 w-1.5 bg-foreground/80 opacity-0 ${fade} group-hover:opacity-100`} />
        <span className="absolute inset-x-1.5 bottom-1.5 h-2 rounded-sm bg-foreground/70 transition-[border-radius] duration-500 group-hover:rounded-none" />
      </div>

      {/* Dot strip */}
      <div className={`${screen} group-hover:rounded-sm`}>
        <span className={`absolute inset-x-1.5 top-1.5 h-1 rounded-full bg-muted-foreground/40 ${fade} group-hover:opacity-0`} />
        <span className={`absolute inset-x-1 top-3 flex flex-wrap gap-0.5 opacity-0 ${fade} group-hover:opacity-100`}>
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} className="size-1 rounded-full bg-foreground/70" />
          ))}
        </span>
        <span className="absolute inset-x-1.5 bottom-1.5 h-2 rounded-sm bg-foreground/70" />
      </div>

      {/* Ruled lines */}
      <div className={`${screen} group-hover:rounded-xl`}>
        <span className={`absolute inset-x-1.5 top-1.5 h-1 rounded-full bg-muted-foreground/40 ${fade} group-hover:opacity-0`} />
        {[3, 5, 7].map((top) => (
          <span
            key={top}
            className={`absolute inset-x-1.5 h-px bg-foreground/50 opacity-0 ${fade} group-hover:opacity-100`}
            style={{ top: top * 4 }}
          />
        ))}
        <span className="absolute inset-x-1.5 bottom-1.5 h-2 rounded-sm bg-foreground/70 transition-[border-radius] duration-500 group-hover:rounded-full" />
      </div>
    </div>
  );
}
