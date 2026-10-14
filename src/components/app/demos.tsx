"use client";

// Each demo loads as its own chunk, so a concept page only downloads the demos
// it renders. They still render on the server; only the client bundle splits.
// mdx.tsx is a Server Component, where next/dynamic doesn't split code, so the
// lazy wrappers live here in a Client Component.

import dynamic from "next/dynamic";

export const AlignmentDemo = dynamic(() =>
  import("@/components/demos/alignment").then((m) => m.AlignmentDemo)
);
export const AlignmentIconsDemo = dynamic(() =>
  import("@/components/demos/alignment").then((m) => m.AlignmentIconsDemo)
);
export const ButtonPressDemo = dynamic(() =>
  import("@/components/demos/button-press").then((m) => m.ButtonPressDemo)
);
export const PressAmountDemo = dynamic(() =>
  import("@/components/demos/button-press").then((m) => m.PressAmountDemo)
);
export const PressEverywhereDemo = dynamic(() =>
  import("@/components/demos/button-press").then((m) => m.PressEverywhereDemo)
);
export const ClipPathCompareDemo = dynamic(() =>
  import("@/components/demos/clip-path").then((m) => m.ClipPathCompareDemo)
);
export const ClipPathHoldDemo = dynamic(() =>
  import("@/components/demos/clip-path").then((m) => m.ClipPathHoldDemo)
);
export const ClipPathRevealDemo = dynamic(() =>
  import("@/components/demos/clip-path").then((m) => m.ClipPathRevealDemo)
);
export const ClipPathTabsDemo = dynamic(() =>
  import("@/components/demos/clip-path").then((m) => m.ClipPathTabsDemo)
);
export const ColorRolesDemo = dynamic(() =>
  import("@/components/demos/color-roles").then((m) => m.ColorRolesDemo)
);
export const ColorTintDemo = dynamic(() =>
  import("@/components/demos/color-roles").then((m) => m.ColorTintDemo)
);
export const CommandMenuDemo = dynamic(() =>
  import("@/components/demos/command-menu").then((m) => m.CommandMenuDemo)
);
export const CommandSearchDemo = dynamic(() =>
  import("@/components/demos/command-menu").then((m) => m.CommandSearchDemo)
);
export const CommandShortcutsDemo = dynamic(() =>
  import("@/components/demos/command-menu").then((m) => m.CommandShortcutsDemo)
);
export const CurveOvershootDemo = dynamic(() =>
  import("@/components/demos/curve-smoothing").then((m) => m.CurveOvershootDemo)
);
export const CurveSmoothingDemo = dynamic(() =>
  import("@/components/demos/curve-smoothing").then((m) => m.CurveSmoothingDemo)
);
export const DarkElevationDemo = dynamic(() =>
  import("@/components/demos/dark-mode").then((m) => m.DarkElevationDemo)
);
export const DarkModeDemo = dynamic(() =>
  import("@/components/demos/dark-mode").then((m) => m.DarkModeDemo)
);
export const DensityDemo = dynamic(() =>
  import("@/components/demos/density").then((m) => m.DensityDemo)
);
export const DensityPaddingDemo = dynamic(() =>
  import("@/components/demos/density").then((m) => m.DensityPaddingDemo)
);
export const DesignTokensDemo = dynamic(() =>
  import("@/components/demos/design-tokens").then((m) => m.DesignTokensDemo)
);
export const TokenRolesDemo = dynamic(() =>
  import("@/components/demos/design-tokens").then((m) => m.TokenRolesDemo)
);
export const ConfirmDialogDemo = dynamic(() =>
  import("@/components/demos/destructive-actions").then((m) => m.ConfirmDialogDemo)
);
export const DeleteUndoDemo = dynamic(() =>
  import("@/components/demos/destructive-actions").then((m) => m.DeleteUndoDemo)
);
export const EasingCurveDemo = dynamic(() =>
  import("@/components/demos/easings").then((m) => m.EasingCurveDemo)
);
export const EasingsDemo = dynamic(() =>
  import("@/components/demos/easings").then((m) => m.EasingsDemo)
);
export const StrongEasingDemo = dynamic(() =>
  import("@/components/demos/easings").then((m) => m.StrongEasingDemo)
);
export const EmptySearchDemo = dynamic(() =>
  import("@/components/demos/empty-states").then((m) => m.EmptySearchDemo)
);
export const EmptyStatesDemo = dynamic(() =>
  import("@/components/demos/empty-states").then((m) => m.EmptyStatesDemo)
);
export const EffectCountDemo = dynamic(() =>
  import("@/components/demos/effect-cost").then((m) => m.EffectCountDemo)
);
export const ExitAnimationsDemo = dynamic(() =>
  import("@/components/demos/exit-animations").then((m) => m.ExitAnimationsDemo)
);
export const ExitListDemo = dynamic(() =>
  import("@/components/demos/exit-animations").then((m) => m.ExitListDemo)
);
export const FontRaceDemo = dynamic(() =>
  import("@/components/demos/font-loading").then((m) => m.FontRaceDemo)
);
export const FocusForcedColorsDemo = dynamic(() =>
  import("@/components/demos/focus-rings").then((m) => m.FocusForcedColorsDemo)
);
export const FocusObscuredDemo = dynamic(() =>
  import("@/components/demos/focus-rings").then((m) => m.FocusObscuredDemo)
);
export const FocusOffsetDemo = dynamic(() =>
  import("@/components/demos/focus-rings").then((m) => m.FocusOffsetDemo)
);
export const FocusRingsDemo = dynamic(() =>
  import("@/components/demos/focus-rings").then((m) => m.FocusRingsDemo)
);
export const FontSmoothingDemo = dynamic(() =>
  import("@/components/demos/font-smoothing").then((m) => m.FontSmoothingDemo)
);
export const FontSmoothingWeightsDemo = dynamic(() =>
  import("@/components/demos/font-smoothing").then((m) => m.FontSmoothingWeightsDemo)
);
export const HitAreasExpandDemo = dynamic(() =>
  import("@/components/demos/hit-areas").then((m) => m.HitAreasExpandDemo)
);
export const HitAreasGapDemo = dynamic(() =>
  import("@/components/demos/hit-areas").then((m) => m.HitAreasGapDemo)
);
export const HitAreasToolbarDemo = dynamic(() =>
  import("@/components/demos/hit-areas").then((m) => m.HitAreasToolbarDemo)
);
export const HoverRestraintDemo = dynamic(() =>
  import("@/components/demos/hover-restraint").then((m) => m.HoverRestraintDemo)
);
export const HoverTooltipDemo = dynamic(() =>
  import("@/components/demos/hover-restraint").then((m) => m.HoverTooltipDemo)
);
export const KeyboardActionDemo = dynamic(() =>
  import("@/components/demos/hover-restraint").then((m) => m.KeyboardActionDemo)
);
export const HtmlBackgroundDemo = dynamic(() =>
  import("@/components/demos/html-background").then((m) => m.HtmlBackgroundDemo)
);
export const HamburgerMorphDemo = dynamic(() =>
  import("@/components/demos/icon-morph").then((m) => m.HamburgerMorphDemo)
);
export const IconMorphDemo = dynamic(() =>
  import("@/components/demos/icon-morph").then((m) => m.IconMorphDemo)
);
export const IconMorphTuningDemo = dynamic(() =>
  import("@/components/demos/icon-morph").then((m) => m.IconMorphTuningDemo)
);
export const IconMixDemo = dynamic(() =>
  import("@/components/demos/icon-weights").then((m) => m.IconMixDemo)
);
export const IconTextSizeDemo = dynamic(() =>
  import("@/components/demos/icon-weights").then((m) => m.IconTextSizeDemo)
);
export const IconWeightsDemo = dynamic(() =>
  import("@/components/demos/icon-weights").then((m) => m.IconWeightsDemo)
);
export const ImageOutlineAvatarDemo = dynamic(() =>
  import("@/components/demos/image-outline").then((m) => m.ImageOutlineAvatarDemo)
);
export const ImageOutlineDemo = dynamic(() =>
  import("@/components/demos/image-outline").then((m) => m.ImageOutlineDemo)
);
export const ImageOutlineStrengthDemo = dynamic(() =>
  import("@/components/demos/image-outline").then((m) => m.ImageOutlineStrengthDemo)
);
export const InputKeyboardDemo = dynamic(() =>
  import("@/components/demos/input-details").then((m) => m.InputKeyboardDemo)
);
export const InputValidationDemo = dynamic(() =>
  import("@/components/demos/input-details").then((m) => m.InputValidationDemo)
);
export const DisabledReasonDemo = dynamic(() =>
  import("@/components/demos/interaction-states").then((m) => m.DisabledReasonDemo)
);
export const HoverShiftDemo = dynamic(() =>
  import("@/components/demos/interaction-states").then((m) => m.HoverShiftDemo)
);
export const InteractionStatesDemo = dynamic(() =>
  import("@/components/demos/interaction-states").then((m) => m.InteractionStatesDemo)
);
export const HoverSoundDemo = dynamic(() =>
  import("@/components/demos/interface-sfx").then((m) => m.HoverSoundDemo)
);
export const SoundCuesDemo = dynamic(() =>
  import("@/components/demos/interface-sfx").then((m) => m.SoundCuesDemo)
);
export const SoundLevelDemo = dynamic(() =>
  import("@/components/demos/interface-sfx").then((m) => m.SoundLevelDemo)
);
export const InterruptibilityDemo = dynamic(() =>
  import("@/components/demos/interruptibility").then((m) => m.InterruptibilityDemo)
);
export const SpringVelocityDemo = dynamic(() =>
  import("@/components/demos/interruptibility").then((m) => m.SpringVelocityDemo)
);
export const ToastStackDemo = dynamic(() =>
  import("@/components/demos/interruptibility").then((m) => m.ToastStackDemo)
);
export const ArpeggioSpacingDemo = dynamic(() =>
  import("@/components/demos/layering-sounds").then((m) => m.ArpeggioSpacingDemo)
);
export const SoundLayersDemo = dynamic(() =>
  import("@/components/demos/layering-sounds").then((m) => m.SoundLayersDemo)
);
export const TextureLayersDemo = dynamic(() =>
  import("@/components/demos/layering-sounds").then((m) => m.TextureLayersDemo)
);
export const HydrationGapDemo = dynamic(() =>
  import("@/components/demos/javascript-cost").then((m) => m.HydrationGapDemo)
);
export const LoadOnIntentDemo = dynamic(() =>
  import("@/components/demos/javascript-cost").then((m) => m.LoadOnIntentDemo)
);
export const FontSwapDemo = dynamic(() =>
  import("@/components/demos/layout-shift").then((m) => m.FontSwapDemo)
);
export const LayoutShiftDemo = dynamic(() =>
  import("@/components/demos/layout-shift").then((m) => m.LayoutShiftDemo)
);
export const ReadySignalDemo = dynamic(() =>
  import("@/components/demos/measuring").then((m) => m.ReadySignalDemo)
);
export const RepeatRunsDemo = dynamic(() =>
  import("@/components/demos/measuring").then((m) => m.RepeatRunsDemo)
);
export const ChatAnchorDemo = dynamic(() =>
  import("@/components/demos/long-lists").then((m) => m.ChatAnchorDemo)
);
export const LongListDemo = dynamic(() =>
  import("@/components/demos/long-lists").then((m) => m.LongListDemo)
);
export const LetterSpacingDemo = dynamic(() =>
  import("@/components/demos/letter-spacing").then((m) => m.LetterSpacingDemo)
);
export const UppercaseTrackingDemo = dynamic(() =>
  import("@/components/demos/letter-spacing").then((m) => m.UppercaseTrackingDemo)
);
export const LineHeightDemo = dynamic(() =>
  import("@/components/demos/line-length").then((m) => m.LineHeightDemo)
);
export const LineLengthDemo = dynamic(() =>
  import("@/components/demos/line-length").then((m) => m.LineLengthDemo)
);
export const LineReturnDemo = dynamic(() =>
  import("@/components/demos/line-length").then((m) => m.LineReturnDemo)
);
export const ImageArrivalDemo = dynamic(() =>
  import("@/components/demos/image-loading").then((m) => m.ImageArrivalDemo)
);
export const PlaceholderDemo = dynamic(() =>
  import("@/components/demos/image-loading").then((m) => m.PlaceholderDemo)
);
export const PrefetchDemo = dynamic(() =>
  import("@/components/demos/instant-navigation").then((m) => m.PrefetchDemo)
);
export const SpinnerDelayDemo = dynamic(() =>
  import("@/components/demos/instant-navigation").then((m) => m.SpinnerDelayDemo)
);
export const GlassLegibilityDemo = dynamic(() =>
  import("@/components/demos/liquid-glass").then((m) => m.GlassLegibilityDemo)
);
export const LiquidGlassDemo = dynamic(() =>
  import("@/components/demos/liquid-glass").then((m) => m.LiquidGlassDemo)
);
export const GooeyTabsDemo = dynamic(() =>
  import("@/components/demos/liquid-motion").then((m) => m.GooeyTabsDemo)
);
export const MorphDemo = dynamic(() =>
  import("@/components/demos/liquid-motion").then((m) => m.MorphDemo)
);
export const StretchDemo = dynamic(() =>
  import("@/components/demos/liquid-motion").then((m) => m.StretchDemo)
);
export const LivingBarsDemo = dynamic(() =>
  import("@/components/demos/living-charts").then((m) => m.LivingBarsDemo)
);
export const LivingChartsDemo = dynamic(() =>
  import("@/components/demos/living-charts").then((m) => m.LivingChartsDemo)
);
export const ErrorMessagesDemo = dynamic(() =>
  import("@/components/demos/microcopy").then((m) => m.ErrorMessagesDemo)
);
export const MicrocopyDemo = dynamic(() =>
  import("@/components/demos/microcopy").then((m) => m.MicrocopyDemo)
);
export const PluralCountDemo = dynamic(() =>
  import("@/components/demos/microcopy").then((m) => m.PluralCountDemo)
);
export const ProjectionDemo = dynamic(() =>
  import("@/components/demos/momentum").then((m) => m.ProjectionDemo)
);
export const VelocityHandoffDemo = dynamic(() =>
  import("@/components/demos/momentum").then((m) => m.VelocityHandoffDemo)
);
export const NestedRadiusDemo = dynamic(() =>
  import("@/components/demos/nested-radius").then((m) => m.NestedRadiusDemo)
);
export const NestedRadiusExamplesDemo = dynamic(() =>
  import("@/components/demos/nested-radius").then((m) => m.NestedRadiusExamplesDemo)
);
export const RadiusCalculatorDemo = dynamic(() =>
  import("@/components/demos/nested-radius").then((m) => m.RadiusCalculatorDemo)
);
export const NoiseBandingDemo = dynamic(() =>
  import("@/components/demos/noise").then((m) => m.NoiseBandingDemo)
);
export const NoiseDemo = dynamic(() =>
  import("@/components/demos/noise").then((m) => m.NoiseDemo)
);
export const NoiseFrequencyDemo = dynamic(() =>
  import("@/components/demos/noise").then((m) => m.NoiseFrequencyDemo)
);
export const NoiseSurfaceDemo = dynamic(() =>
  import("@/components/demos/noise").then((m) => m.NoiseSurfaceDemo)
);
export const AnimationCostDemo = dynamic(() =>
  import("@/components/demos/novelty-budget").then((m) => m.AnimationCostDemo)
);
export const NoveltyBudgetDemo = dynamic(() =>
  import("@/components/demos/novelty-budget").then((m) => m.NoveltyBudgetDemo)
);
export const DirectionFirstDemo = dynamic(() =>
  import("@/components/demos/direction-first").then((m) => m.DirectionFirstDemo)
);
export const BorrowFromTheSubjectDemo = dynamic(() =>
  import("@/components/demos/borrow-from-the-subject").then(
    (m) => m.BorrowFromTheSubjectDemo
  )
);
export const OwnableAssetsDemo = dynamic(() =>
  import("@/components/demos/ownable-assets").then((m) => m.OwnableAssetsDemo)
);
export const OklchDemo = dynamic(() =>
  import("@/components/demos/oklch").then((m) => m.OklchDemo)
);
export const OklchGradientDemo = dynamic(() =>
  import("@/components/demos/oklch").then((m) => m.OklchGradientDemo)
);
export const OklchPaletteDemo = dynamic(() =>
  import("@/components/demos/oklch").then((m) => m.OklchPaletteDemo)
);
export const HangingPunctuationDemo = dynamic(() =>
  import("@/components/demos/optical-alignment").then((m) => m.HangingPunctuationDemo)
);
export const OpticalAlignmentDemo = dynamic(() =>
  import("@/components/demos/optical-alignment").then((m) => m.OpticalAlignmentDemo)
);
export const OpticalButtonDemo = dynamic(() =>
  import("@/components/demos/optical-alignment").then((m) => m.OpticalButtonDemo)
);
export const OpticalSizingDemo = dynamic(() =>
  import("@/components/demos/optical-alignment").then((m) => m.OpticalSizingDemo)
);
export const OpticalWeightDemo = dynamic(() =>
  import("@/components/demos/optical-alignment").then((m) => m.OpticalWeightDemo)
);
export const OverlayFocusDemo = dynamic(() =>
  import("@/components/demos/overlays").then((m) => m.OverlayFocusDemo)
);
export const OverlayScrollDemo = dynamic(() =>
  import("@/components/demos/overlays").then((m) => m.OverlayScrollDemo)
);
export const LoadingFlashDemo = dynamic(() =>
  import("@/components/demos/perceived-performance").then((m) => m.LoadingFlashDemo)
);
export const OptimisticDemo = dynamic(() =>
  import("@/components/demos/perceived-performance").then((m) => m.OptimisticDemo)
);
export const PerceivedPerformanceDemo = dynamic(() =>
  import("@/components/demos/perceived-performance").then((m) => m.PerceivedPerformanceDemo)
);
export const SpinnerSpeedDemo = dynamic(() =>
  import("@/components/demos/perceived-performance").then((m) => m.SpinnerSpeedDemo)
);
export const FeelMismatchDemo = dynamic(() =>
  import("@/components/demos/product-feel").then((m) => m.FeelMismatchDemo)
);
export const ProductFeelDemo = dynamic(() =>
  import("@/components/demos/product-feel").then((m) => m.ProductFeelDemo)
);
export const RealContentDemo = dynamic(() =>
  import("@/components/demos/real-content").then((m) => m.RealContentDemo)
);
export const RealContentGridDemo = dynamic(() =>
  import("@/components/demos/real-content").then((m) => m.RealContentGridDemo)
);
export const ReducedMotionDemo = dynamic(() =>
  import("@/components/demos/reduced-motion").then((m) => m.ReducedMotionDemo)
);
export const PaintFirstDemo = dynamic(() =>
  import("@/components/demos/responsiveness").then((m) => m.PaintFirstDemo)
);
export const TypingLagDemo = dynamic(() =>
  import("@/components/demos/responsiveness").then((m) => m.TypingLagDemo)
);
export const DepthOfFieldDemo = dynamic(() =>
  import("@/components/demos/references").then((m) => m.DepthOfFieldDemo)
);
export const RubberBandDemo = dynamic(() =>
  import("@/components/demos/references").then((m) => m.RubberBandDemo)
);
export const ContainerQueryDemo = dynamic(() =>
  import("@/components/demos/responsive").then((m) => m.ContainerQueryDemo)
);
export const FluidTypeDemo = dynamic(() =>
  import("@/components/demos/responsive").then((m) => m.FluidTypeDemo)
);
export const ScaleEntrancesDemo = dynamic(() =>
  import("@/components/demos/scale-entrances").then((m) => m.ScaleEntrancesDemo)
);
export const StartingScaleDemo = dynamic(() =>
  import("@/components/demos/scale-entrances").then((m) => m.StartingScaleDemo)
);
export const TransformOriginDemo = dynamic(() =>
  import("@/components/demos/scale-entrances").then((m) => m.TransformOriginDemo)
);
export const ScrollFadesDemo = dynamic(() =>
  import("@/components/demos/scroll-fades").then((m) => m.ScrollFadesDemo)
);
export const ScrollFadesEdgeDemo = dynamic(() =>
  import("@/components/demos/scroll-fades").then((m) => m.ScrollFadesEdgeDemo)
);
export const ScrollFadesHorizontalDemo = dynamic(() =>
  import("@/components/demos/scroll-fades").then((m) => m.ScrollFadesHorizontalDemo)
);
export const ShadowDarkModeDemo = dynamic(() =>
  import("@/components/demos/shadows-not-borders").then((m) => m.ShadowDarkModeDemo)
);
export const ShadowElevationDemo = dynamic(() =>
  import("@/components/demos/shadows-not-borders").then((m) => m.ShadowElevationDemo)
);
export const ShadowLayersDemo = dynamic(() =>
  import("@/components/demos/shadows-not-borders").then((m) => m.ShadowLayersDemo)
);
export const ShadowsNotBordersDemo = dynamic(() =>
  import("@/components/demos/shadows-not-borders").then((m) => m.ShadowsNotBordersDemo)
);
export const SharedLayoutDemo = dynamic(() =>
  import("@/components/demos/shared-layout").then((m) => m.SharedLayoutDemo)
);
export const SharedLayoutDetailDemo = dynamic(() =>
  import("@/components/demos/shared-layout").then((m) => m.SharedLayoutDetailDemo)
);
export const MainThreadDemo = dynamic(() =>
  import("@/components/demos/smooth-animation").then((m) => m.MainThreadDemo)
);
export const ShadowLiftDemo = dynamic(() =>
  import("@/components/demos/smooth-animation").then((m) => m.ShadowLiftDemo)
);
export const SpacingScaleDemo = dynamic(() =>
  import("@/components/demos/spacing-scale").then((m) => m.SpacingScaleDemo)
);
export const SpacingStepsDemo = dynamic(() =>
  import("@/components/demos/spacing-scale").then((m) => m.SpacingStepsDemo)
);
export const SpringBounceDemo = dynamic(() =>
  import("@/components/demos/springs").then((m) => m.SpringBounceDemo)
);
export const SpringTunerDemo = dynamic(() =>
  import("@/components/demos/springs").then((m) => m.SpringTunerDemo)
);
export const SquircleCompareDemo = dynamic(() =>
  import("@/components/demos/squircles").then((m) => m.SquircleCompareDemo)
);
export const SquircleCurvatureDemo = dynamic(() =>
  import("@/components/demos/squircles").then((m) => m.SquircleCurvatureDemo)
);
export const SquircleExamplesDemo = dynamic(() =>
  import("@/components/demos/squircles").then((m) => m.SquircleExamplesDemo)
);
export const StaggerCapDemo = dynamic(() =>
  import("@/components/demos/stagger").then((m) => m.StaggerCapDemo)
);
export const StaggerCompareDemo = dynamic(() =>
  import("@/components/demos/stagger").then((m) => m.StaggerCompareDemo)
);
export const StaggerDemo = dynamic(() =>
  import("@/components/demos/stagger").then((m) => m.StaggerDemo)
);
export const TabularNumsDemo = dynamic(() =>
  import("@/components/demos/tabular-nums").then((m) => m.TabularNumsDemo)
);
export const TabularTableDemo = dynamic(() =>
  import("@/components/demos/tabular-nums").then((m) => m.TabularTableDemo)
);
export const TabularTimerDemo = dynamic(() =>
  import("@/components/demos/tabular-nums").then((m) => m.TabularTimerDemo)
);
export const PairJudgementDemo = dynamic(() =>
  import("@/components/demos/taste").then((m) => m.PairJudgementDemo)
);
export const SpotTheDifferenceDemo = dynamic(() =>
  import("@/components/demos/taste").then((m) => m.SpotTheDifferenceDemo)
);
export const TastePassDemo = dynamic(() =>
  import("@/components/demos/taste-pass").then((m) => m.TastePassDemo)
);
export const TextBalanceDemo = dynamic(() =>
  import("@/components/demos/text-wrapping").then((m) => m.TextBalanceDemo)
);
export const TextPrettyDemo = dynamic(() =>
  import("@/components/demos/text-wrapping").then((m) => m.TextPrettyDemo)
);
export const StructureErasDemo = dynamic(() =>
  import("@/components/demos/timelessness").then((m) => m.StructureErasDemo)
);
export const SurfaceErasDemo = dynamic(() =>
  import("@/components/demos/timelessness").then((m) => m.SurfaceErasDemo)
);
export const ToastStackingDemo = dynamic(() =>
  import("@/components/demos/toasts").then((m) => m.ToastStackingDemo)
);
export const ToastsDemo = dynamic(() =>
  import("@/components/demos/toasts").then((m) => m.ToastsDemo)
);
export const TypeScaleDemo = dynamic(() =>
  import("@/components/demos/type-scale").then((m) => m.TypeScaleDemo)
);
export const TypeScaleRatioDemo = dynamic(() =>
  import("@/components/demos/type-scale").then((m) => m.TypeScaleRatioDemo)
);
export const HierarchyActionsDemo = dynamic(() =>
  import("@/components/demos/visual-hierarchy").then((m) => m.HierarchyActionsDemo)
);
export const HierarchyLabelsDemo = dynamic(() =>
  import("@/components/demos/visual-hierarchy").then((m) => m.HierarchyLabelsDemo)
);
export const VisualHierarchyDemo = dynamic(() =>
  import("@/components/demos/visual-hierarchy").then((m) => m.VisualHierarchyDemo)
);
export const EmbedFacadeDemo = dynamic(() =>
  import("@/components/demos/video-embeds").then((m) => m.EmbedFacadeDemo)
);
export const VideoRevealDemo = dynamic(() =>
  import("@/components/demos/video-embeds").then((m) => m.VideoRevealDemo)
);
export const WhitespaceDemo = dynamic(() =>
  import("@/components/demos/whitespace").then((m) => m.WhitespaceDemo)
);
export const WhitespaceDividersDemo = dynamic(() =>
  import("@/components/demos/whitespace").then((m) => m.WhitespaceDividersDemo)
);
export const WhitespaceSquintDemo = dynamic(() =>
  import("@/components/demos/whitespace").then((m) => m.WhitespaceSquintDemo)
);

