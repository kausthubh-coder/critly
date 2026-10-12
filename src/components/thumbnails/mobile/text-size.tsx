// Two settings rows: on hover the text grows and each value drops under its
// label instead of colliding with it.

function Row({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-x-3 h-2 transition-transform duration-500 ease-snappy ${className}`}>
      <span className="absolute top-0 left-0 h-1.5 w-7 origin-left rounded-full bg-foreground/50 transition-transform duration-500 ease-snappy group-hover:scale-150" />
      <span className="absolute top-0 right-0 h-1.5 w-9 origin-left rounded-full bg-muted-foreground/30 transition-transform duration-500 ease-snappy group-hover:translate-x-[-52px] group-hover:translate-y-3.5 group-hover:scale-150" />
    </div>
  );
}

export function TextSizeThumbnail() {
  return (
    <div className="relative h-20 w-28 overflow-hidden rounded-xl bg-card ring-1 ring-border">
      <Row className="top-3" />
      <div className="absolute inset-x-3 top-[26px] h-px bg-border transition-transform duration-500 ease-snappy group-hover:translate-y-4" />
      <Row className="top-[34px] group-hover:translate-y-4" />
      <span className="absolute inset-x-3 top-[52px] h-px border-t border-dashed border-sky-500/0 transition-[translate,border-color] duration-500 ease-snappy group-hover:translate-y-5 group-hover:border-sky-500/60" />
    </div>
  );
}
