// A phone with its toolbar at the top, far from the thumb. On hover the bar
// drops to the bottom and a dashed arc marks the thumb's easy reach.

const GUIDE = "border-dashed border-sky-500/0 group-hover:border-sky-500/60";

export function ThumbReachThumbnail() {
  return (
    <div className="flex h-20 w-28 items-center justify-center">
      <div className="relative h-20 w-12 overflow-hidden rounded-[11px] bg-card ring-1 ring-border">
        <span
          className={`absolute -right-9 -bottom-9 size-[5.5rem] rounded-full border transition-colors duration-500 ${GUIDE}`}
        />
        <div className="absolute inset-x-1.5 top-4 flex flex-col gap-1.5">
          {[8, 6, 7, 5].map((w, i) => (
            <span key={i} className="h-1 rounded-full bg-muted-foreground/25" style={{ width: w * 4 }} />
          ))}
        </div>
        <div className="absolute inset-x-1 top-1 flex h-2.5 items-center justify-around rounded-full bg-muted ring-1 ring-border transition-transform duration-500 ease-snappy group-hover:translate-y-[3.875rem]">
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-1 rounded-full bg-foreground/60" />
          ))}
        </div>
      </div>
    </div>
  );
}