// Mobile
export const NativeFeelDemo = dynamic(() =>
  import("@/components/demos/native-feel").then((m) => m.NativeFeelDemo)
);
export const PlatformDialogDemo = dynamic(() =>
  import("@/components/demos/native-feel").then((m) => m.PlatformDialogDemo)
);
export const ThumbReachDemo = dynamic(() =>
  import("@/components/demos/thumb-reach").then((m) => m.ThumbReachDemo)
);
export const SafeAreaDemo = dynamic(() =>
  import("@/components/demos/safe-areas").then((m) => m.SafeAreaDemo)
);
export const EdgeToEdgeDemo = dynamic(() =>
  import("@/components/demos/safe-areas").then((m) => m.EdgeToEdgeDemo)
);
export const TouchDownDemo = dynamic(() =>
  import("@/components/demos/touch-feedback").then((m) => m.TouchDownDemo)
);
export const ScrollCancelDemo = dynamic(() =>
  import("@/components/demos/touch-feedback").then((m) => m.ScrollCancelDemo)
);
export const DoubleTapDelayDemo = dynamic(() =>
  import("@/components/demos/gestures").then((m) => m.DoubleTapDelayDemo)
);
export const GestureTwinDemo = dynamic(() =>
  import("@/components/demos/gestures").then((m) => m.GestureTwinDemo)
);
export const LongPressDemo = dynamic(() =>
  import("@/components/demos/long-press").then((m) => m.LongPressDemo)
);
export const ContextMenuDemo = dynamic(() =>
  import("@/components/demos/long-press").then((m) => m.ContextMenuDemo)
);
export const SwipeActionsDemo = dynamic(() =>
  import("@/components/demos/swipe-actions").then((m) => m.SwipeActionsDemo)
);
export const SwipeThresholdDemo = dynamic(() =>
  import("@/components/demos/swipe-actions").then((m) => m.SwipeThresholdDemo)
);
export const SheetDetentsDemo = dynamic(() =>
  import("@/components/demos/bottom-sheets").then((m) => m.SheetDetentsDemo)
);
export const SheetScrollDemo = dynamic(() =>
  import("@/components/demos/bottom-sheets").then((m) => m.SheetScrollDemo)
);
export const EdgeSwipeBackDemo = dynamic(() =>
  import("@/components/demos/back-navigation").then((m) => m.EdgeSwipeBackDemo)
);
export const PredictiveBackDemo = dynamic(() =>
  import("@/components/demos/back-navigation").then((m) => m.PredictiveBackDemo)
);
export const TabStateDemo = dynamic(() =>
  import("@/components/demos/back-navigation").then((m) => m.TabStateDemo)
);
export const HapticPickerDemo = dynamic(() =>
  import("@/components/demos/haptics").then((m) => m.HapticPickerDemo)
);
export const HapticVocabularyDemo = dynamic(() =>
  import("@/components/demos/haptics").then((m) => m.HapticVocabularyDemo)
);
export const KeyboardAvoidDemo = dynamic(() =>
  import("@/components/demos/soft-keyboard").then((m) => m.KeyboardAvoidDemo)
);
export const KeyboardDismissDemo = dynamic(() =>
  import("@/components/demos/soft-keyboard").then((m) => m.KeyboardDismissDemo)
);
export const TextSizeDemo = dynamic(() =>
  import("@/components/demos/text-size").then((m) => m.TextSizeDemo)
);
export const TextReflowDemo = dynamic(() =>
  import("@/components/demos/text-size").then((m) => m.TextReflowDemo)
);
export const ThreadJankDemo = dynamic(() =>
  import("@/components/demos/ui-thread").then((m) => m.ThreadJankDemo)
);
export const FrameBudgetDemo = dynamic(() =>
  import("@/components/demos/ui-thread").then((m) => m.FrameBudgetDemo)
);
export const LaunchDemo = dynamic(() =>
  import("@/components/demos/app-launch").then((m) => m.LaunchDemo)
);
export const LaunchScreenDemo = dynamic(() =>
  import("@/components/demos/app-launch").then((m) => m.LaunchScreenDemo)
);
export const RecyclingDemo = dynamic(() =>
  import("@/components/demos/native-lists").then((m) => m.RecyclingDemo)
);
export const PullToRefreshDemo = dynamic(() =>
  import("@/components/demos/native-lists").then((m) => m.PullToRefreshDemo)
);
