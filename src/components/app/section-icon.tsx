import type { IconProps } from "@phosphor-icons/react";
import {
  BezierCurveIcon,
  ChatTextIcon,
  ChartBarHorizontalIcon,
  CirclesThreeIcon,
  CursorClickIcon,
  LayoutIcon,
  LightningIcon,
  PenNibIcon,
  SpeakerHighIcon,
  TextAaIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Section } from "@/lib/sections";
import { cn } from "@/lib/utils";

const icons = {
  Typography: TextAaIcon,
  Color: CirclesThreeIcon,
  Layout: LayoutIcon,
  Interaction: CursorClickIcon,
  Content: ChatTextIcon,
  Motion: BezierCurveIcon,
  Performance: LightningIcon,
  Sound: SpeakerHighIcon,
  Data: ChartBarHorizontalIcon,
  Craft: PenNibIcon,
} as const;

// Muted enough to sit in a grayscale UI; the duotone fill layer
// (currentColor at reduced opacity) softens them further.
export const sectionTextColor: Record<Section, string> = {
  Typography: "text-blue-600 dark:text-blue-400",
  Color: "text-rose-600 dark:text-rose-400",
  Layout: "text-amber-600 dark:text-amber-400",
  Interaction: "text-lime-600 dark:text-lime-400",
  Content: "text-teal-600 dark:text-teal-400",
  Motion: "text-violet-600 dark:text-violet-400",
  Performance: "text-fuchsia-600 dark:text-fuchsia-400",
  Sound: "text-emerald-600 dark:text-emerald-400",
  Data: "text-cyan-600 dark:text-cyan-400",
  Craft: "text-orange-600 dark:text-orange-400",
};

export type DotColor = Section | "foreground";

// The nav's active dot reads its colour from CSS custom properties so it can
// crossfade from the previous section to the next one in CSS (Motion can't
// interpolate Tailwind's oklch palette). Two maps, since a single element
// carries both ends of the crossfade. Same hues as the icons above.
export const dotColorFrom: Record<DotColor, string> = {
  foreground: "[--dot-from:var(--foreground)]",
  Typography:
    "[--dot-from:var(--color-blue-500)] dark:[--dot-from:var(--color-blue-400)]",
  Color:
    "[--dot-from:var(--color-rose-500)] dark:[--dot-from:var(--color-rose-400)]",
  Layout:
    "[--dot-from:var(--color-amber-500)] dark:[--dot-from:var(--color-amber-400)]",
  Interaction:
    "[--dot-from:var(--color-lime-500)] dark:[--dot-from:var(--color-lime-400)]",
  Content:
    "[--dot-from:var(--color-teal-500)] dark:[--dot-from:var(--color-teal-400)]",
  Motion:
    "[--dot-from:var(--color-violet-500)] dark:[--dot-from:var(--color-violet-400)]",
  Performance:
    "[--dot-from:var(--color-fuchsia-500)] dark:[--dot-from:var(--color-fuchsia-400)]",
  Sound:
    "[--dot-from:var(--color-emerald-500)] dark:[--dot-from:var(--color-emerald-400)]",
  Data: "[--dot-from:var(--color-cyan-500)] dark:[--dot-from:var(--color-cyan-400)]",
  Craft:
    "[--dot-from:var(--color-orange-500)] dark:[--dot-from:var(--color-orange-400)]",
};

export const dotColorTo: Record<DotColor, string> = {
  foreground: "[--dot-to:var(--foreground)]",
  Typography:
    "[--dot-to:var(--color-blue-500)] dark:[--dot-to:var(--color-blue-400)]",
  Color:
    "[--dot-to:var(--color-rose-500)] dark:[--dot-to:var(--color-rose-400)]",
  Layout:
    "[--dot-to:var(--color-amber-500)] dark:[--dot-to:var(--color-amber-400)]",
  Interaction:
    "[--dot-to:var(--color-lime-500)] dark:[--dot-to:var(--color-lime-400)]",
  Content:
    "[--dot-to:var(--color-teal-500)] dark:[--dot-to:var(--color-teal-400)]",
  Motion:
    "[--dot-to:var(--color-violet-500)] dark:[--dot-to:var(--color-violet-400)]",
  Performance:
    "[--dot-to:var(--color-fuchsia-500)] dark:[--dot-to:var(--color-fuchsia-400)]",
  Sound:
    "[--dot-to:var(--color-emerald-500)] dark:[--dot-to:var(--color-emerald-400)]",
  Data: "[--dot-to:var(--color-cyan-500)] dark:[--dot-to:var(--color-cyan-400)]",
  Craft:
    "[--dot-to:var(--color-orange-500)] dark:[--dot-to:var(--color-orange-400)]",
};

export function SectionIcon({
  section,
  className,
  ...props
}: { section: Section; className?: string } & IconProps) {
  const Icon = icons[section];
  return (
    <Icon
      weight="duotone"
      className={cn(sectionTextColor[section], className)}
      {...props}
    />
  );
}
