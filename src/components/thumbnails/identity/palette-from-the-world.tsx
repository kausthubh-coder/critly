// Two ramps on the same lightness steps. At rest both are gray. On hover the
// top one takes a hue, step by step, and the label on step 6 still reads:
// the hue changed, the steps didn't.

const STEPS = [
  { gray: "bg-neutral-100", hue: "group-hover:bg-sky-100" },
  { gray: "bg-neutral-200", hue: "group-hover:bg-sky-200" },
  { gray: "bg-neutral-300", hue: "group-hover:bg-sky-300" },
  { gray: "bg-neutral-400", hue: "group-hover:bg-sky-400" },
  { gray: "bg-neutral-500", hue: "group-hover:bg-sky-500" },
  { gray: "bg-neutral-700", hue: "group-hover:bg-sky-700" },
];

export function PaletteFromTheWorldThumbnail() {
  return (
    <div className="grid gap-1 rounded-xl bg-card p-2 ring-1 ring-border">
      <div className="flex gap-1">
        {STEPS.map((step, i) => (
          <span
            key={i}
            className={`grid h-6 w-4 place-items-center rounded-[4px] transition-colors duration-500 ease-snappy ${step.gray} ${step.hue}`}
            style={{ transitionDelay: `${i * 40}ms` }}
          >
            {i === 5 ? (
              <span className="text-[8px] font-semibold leading-none text-white">
                A
              </span>
            ) : null}
          </span>
        ))}
      </div>
      <div className="flex gap-1">
        {STEPS.map((step, i) => (
          <span key={i} className={`h-6 w-4 rounded-[4px] ${step.gray}`} />
        ))}
      </div>
    </div>
  );
}
