// A picker wheel: on hover it steps one value and a tick ring marks the
// moment it lands.

export function HapticsThumbnail() {
  return (
    <div className="relative h-20 w-28 overflow-hidden rounded-xl bg-muted ring-1 ring-border">
      <div className="absolute inset-x-3 top-1/2 h-5 -translate-y-1/2 rounded-md bg-card ring-1 ring-border" />
      <div className="absolute inset-x-0 top-1/2 -mt-[30px] flex flex-col items-center text-[11px] leading-5 tabular-nums transition-transform duration-500 ease-snappy group-hover:-translate-y-5">
        {[8, 9, 10, 11, 12].map((n) => (
          <span key={n} className="text-foreground/70">
            {n}
          </span>
        ))}
      </div>
      <span className="absolute top-1/2 right-4 size-5 -translate-y-1/2 scale-50 rounded-full border-2 border-dashed border-sky-500/0 opacity-0 transition-[scale,opacity,border-color] delay-150 duration-300 ease-snappy group-hover:scale-110 group-hover:border-sky-500/60 group-hover:opacity-100" />
    </div>
  );
}
