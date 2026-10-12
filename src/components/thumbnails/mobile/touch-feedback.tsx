// A finger lands on the middle row: the row lights up at once and a ripple
// spreads from the touch point.

export function TouchFeedbackThumbnail() {
  return (
    <div className="relative flex h-20 w-28 flex-col overflow-hidden rounded-xl bg-card ring-1 ring-border">
      {[0, 1, 2].map((row) => (
        <div
          key={row}
          className="relative flex h-1/3 items-center gap-1.5 overflow-hidden border-b border-border/70 px-2 last:border-b-0"
        >
          {row === 1 ? (
            <>
              <span className="absolute inset-0 bg-foreground/0 transition-colors duration-100 group-hover:bg-foreground/10" />
              <span className="absolute top-1/2 left-[62%] size-24 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-foreground/10 opacity-0 transition-[scale,opacity] duration-700 ease-snappy group-hover:scale-100 group-hover:opacity-100" />
            </>
          ) : null}
          <span className="relative size-3.5 shrink-0 rounded-full bg-muted-foreground/25" />
          <span className="relative h-1.5 w-12 rounded-full bg-muted-foreground/30" />
        </div>
      ))}
      <span className="absolute top-1/2 left-[62%] size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-sky-500/0 transition-colors duration-200 group-hover:border-sky-500/70" />
    </div>
  );
}
