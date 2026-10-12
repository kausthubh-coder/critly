// A chat screen: on hover the keyboard rises and the composer rides on top
// of it, with the same timing.

const LIFT = "transition-transform duration-500 ease-snappy group-hover:-translate-y-9";

export function SoftKeyboardThumbnail() {
  return (
    <div className="relative h-20 w-28 overflow-hidden rounded-xl bg-card ring-1 ring-border">
      <div className={`absolute inset-x-2 bottom-6 flex flex-col gap-1 ${LIFT}`}>
        <span className="h-2 w-12 rounded-full bg-muted-foreground/25" />
        <span className="h-2 w-10 self-end rounded-full bg-muted-foreground/45" />
      </div>
      <div className={`absolute inset-x-2 bottom-2 flex items-center gap-1 ${LIFT}`}>
        <span className="h-2.5 flex-1 rounded-full ring-1 ring-border" />
        <span className="size-2.5 rounded-full bg-muted-foreground/45" />
      </div>
      <div className="absolute inset-x-0 bottom-0 grid h-9 translate-y-full grid-cols-6 gap-0.5 border-t border-dashed border-sky-500/0 bg-muted p-1 transition-transform duration-500 ease-snappy group-hover:translate-y-0 group-hover:border-sky-500/60">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} className="rounded-[2px] bg-card" />
        ))}
      </div>
    </div>
  );
}
