// A hero picture that is only a soft blob. On hover the blob fades and the
// product's own screen takes its place, outlined by a dashed sky guide.

export function ShowTheProductThumbnail() {
  return (
    <div className="relative h-20 w-28 overflow-hidden rounded-xl bg-card ring-1 ring-border">
      <span className="absolute top-2.5 left-2.5 h-1.5 w-12 rounded-full bg-foreground/60" />
      <span className="absolute inset-x-2.5 top-6 bottom-2.5 flex items-center justify-center transition-opacity duration-500 group-hover:opacity-0">
        <span className="size-10 rounded-full bg-muted-foreground/20 blur-md" />
        <span className="absolute size-6 translate-x-3 rounded-lg bg-muted-foreground/15 blur-sm" />
      </span>
      <span className="absolute inset-x-2.5 top-6 bottom-2.5 grid grid-cols-5 gap-0.5 rounded-md border border-dashed border-sky-500/0 p-1 opacity-0 transition-[opacity,border-color] duration-500 group-hover:border-sky-500/60 group-hover:opacity-100">
        {Array.from({ length: 15 }, (_, i) => (
          <span
            key={i}
            className={
              i % 4 === 1
                ? "rounded-[2px] bg-foreground/70"
                : i % 3 === 0
                  ? "rounded-[2px] bg-muted-foreground/30"
                  : "rounded-[2px] bg-muted"
            }
          />
        ))}
      </span>
    </div>
  );
}
