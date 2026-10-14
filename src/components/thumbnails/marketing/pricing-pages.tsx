// Plan columns. At rest five cramped plans with no period after the price.
// On hover two fall away, the rest settle into three, the middle one gets a
// sky marker as the one recommendation, and each price gains its period.

function Plan({ marked = false }: { marked?: boolean }) {
  return (
    <div className="relative flex w-5 flex-col items-start gap-1 rounded-md bg-card p-1 ring-1 ring-border transition-[width] duration-500 ease-snappy group-hover:w-7">
      {marked ? (
        <span className="absolute -inset-1 rounded-lg border border-dashed border-sky-500/0 transition-[border-color] duration-500 group-hover:border-sky-500/60" />
      ) : null}
      <div className="flex items-end gap-0.5">
        <div className="h-2 w-2 rounded-xs bg-foreground/70" />
        <div className="h-1 w-0 rounded-full bg-muted-foreground/50 transition-[width] delay-150 duration-500 ease-snappy group-hover:w-2" />
      </div>
      <div className="h-1 w-3 rounded-full bg-muted-foreground/25" />
      <div className="h-1 w-3 rounded-full bg-muted-foreground/25" />
      <div className="h-1 w-2 rounded-full bg-muted-foreground/25" />
    </div>
  );
}

export function PricingPagesThumbnail() {
  const extra =
    "transition-[opacity,width,margin] duration-500 ease-snappy group-hover:-mx-0.5 group-hover:w-0 group-hover:opacity-0";
  return (
    <div className="flex items-start gap-1">
      <div className={extra}>
        <Plan />
      </div>
      <Plan />
      <Plan marked />
      <Plan />
      <div className={extra}>
        <Plan />
      </div>
    </div>
  );
}
