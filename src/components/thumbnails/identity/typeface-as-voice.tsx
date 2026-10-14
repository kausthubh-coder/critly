// Three faces wait side by side at the same size, so none of them speaks. On
// hover one is chosen: it grows and takes the dashed guide, and the other two
// step back.

const FACES = [
  { family: "[font-family:var(--font-jetbrains-mono)]", chosen: false },
  { family: "[font-family:Georgia,serif]", chosen: true },
  { family: "font-sans", chosen: false },
];

export function TypefaceAsVoiceThumbnail() {
  return (
    <div className="flex items-end gap-2">
      {FACES.map((face, i) => (
        <span
          key={i}
          className={`grid size-9 place-items-center rounded-lg border border-transparent bg-card text-lg leading-none text-foreground ring-1 ring-border transition-[scale,opacity,border-color] duration-500 ease-snappy ${face.family} ${
            face.chosen
              ? "group-hover:scale-125 group-hover:border-dashed group-hover:border-sky-500/60 group-hover:ring-transparent"
              : "group-hover:opacity-40"
          }`}
        >
          Ag
        </span>
      ))}
    </div>
  );
}
