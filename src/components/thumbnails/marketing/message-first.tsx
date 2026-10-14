// A headline any product could print. On hover it gives way to one that
// names a thing you can picture, underlined by a dashed sky guide.

export function MessageFirstThumbnail() {
  return (
    <div className="relative flex h-20 w-28 flex-col justify-center gap-1.5 rounded-xl bg-card px-3 ring-1 ring-border">
      <span className="h-1 w-6 rounded-full bg-muted-foreground/30" />
      <span className="relative h-8">
        <span className="absolute inset-0 text-[11px] leading-[1.2] font-medium text-muted-foreground transition-opacity duration-500 group-hover:opacity-0">
          Work smarter, together
        </span>
        <span className="absolute inset-0 text-[11px] leading-[1.2] font-medium text-foreground opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          Berths booked by{" "}
          <span className="border-b border-dashed border-sky-500/60">
            boat length
          </span>
        </span>
      </span>
      <span className="h-1 w-14 rounded-full bg-muted-foreground/20" />
    </div>
  );
}
