// A hero ending in three buttons of equal weight. On hover two of them drop to
// quiet outlines and the one that's left leads, marked by a sky guide.

export function CallsToActionThumbnail() {
  const quiet =
    "transition-[background-color,box-shadow] duration-500 ease-snappy group-hover:bg-transparent group-hover:shadow-[inset_0_0_0_1px_var(--border)]";
  return (
    <div className="flex w-32 flex-col gap-2 rounded-xl bg-card p-3 shadow-xs ring-1 ring-border">
      <div className="h-2 w-20 rounded-full bg-foreground/70" />
      <div className="h-1.5 w-14 rounded-full bg-muted-foreground/30" />
      <div className="mt-1.5 flex gap-1">
        <div className="relative h-3.5 w-9 rounded-full bg-foreground/80">
          <span className="absolute -inset-1 rounded-full border border-dashed border-sky-500/0 transition-[border-color] duration-500 group-hover:border-sky-500/60" />
        </div>
        <div className={`h-3.5 w-8 rounded-full bg-foreground/80 ${quiet}`} />
        <div className={`h-3.5 w-8 rounded-full bg-foreground/80 ${quiet}`} />
      </div>
    </div>
  );
}
