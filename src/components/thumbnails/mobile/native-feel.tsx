import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";

// At rest, an iPhone settings screen: back chevron, large title, a grouped
// inset card. On hover the same screen redraws the Android way: an arrow
// and title in one bar, flat rows, M3 switches, and a ripple from the touch.

function IosSwitch({ on }: { on: boolean }) {
  return (
    <span className={`relative h-2.5 w-4 rounded-full ${on ? "bg-foreground/70" : "bg-muted-foreground/25"}`}>
      <span className={`absolute top-[1px] size-2 rounded-full bg-card shadow-xs ${on ? "right-[1px]" : "left-[1px]"}`} />
    </span>
  );
}

function M3Switch({ on }: { on: boolean }) {
  return (
    <span
      className={`relative h-2.5 w-4 rounded-full ${on ? "bg-foreground/70" : "border border-muted-foreground/50"}`}
    >
      <span
        className={`absolute rounded-full ${
          on ? "top-[1px] right-[1px] size-2 bg-card" : "top-[2px] left-[2px] size-1 bg-muted-foreground/60"
        }`}
      />
    </span>
  );
}

export function NativeFeelThumbnail() {
  return (
    <div className="relative h-20 w-28 overflow-hidden rounded-xl bg-card ring-1 ring-border">
      <div className="absolute inset-0 bg-muted px-2 pt-2 transition-opacity duration-300 group-hover:opacity-0">
        <span className="ml-0.5 block size-1.5 rotate-45 border-b-[1.5px] border-l-[1.5px] border-foreground/60" />
        <span className="mt-1.5 block h-2 w-12 rounded-full bg-foreground/70" />
        <div className="mt-2 rounded-md bg-card ring-1 ring-border">
          {[true, false].map((on, i) => (
            <div
              key={i}
              className={`flex h-[18px] items-center justify-between px-1.5 ${i ? "" : "border-b border-border"}`}
            >
              <span className="h-1 w-8 rounded-full bg-muted-foreground/35" />
              <IosSwitch on={on} />
            </div>
          ))}
        </div>
      </div>

      <div className="absolute inset-0 bg-card px-1.5 pt-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="flex items-center gap-1.5">
          <ArrowLeftIcon aria-hidden className="size-3 text-foreground/70" weight="bold" />
          <span className="h-1.5 w-10 rounded-full bg-foreground/60" />
        </div>
        <span className="mt-2.5 ml-1 block h-1 w-5 rounded-full bg-foreground/35" />
        {[true, false].map((on, i) => (
          <div key={i} className="relative flex h-[19px] items-center justify-between overflow-hidden px-1">
            <span className="h-1 w-10 rounded-full bg-muted-foreground/35" />
            <M3Switch on={on} />
            {i === 0 ? (
              <span className="absolute top-1/2 left-8 size-28 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-foreground/10 transition-transform delay-200 duration-700 ease-snappy group-hover:scale-100" />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
