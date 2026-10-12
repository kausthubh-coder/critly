// A row is swiped most of the way left. Past the dashed threshold the fill
// darkens and the action icon lets go of the edge and rides with the row.

export function SwipeActionsThumbnail() {
  return (
    <div className="relative flex h-20 w-28 flex-col justify-center gap-1 overflow-hidden rounded-xl bg-muted ring-1 ring-border">
      {[0, 1, 2].map((row) => (
        <div key={row} className="relative h-5 overflow-hidden">
          {row === 1 ? (
            <>
              <div className="absolute inset-0 bg-muted-foreground/25 transition-colors delay-200 duration-200 group-hover:bg-foreground/80" />
              <span className="absolute top-1/2 right-2 size-2 -translate-y-1/2 rounded-[2px] border border-card/80 transition-transform duration-700 ease-snappy group-hover:-translate-x-[3.9rem]" />
              <span className="absolute inset-y-0 left-1/2 border-l border-dashed border-sky-500/0 transition-colors duration-300 group-hover:border-sky-500/70" />
            </>
          ) : null}
          <div
            className={`absolute inset-0 flex items-center gap-1.5 bg-card px-2 ring-1 ring-border ${
              row === 1 ? "transition-transform duration-700 ease-snappy group-hover:-translate-x-[4.75rem]" : ""
            }`}
          >
            <span className="size-2 rounded-full bg-muted-foreground/30" />
            <span
              className="h-1.5 rounded-full bg-muted-foreground/40"
              style={{ width: [44, 36, 50][row] }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
