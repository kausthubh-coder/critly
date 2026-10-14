// A page minimap of equal sections. On hover the sections take sizes by
// weight: a tall hero and product shot, then shorter, varied rows. The
// leading section gets a dashed sky guide.

const EQUAL = [0, 1, 2, 3, 4];
const SIZED = [26, 18, 8, 10, 6];

export function SectionsFollowQuestionsThumbnail() {
  return (
    <div className="relative h-20 w-14 overflow-hidden rounded-lg bg-card p-1 ring-1 ring-border">
      <span className="absolute inset-1 flex flex-col gap-0.5 transition-opacity duration-500 group-hover:opacity-0">
        {EQUAL.map((i) => (
          <span key={i} className="grid flex-1 grid-cols-3 gap-0.5">
            {[0, 1, 2].map((card) => (
              <span key={card} className="rounded-[2px] bg-muted-foreground/20" />
            ))}
          </span>
        ))}
      </span>
      <span className="absolute inset-1 flex flex-col gap-0.5 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        {SIZED.map((weight, i) => (
          <span
            key={i}
            className={
              i === 0
                ? "rounded-[2px] border border-dashed border-sky-500/60 bg-muted"
                : i === 1
                  ? "rounded-[2px] bg-foreground/60"
                  : "rounded-[2px] bg-muted-foreground/25"
            }
            style={{ flex: `${weight} 1 0` }}
          />
        ))}
      </span>
    </div>
  );
}
