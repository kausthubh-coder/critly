// Recycling: on hover the list scrolls up one row, and the row that leaves
// the top is the same cell, moved to the bottom (dashed) to show the next item.

const ROWS = [0, 1, 2, 3];

export function NativeListsThumbnail() {
  return (
    <div className="relative h-20 w-28 overflow-hidden rounded-xl bg-card ring-1 ring-border">
      {ROWS.map((i) => (
        <div
          key={i}
          className={`absolute inset-x-2 flex h-3.5 items-center gap-1.5 rounded-md border px-1 transition-transform duration-500 ease-snappy ${
            i === 0
              ? "border-dashed border-sky-500/0 group-hover:translate-y-[3.375rem] group-hover:border-sky-500/60"
              : "border-transparent group-hover:-translate-y-[1.125rem]"
          }`}
          style={{ top: 8 + i * 18 }}
        >
          <span className="size-2 shrink-0 rounded-full bg-muted-foreground/40" />
          <span className="h-1 flex-1 rounded-full bg-muted-foreground/25" />
        </div>
      ))}
    </div>
  );
}
