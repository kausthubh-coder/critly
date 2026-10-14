// At rest, a leaf and a plain rounded button side by side, unrelated. On
// hover a dashed sky guide runs from the leaf to the button, and the button
// takes the leaf's shape: one corner tight, the opposite one round.

import { LeafIcon } from "@phosphor-icons/react/dist/ssr";

export function BorrowFromTheSubjectThumbnail() {
  return (
    <div className="relative flex items-center gap-5">
      <LeafIcon aria-hidden className="size-8 text-foreground/70" weight="fill" />
      <span className="absolute top-1/2 left-9 w-5 border-t border-dashed border-sky-500/0 transition-colors duration-500 group-hover:border-sky-500/60" />
      <span className="flex h-7 w-14 items-center justify-center rounded-md bg-foreground/80 transition-[border-radius] duration-700 ease-snappy group-hover:rounded-[2px_16px_2px_16px]">
        <span className="h-1 w-6 rounded-full bg-background/70" />
      </span>
    </div>
  );
}
