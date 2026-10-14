// At rest, four screens each wear a tiny wave in the corner: a signature
// nobody sees. On hover the corner marks go, and one curve fills the first
// screen at full size.

const SMALL_WAVE = "M0,3 C2,0 4,0 6,3 C8,6 10,6 12,3";
const BIG_WAVE = "M0,22 C10,4 22,4 32,16 C42,28 54,28 64,10";

export function SignatureMoveThumbnail() {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-xl bg-card p-1.5 ring-1 ring-border">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="relative h-8 w-12 overflow-hidden rounded-md bg-muted"
        >
          <svg
            aria-hidden
            className="absolute top-1 left-1 h-1.5 w-3 transition-opacity duration-300 group-hover:opacity-0"
            fill="none"
            viewBox="0 0 12 6"
          >
            <path
              d={SMALL_WAVE}
              className="stroke-muted-foreground/60"
              strokeWidth="1.25"
            />
          </svg>
          {i === 0 ? (
            <svg
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-7 w-full origin-bottom scale-y-0 transition-transform duration-500 ease-snappy group-hover:scale-y-100"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 64 28"
            >
              <path
                d={BIG_WAVE}
                className="stroke-sky-500"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          ) : (
            <div className="absolute bottom-1.5 left-1.5 h-1 w-6 rounded-full bg-muted-foreground/25" />
          )}
        </div>
      ))}
    </div>
  );
}
