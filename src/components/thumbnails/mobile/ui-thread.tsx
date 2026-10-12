// A frame-time strip: at rest some frames overshoot the dashed budget line;
// on hover every frame drops under it and the strip goes even.

const BARS = [10, 30, 12, 44, 11, 13, 38, 12, 10, 26];

export function UiThreadThumbnail() {
  return (
    <div className="relative flex h-20 w-28 items-end gap-1 rounded-xl bg-muted px-2 pb-2 ring-1 ring-border">
      <span className="absolute inset-x-1.5 bottom-[2.1rem] border-t border-dashed border-sky-500/0 group-hover:border-sky-500/60" />
      {BARS.map((h, i) => (
        <span
          key={i}
          className="h-(--h) flex-1 rounded-[2px] bg-muted-foreground/40 transition-[height] duration-500 ease-snappy group-hover:h-4"
          style={{ "--h": `${h}px`, transitionDelay: `${i * 25}ms` } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
