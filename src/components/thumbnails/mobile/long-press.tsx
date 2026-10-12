// The held row shrinks while the finger stays down, then lifts as the
// background dims and a menu opens under it.

export function LongPressThumbnail() {
  return (
    <div className="relative h-20 w-28 overflow-hidden rounded-xl bg-muted ring-1 ring-border">
      <span className="absolute inset-0 bg-foreground/0 transition-colors delay-500 duration-200 group-hover:bg-foreground/10" />
      <div className="absolute inset-x-2 top-2 transition-[scale] duration-500 ease-out group-hover:scale-[0.96]">
        <div className="flex h-6 items-center rounded-md bg-card px-2 ring-1 ring-border transition-[scale,box-shadow] delay-500 duration-300 ease-spring group-hover:scale-[1.08] group-hover:shadow-md">
          <span className="h-1.5 w-12 rounded-full bg-muted-foreground/40" />
        </div>
      </div>
      <div className="absolute top-10 left-2 flex w-14 origin-top-left scale-75 flex-col gap-1 rounded-md bg-card p-1.5 opacity-0 ring-1 ring-border transition-[scale,opacity] delay-0 duration-150 group-hover:scale-100 group-hover:opacity-100 group-hover:delay-500 group-hover:duration-300 group-hover:ease-spring">
        <span className="h-1 w-8 rounded-full bg-muted-foreground/40" />
        <span className="h-1 w-6 rounded-full bg-muted-foreground/40" />
        <span className="h-1 w-7 rounded-full bg-muted-foreground/40" />
      </div>
    </div>
  );
}
