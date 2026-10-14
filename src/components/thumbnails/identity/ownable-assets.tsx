// At rest, four tiles that only differ by their name bar. On hover the names
// go (a logo-off test) and each tile shows the one shape it owns: a ring,
// tally marks, a flap, a gauge. A dashed sky outline marks where the name was.

export function OwnableAssetsThumbnail() {
  const fadeIn =
    "absolute opacity-0 transition-opacity duration-500 ease-snappy group-hover:opacity-100";
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="relative h-14 w-7 overflow-hidden rounded-md bg-card ring-1 ring-border"
        >
          <span className="absolute top-1.5 left-1 h-1.5 w-4 rounded-[2px] border border-dashed border-sky-500/0 transition-colors duration-500 group-hover:border-sky-500/60" />
          <span className="absolute top-1.5 left-1 h-1.5 w-4 rounded-full bg-foreground/60 transition-opacity duration-500 group-hover:opacity-0" />
          <span className="absolute inset-x-1 top-5 h-1 rounded-full bg-muted-foreground/30 transition-opacity duration-500 group-hover:opacity-0" />
          {i === 0 ? (
            <span className={`${fadeIn} top-5 left-1 size-5 rounded-full border-[3px] border-foreground/70`} />
          ) : null}
          {i === 1 ? (
            <span className={`${fadeIn} top-5 left-1 flex gap-0.5`}>
              {[0, 1, 2, 3].map((s) => (
                <span key={s} className="h-4 w-0.5 bg-foreground/70" />
              ))}
            </span>
          ) : null}
          {i === 2 ? (
            <span
              className={`${fadeIn} inset-x-0 top-0 h-5 bg-foreground/70`}
              style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
            />
          ) : null}
          {i === 3 ? (
            <span className={`${fadeIn} top-4 right-1 flex flex-col gap-1`}>
              {[0, 1, 2, 3].map((s) => (
                <span key={s} className={`h-px bg-foreground/60 ${s === 2 ? "w-3" : "w-1.5"}`} />
              ))}
            </span>
          ) : null}
          <span className="absolute inset-x-1 bottom-1.5 h-1.5 rounded-sm bg-foreground/70" />
        </div>
      ))}
    </div>
  );
}
