import { MDXContent } from "@content-collections/mdx/react";
import type { MDXComponents } from "mdx/types";

import { CodeBlock } from "@/components/app/code-block";
import { Demo } from "@/components/app/demo";
import { ProseLink } from "@/components/app/prose-link";
import { LinkList } from "@/components/app/resources";
import {
  AlignmentDemo,
  AlignmentIconsDemo,
} from "@/components/demos/alignment";
import {
  ButtonPressDemo,
  PressAmountDemo,
  PressEverywhereDemo,
} from "@/components/demos/button-press";
import {
  ClipPathCompareDemo,
  ClipPathHoldDemo,
  ClipPathRevealDemo,
  ClipPathTabsDemo,
} from "@/components/demos/clip-path";
import {
  ColorRolesDemo,
  ColorTintDemo,
} from "@/components/demos/color-roles";
import {
  CommandMenuDemo,
  CommandSearchDemo,
  CommandShortcutsDemo,
} from "@/components/demos/command-menu";
import {
  CurveOvershootDemo,
  CurveSmoothingDemo,
} from "@/components/demos/curve-smoothing";
import {
  DarkElevationDemo,
  DarkModeDemo,
} from "@/components/demos/dark-mode";
import {
  DensityDemo,
  DensityPaddingDemo,
} from "@/components/demos/density";
import {
  DesignTokensDemo,
  TokenRolesDemo,
} from "@/components/demos/design-tokens";
import {
  ConfirmDialogDemo,
  DeleteUndoDemo,
} from "@/components/demos/destructive-actions";
import {
  EasingCurveDemo,
  EasingsDemo,
  StrongEasingDemo,
} from "@/components/demos/easings";
import {
  EmptySearchDemo,
  EmptyStatesDemo,
} from "@/components/demos/empty-states";
import { EffectCountDemo } from "@/components/demos/effect-cost";
import {
  ExitAnimationsDemo,
  ExitListDemo,
} from "@/components/demos/exit-animations";
import { FontRaceDemo } from "@/components/demos/font-loading";
import {
  FocusForcedColorsDemo,
  FocusObscuredDemo,
  FocusOffsetDemo,
  FocusRingsDemo,
} from "@/components/demos/focus-rings";
import {
  FontSmoothingDemo,
  FontSmoothingWeightsDemo,
} from "@/components/demos/font-smoothing";
import {
  HitAreasExpandDemo,
  HitAreasGapDemo,
  HitAreasToolbarDemo,
} from "@/components/demos/hit-areas";
import {
  HoverRestraintDemo,
  HoverTooltipDemo,
  KeyboardActionDemo,
} from "@/components/demos/hover-restraint";
import { HtmlBackgroundDemo } from "@/components/demos/html-background";
import {
  HamburgerMorphDemo,
  IconMorphDemo,
  IconMorphTuningDemo,
} from "@/components/demos/icon-morph";
import {
  IconMixDemo,
  IconTextSizeDemo,
  IconWeightsDemo,
} from "@/components/demos/icon-weights";
import {
  ImageOutlineAvatarDemo,
  ImageOutlineDemo,
  ImageOutlineStrengthDemo,
} from "@/components/demos/image-outline";
import {
  InputKeyboardDemo,
  InputValidationDemo,
} from "@/components/demos/input-details";
import {
  DisabledReasonDemo,
  HoverShiftDemo,
  InteractionStatesDemo,
} from "@/components/demos/interaction-states";
import {
  HoverSoundDemo,
  SoundCuesDemo,
  SoundLevelDemo,
} from "@/components/demos/interface-sfx";
import {
  InterruptibilityDemo,
  SpringVelocityDemo,
  ToastStackDemo,
} from "@/components/demos/interruptibility";
import {
  ArpeggioSpacingDemo,
  SoundLayersDemo,
  TextureLayersDemo,
} from "@/components/demos/layering-sounds";
import {
  HydrationGapDemo,
  LoadOnIntentDemo,
} from "@/components/demos/javascript-cost";
import { FontSwapDemo, LayoutShiftDemo } from "@/components/demos/layout-shift";
import { ReadySignalDemo, RepeatRunsDemo } from "@/components/demos/measuring";
import { ChatAnchorDemo, LongListDemo } from "@/components/demos/long-lists";
import {
  LetterSpacingDemo,
  UppercaseTrackingDemo,
} from "@/components/demos/letter-spacing";
import {
  LineHeightDemo,
  LineLengthDemo,
  LineReturnDemo,
} from "@/components/demos/line-length";
import {
  ImageArrivalDemo,
  PlaceholderDemo,
} from "@/components/demos/image-loading";
import {
  PrefetchDemo,
  SpinnerDelayDemo,
} from "@/components/demos/instant-navigation";
import {
  GlassLegibilityDemo,
  LiquidGlassDemo,
} from "@/components/demos/liquid-glass";
import {
  GooeyTabsDemo,
  MorphDemo,
  StretchDemo,
} from "@/components/demos/liquid-motion";
import {
  LivingBarsDemo,
  LivingChartsDemo,
} from "@/components/demos/living-charts";
import {
  ErrorMessagesDemo,
  MicrocopyDemo,
  PluralCountDemo,
} from "@/components/demos/microcopy";
import { ProjectionDemo, VelocityHandoffDemo } from "@/components/demos/momentum";
import {
  NestedRadiusDemo,
  NestedRadiusExamplesDemo,
  RadiusCalculatorDemo,
} from "@/components/demos/nested-radius";
import {
  NoiseBandingDemo,
  NoiseDemo,
  NoiseFrequencyDemo,
  NoiseSurfaceDemo,
} from "@/components/demos/noise";
import {
  AnimationCostDemo,
  NoveltyBudgetDemo,
} from "@/components/demos/novelty-budget";
import {
  OklchDemo,
  OklchGradientDemo,
  OklchPaletteDemo,
} from "@/components/demos/oklch";
import {
  HangingPunctuationDemo,
  OpticalAlignmentDemo,
  OpticalButtonDemo,
  OpticalSizingDemo,
  OpticalWeightDemo,
} from "@/components/demos/optical-alignment";
import {
  OverlayFocusDemo,
  OverlayScrollDemo,
} from "@/components/demos/overlays";
import {
  LoadingFlashDemo,
  OptimisticDemo,
  PerceivedPerformanceDemo,
  SpinnerSpeedDemo,
} from "@/components/demos/perceived-performance";
import {
  FeelMismatchDemo,
  ProductFeelDemo,
} from "@/components/demos/product-feel";
import {
  RealContentDemo,
  RealContentGridDemo,
} from "@/components/demos/real-content";
import { ReducedMotionDemo } from "@/components/demos/reduced-motion";
import {
  PaintFirstDemo,
  TypingLagDemo,
} from "@/components/demos/responsiveness";
import {
  DepthOfFieldDemo,
  RubberBandDemo,
} from "@/components/demos/references";
import {
  ContainerQueryDemo,
  FluidTypeDemo,
} from "@/components/demos/responsive";
import {
  ScaleEntrancesDemo,
  StartingScaleDemo,
  TransformOriginDemo,
} from "@/components/demos/scale-entrances";
import {
  ScrollFadesDemo,
  ScrollFadesEdgeDemo,
  ScrollFadesHorizontalDemo,
} from "@/components/demos/scroll-fades";
import {
  ShadowDarkModeDemo,
  ShadowElevationDemo,
  ShadowLayersDemo,
  ShadowsNotBordersDemo,
} from "@/components/demos/shadows-not-borders";
import {
  SharedLayoutDemo,
  SharedLayoutDetailDemo,
} from "@/components/demos/shared-layout";
import {
  MainThreadDemo,
  ShadowLiftDemo,
} from "@/components/demos/smooth-animation";
import {
  SpacingScaleDemo,
  SpacingStepsDemo,
} from "@/components/demos/spacing-scale";
import { SpringBounceDemo, SpringTunerDemo } from "@/components/demos/springs";
import {
  SquircleCompareDemo,
  SquircleCurvatureDemo,
  SquircleExamplesDemo,
} from "@/components/demos/squircles";
import {
  StaggerCapDemo,
  StaggerCompareDemo,
  StaggerDemo,
} from "@/components/demos/stagger";
import {
  TabularNumsDemo,
  TabularTableDemo,
  TabularTimerDemo,
} from "@/components/demos/tabular-nums";
import {
  PairJudgementDemo,
  SpotTheDifferenceDemo,
} from "@/components/demos/taste";
import { TextBalanceDemo, TextPrettyDemo } from "@/components/demos/text-wrapping";
import {
  StructureErasDemo,
  SurfaceErasDemo,
} from "@/components/demos/timelessness";
import { ToastStackingDemo, ToastsDemo } from "@/components/demos/toasts";
import {
  TypeScaleDemo,
  TypeScaleRatioDemo,
} from "@/components/demos/type-scale";
import {
  HierarchyActionsDemo,
  HierarchyLabelsDemo,
  VisualHierarchyDemo,
} from "@/components/demos/visual-hierarchy";
import { EmbedFacadeDemo, VideoRevealDemo } from "@/components/demos/video-embeds";
import {
  WhitespaceDemo,
  WhitespaceDividersDemo,
  WhitespaceSquintDemo,
} from "@/components/demos/whitespace";
import { cn } from "@/lib/utils";

const components: MDXComponents = {
  h2: ({ className, ...props }) => (
    <h2
      className={cn("mt-10 mb-4 text-base font-medium", className)}
      {...props}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3 className={cn("mt-8 mb-3 text-sm font-medium", className)} {...props} />
  ),
  p: ({ className, ...props }) => (
    <p
      className={cn(
        "my-4 text-sm leading-[1.8] text-pretty text-muted-foreground",
        className
      )}
      {...props}
    />
  ),
  a: ProseLink,
  ul: ({ className, ...props }) => (
    <ul
      className={cn(
        "my-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground",
        className
      )}
      {...props}
    />
  ),
  ol: ({ className, ...props }) => (
    <ol
      className={cn(
        "my-4 list-decimal space-y-2 pl-5 text-sm text-muted-foreground",
        className
      )}
      {...props}
    />
  ),
  strong: ({ className, ...props }) => (
    <strong
      className={cn("font-medium text-foreground", className)}
      {...props}
    />
  ),
  code: ({ className, ...props }) => (
    <code
      className={cn(
        "rounded-[3px] bg-primary/7 shadow-(--custom-shadow) px-1 py-0.5 font-mono text-[0.8em] text-foreground mx-0.75",
        className
      )}
      {...props}
    />
  ),
  pre: ({ className, ...props }) => (
    <pre
      className={cn(
        "my-6 rounded-xl shadow-(--custom-shadow) bg-card p-4 text-xs leading-relaxed overflow-x-auto whitespace-pre [&>code]:bg-transparent [&>code]:p-0 [&>code]:shadow-none",
        className
      )}
      {...props}
    />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn(
        "my-6 border-l-2 pl-4 text-sm text-muted-foreground italic",
        className
      )}
      {...props}
    />
  ),
  hr: ({ className, ...props }) => (
    <hr className={cn("my-10", className)} {...props} />
  ),
  Demo,
  AlignmentDemo,
  AlignmentIconsDemo,
  AnimationCostDemo,
  ArpeggioSpacingDemo,
  ButtonPressDemo,
  ClipPathCompareDemo,
  ClipPathHoldDemo,
  ClipPathRevealDemo,
  ClipPathTabsDemo,
  ColorRolesDemo,
  ColorTintDemo,
  CommandMenuDemo,
  CommandSearchDemo,
  CommandShortcutsDemo,
  ConfirmDialogDemo,
  ContainerQueryDemo,
  CurveOvershootDemo,
  CurveSmoothingDemo,
  DarkElevationDemo,
  DarkModeDemo,
  DeleteUndoDemo,
  DensityDemo,
  DensityPaddingDemo,
  DepthOfFieldDemo,
  DesignTokensDemo,
  DisabledReasonDemo,
  EasingCurveDemo,
  EasingsDemo,
  EmptySearchDemo,
  EmptyStatesDemo,
  ExitAnimationsDemo,
  ErrorMessagesDemo,
  ExitListDemo,
  FeelMismatchDemo,
  FluidTypeDemo,
  FocusForcedColorsDemo,
  FocusObscuredDemo,
  FocusOffsetDemo,
  FocusRingsDemo,
  FontSmoothingDemo,
  FontSmoothingWeightsDemo,
  FontSwapDemo,
  HamburgerMorphDemo,
  HangingPunctuationDemo,
  HierarchyActionsDemo,
  HierarchyLabelsDemo,
  HitAreasExpandDemo,
  HitAreasGapDemo,
  HitAreasToolbarDemo,
  HoverRestraintDemo,
  HoverShiftDemo,
  HoverSoundDemo,
  HoverTooltipDemo,
  HtmlBackgroundDemo,
  IconMixDemo,
  IconMorphDemo,
  IconMorphTuningDemo,
  IconTextSizeDemo,
  IconWeightsDemo,
  ImageOutlineAvatarDemo,
  ImageOutlineDemo,
  ImageOutlineStrengthDemo,
  InputKeyboardDemo,
  InputValidationDemo,
  InteractionStatesDemo,
  InterruptibilityDemo,
  KeyboardActionDemo,
  LayoutShiftDemo,
  LetterSpacingDemo,
  LineHeightDemo,
  LineLengthDemo,
  LineReturnDemo,
  LivingBarsDemo,
  LivingChartsDemo,
  LoadingFlashDemo,
  MicrocopyDemo,
  NestedRadiusDemo,
  NestedRadiusExamplesDemo,
  NoiseBandingDemo,
  NoiseDemo,
  NoiseFrequencyDemo,
  NoiseSurfaceDemo,
  NoveltyBudgetDemo,
  OklchDemo,
  OklchGradientDemo,
  OklchPaletteDemo,
  OpticalAlignmentDemo,
  OpticalButtonDemo,
  OpticalSizingDemo,
  OpticalWeightDemo,
  OptimisticDemo,
  OverlayFocusDemo,
  OverlayScrollDemo,
  PairJudgementDemo,
  PerceivedPerformanceDemo,
  PluralCountDemo,
  PressAmountDemo,
  PressEverywhereDemo,
  ProductFeelDemo,
  RadiusCalculatorDemo,
  RealContentDemo,
  RealContentGridDemo,
  ReducedMotionDemo,
  RubberBandDemo,
  ScaleEntrancesDemo,
  ScrollFadesDemo,
  ScrollFadesEdgeDemo,
  ScrollFadesHorizontalDemo,
  ShadowDarkModeDemo,
  ShadowElevationDemo,
  ShadowLayersDemo,
  ShadowsNotBordersDemo,
  SharedLayoutDemo,
  SharedLayoutDetailDemo,
  SoundCuesDemo,
  SoundLayersDemo,
  SoundLevelDemo,
  SpacingScaleDemo,
  SpacingStepsDemo,
  SpinnerSpeedDemo,
  SpotTheDifferenceDemo,
  SpringVelocityDemo,
  SquircleCompareDemo,
  SquircleCurvatureDemo,
  SquircleExamplesDemo,
  StaggerCapDemo,
  StaggerCompareDemo,
  StaggerDemo,
  StartingScaleDemo,
  StrongEasingDemo,
  StructureErasDemo,
  SurfaceErasDemo,
  TabularNumsDemo,
  TabularTableDemo,
  TabularTimerDemo,
  TextBalanceDemo,
  TextPrettyDemo,
  TextureLayersDemo,
  ToastStackDemo,
  TokenRolesDemo,
  ToastStackingDemo,
  ToastsDemo,
  TransformOriginDemo,
  TypeScaleDemo,
  TypeScaleRatioDemo,
  UppercaseTrackingDemo,
  VisualHierarchyDemo,
  WhitespaceDemo,
  WhitespaceDividersDemo,
  WhitespaceSquintDemo,
  GlassLegibilityDemo,
  GooeyTabsDemo,
  LiquidGlassDemo,
  MainThreadDemo,
  MorphDemo,
  ProjectionDemo,
  ShadowLiftDemo,
  SpringBounceDemo,
  SpringTunerDemo,
  StretchDemo,
  VelocityHandoffDemo,
  ImageArrivalDemo,
  PaintFirstDemo,
  PlaceholderDemo,
  PrefetchDemo,
  SpinnerDelayDemo,
  TypingLagDemo,
  ChatAnchorDemo,
  LongListDemo,
  EffectCountDemo,
  ReadySignalDemo,
  RepeatRunsDemo,
  HydrationGapDemo,
  LoadOnIntentDemo,
  FontRaceDemo,
  EmbedFacadeDemo,
  VideoRevealDemo,
  CodeBlock,
  LinkList,
};

export function Mdx({ code }: { code: string }) {
  return <MDXContent code={code} components={components} />;
}
