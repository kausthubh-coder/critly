"use client";

import {
  ArrowLeftIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CheckCircleIcon,
  CheckIcon,
  TrashIcon,
  XIcon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";

import { RIGHT_ICON, WRONG_ICON } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { Phone, PHONE_INSETS, type Platform, usePhoneScale } from "@/components/app/phone";
import { SegmentedControl } from "@/components/app/segmented-control";
import { cn } from "@/lib/utils";

/* The app's brand colour stays the same on both platforms. Only the parts
   people learned from the system change: bars, lists, switches, dialogs and
   what a press looks like. Sizes are the real pt/dp values at the Phone's
   0.63 scale (a 44pt row is 28px, a 56dp list item is 35px). */

const PLATFORM_OPTIONS = [
  { value: "ios", label: "iPhone" },
  { value: "android", label: "Android" },
] as const;

const FONT: Record<Platform, string> = {
  ios: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif',
  android: 'Roboto, "Google Sans", system-ui, sans-serif',
};

const BRAND_TEXT = "text-indigo-600 dark:text-indigo-400";
const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-inset";

/* On a phone the screen scales up about 1.52x, so a 29px layout target is
   44px under the finger. This lifts a smaller control to 30px without
   changing its look. */
const HIT_30 = "after:absolute after:top-1/2 after:left-1/2 after:size-[30px] after:-translate-x-1/2 after:-translate-y-1/2";

type Ripple = { id: number; x: number; y: number; size: number };

/**
 * A button that presses the way its platform does. iOS highlights on
 * touch-down and fades out on release. Android draws a 10% ripple of the
 * content colour that grows from the touch point (the M3 pressed state layer).
 */
function Pressable({
  platform,
  className,
  children,
  ...props
}: { platform: Platform } & Omit<
  React.ComponentProps<"button">,
  "onPointerDown" | "onPointerUp" | "onPointerLeave" | "onPointerCancel" | "type"
>) {
  const reduced = useReducedMotion();
  const k = usePhoneScale();
  const [pressed, setPressed] = useState(false);
  const [ripple, setRipple] = useState<Ripple | null>(null);
  const nextId = useRef(0);

  function down(event: React.PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return;
    setPressed(true);
    if (platform === "android" && !reduced) {
      const rect = event.currentTarget.getBoundingClientRect();
      // Screen pixels to the phone's layout pixels.
      const w = rect.width / k;
      const h = rect.height / k;
      const x = (event.clientX - rect.left) / k;
      const y = (event.clientY - rect.top) / k;
      const size = 2 * Math.hypot(Math.max(x, w - x), Math.max(y, h - y));
      nextId.current += 1;
      setRipple({ id: nextId.current, x, y, size });
    }
  }

  function up() {
    setPressed(false);
    setRipple(null);
  }

  return (
    <button
      {...props}
      className={cn("relative isolate cursor-pointer", FOCUS, className)}
      onPointerCancel={up}
      onPointerDown={down}
      onPointerLeave={up}
      onPointerUp={up}
      type="button"
    >
      {platform === "ios" ? (
        // Behind the label, like a table cell's selected background.
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-foreground/12",
            pressed ? "opacity-100" : "opacity-0 transition-opacity duration-300"
          )}
        />
      ) : reduced ? (
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 rounded-[inherit] bg-foreground/10 transition-opacity duration-150",
            pressed ? "opacity-100" : "opacity-0"
          )}
        />
      ) : (
        // The ripple is clipped to the shape; the button itself isn't, so an
        // ::after can extend its target past the edges.
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
        <AnimatePresence>
          {ripple ? (
            <motion.span
              key={ripple.id}
              animate={{ scale: 1, opacity: 1 }}
              aria-hidden="true"
              className="pointer-events-none absolute rounded-full bg-foreground/10"
              exit={{ scale: 1, opacity: 0, transition: { duration: 0.25 } }}
              initial={{ scale: 0, opacity: 1 }}
              style={{
                left: ripple.x - ripple.size / 2,
                top: ripple.y - ripple.size / 2,
                width: ripple.size,
                height: ripple.size,
              }}
              transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
            />
          ) : null}
        </AnimatePresence>
        </span>
      )}
      {children}
    </button>
  );
}

/* Switches, drawn from each platform's own spec. */

function IosSwitch({ on }: { on: boolean }) {
  // 51 x 31pt track, 27pt knob.
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative block h-[20px] w-[32px] shrink-0 rounded-full transition-colors duration-200",
        on ? "bg-indigo-500" : "bg-foreground/15"
      )}
    >
      <span
        className="absolute top-[2px] left-[2px] size-[16px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.25)] transition-transform duration-200 ease-snappy motion-reduce:transition-none"
        style={{ transform: `translateX(${on ? 12 : 0}px)` }}
      />
    </span>
  );
}

function M3Switch({ on }: { on: boolean }) {
  // 52 x 32dp track. The thumb is 16dp when off and grows to 24dp with a
  // check when on; here one 15px thumb scales between the two sizes.
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative block h-[20px] w-[33px] shrink-0 rounded-full border-2 transition-colors duration-200",
        on
          ? "border-transparent bg-indigo-500"
          : "border-foreground/45 bg-muted"
      )}
    >
      <span
        className={cn(
          "absolute top-[0.5px] left-0 grid size-[15px] place-items-center rounded-full transition-[transform,background-color] duration-200 ease-snappy motion-reduce:transition-none",
          on ? "bg-white" : "bg-foreground/45"
        )}
        style={{
          transform: on ? "translateX(13.5px) scale(1)" : "translateX(0.5px) scale(0.667)",
        }}
      >
        <CheckIcon
          className={cn(
            "size-[9px] text-indigo-600 transition-opacity duration-150",
            on ? "opacity-100" : "opacity-0"
          )}
          weight="bold"
        />
      </span>
    </span>
  );
}

/* NativeFeelDemo: one settings screen, drawn natively for each platform. */

const TOGGLES = [
  { id: "allow", ios: "Allow Notifications", android: "Allow notifications" },
  { id: "sounds", ios: "Sounds", android: "Sounds" },
  { id: "badges", ios: "Badges", android: "App icon badges" },
] as const;

const DETAILS = [
  { id: "previews", ios: "Show Previews", android: "Show previews", value: ["When Unlocked", "When unlocked"] },
  { id: "summary", ios: "Scheduled Summary", android: "Scheduled summary", value: ["Off", "Off"] },
] as const;

type ToggleId = (typeof TOGGLES)[number]["id"];

function IosSettings({
  values,
  toggle,
}: {
  values: Record<ToggleId, boolean>;
  toggle: (id: ToggleId) => void;
}) {
  const inset = PHONE_INSETS.ios;
  return (
    <div
      className="absolute inset-0 bg-muted text-foreground dark:bg-background"
      style={{ paddingTop: inset.top, fontFamily: FONT.ios }}
    >
      {/* Navigation bar: a back chevron on glass, top leading. */}
      <div className="flex h-[30px] items-center px-2.5">
        <Pressable
          aria-label="Back to Settings"
          className={cn("grid size-[26px] place-items-center rounded-full bg-card shadow-(--custom-shadow) dark:bg-muted", HIT_30)}
          platform="ios"
        >
          <CaretLeftIcon aria-hidden="true" className="size-[13px]" weight="bold" />
        </Pressable>
      </div>
      {/* Large title: 34pt bold, collapses into the bar on scroll. */}
      <p className="px-3.5 pt-1 text-[21px] leading-tight font-bold tracking-tight">
        Notifications
      </p>

      <p className="px-[22px] pt-4 pb-1 text-[9.5px] text-foreground/70">Alerts</p>
      <div className="mx-3 overflow-hidden rounded-[12px] bg-card dark:bg-muted">
        {TOGGLES.map((row, index) => (
          <div key={row.id}>
            {index > 0 ? <div className="ml-3 h-px bg-border" /> : null}
            <div className="flex h-[29px] items-center justify-between pr-2 pl-3 text-[11px]">
              <span>{row.ios}</span>
              <button
                aria-checked={values[row.id]}
                aria-label={row.ios}
                // As tall as the 29px row (44px on a phone), never into the next one.
                className={cn("relative cursor-pointer rounded-full after:absolute after:inset-x-0 after:-inset-y-[4.5px]", FOCUS)}
                onClick={() => toggle(row.id)}
                role="switch"
                type="button"
              >
                <IosSwitch on={values[row.id]} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="px-[22px] pt-4 pb-1 text-[9.5px] text-foreground/70">Lock Screen</p>
      <div className="mx-3 overflow-hidden rounded-[12px] bg-card dark:bg-muted">
        {DETAILS.map((row, index) => (
          <div key={row.id}>
            {index > 0 ? <div className="ml-3 h-px bg-border" /> : null}
            <Pressable
              className="flex h-[29px] w-full items-center justify-between pr-2 pl-3 text-left text-[11px]"
              platform="ios"
            >
              <span>{row.ios}</span>
              <span className="flex items-center gap-1 text-muted-foreground">
                {row.value[0]}
                <CaretRightIcon aria-hidden="true" className="size-[9px]" weight="bold" />
              </span>
            </Pressable>
          </div>
        ))}
      </div>
    </div>
  );
}

function AndroidSettings({
  values,
  toggle,
}: {
  values: Record<ToggleId, boolean>;
  toggle: (id: ToggleId) => void;
}) {
  const inset = PHONE_INSETS.android;
  return (
    <div
      className="absolute inset-0 bg-background text-foreground"
      style={{ paddingTop: inset.top, fontFamily: FONT.android }}
    >
      {/* Top app bar: 64dp, an arrow in a 48dp target, the title after it. */}
      <div className="flex h-[40px] items-center gap-1 px-1">
        <Pressable
          aria-label="Back"
          className="grid size-[30px] place-items-center rounded-full"
          platform="android"
        >
          <ArrowLeftIcon aria-hidden="true" className="size-[15px]" />
        </Pressable>
        <p className="text-[14px]">Notifications</p>
      </div>

      <p className={cn("px-[14px] pt-3 pb-1 text-[9.5px] font-medium", BRAND_TEXT)}>Alerts</p>
      {TOGGLES.map((row) => (
        // On Android the whole list item toggles, not only the switch.
        <Pressable
          key={row.id}
          aria-checked={values[row.id]}
          className="flex h-[35px] w-full items-center justify-between px-[14px] text-left text-[11px]"
          onClick={() => toggle(row.id)}
          platform="android"
          role="switch"
        >
          <span>{row.android}</span>
          <M3Switch on={values[row.id]} />
        </Pressable>
      ))}

      <p className={cn("px-[14px] pt-3 pb-1 text-[9.5px] font-medium", BRAND_TEXT)}>
        Lock screen
      </p>
      {DETAILS.map((row) => (
        <Pressable
          key={row.id}
          className="flex h-[44px] w-full flex-col items-start justify-center px-[14px] text-left"
          platform="android"
        >
          <span className="text-[11px]">{row.android}</span>
          <span className="text-[9.5px] text-muted-foreground">{row.value[1]}</span>
        </Pressable>
      ))}
    </div>
  );
}

export function NativeFeelDemo() {
  const [platform, setPlatform] = useState<Platform>("ios");
  const [values, setValues] = useState<Record<ToggleId, boolean>>({
    allow: true,
    sounds: true,
    badges: false,
  });
  const toggle = (id: ToggleId) => setValues((v) => ({ ...v, [id]: !v[id] }));

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <Phone
        height={420}
        label={`Notification settings on ${platform === "ios" ? "iPhone" : "Android"}`}
        platform={platform}
      >
        {platform === "ios" ? (
          <IosSettings toggle={toggle} values={values} />
        ) : (
          <AndroidSettings toggle={toggle} values={values} />
        )}
      </Phone>
      <SegmentedControl
        ariaLabel="Platform"
        onChange={setPlatform}
        options={PLATFORM_OPTIONS}
        value={platform}
      />
      <p className="text-center text-xs text-muted-foreground">
        Switch platforms, then press a row and flip a switch.
      </p>
    </Demo>
  );
}

/* PlatformDialogDemo: the same delete confirmation, custom vs native. */

type DialogMode = "custom" | "native";

const DIALOG_OPTIONS = [
  { value: "custom", label: "One custom dialog", icon: WRONG_ICON },
  { value: "native", label: "Native dialogs", icon: RIGHT_ICON },
] as const;

const TITLE = "Delete 3 photos?";
const MESSAGE = "They'll be removed from all your devices.";
const SELECTED = new Set([1, 4, 5]);

function PhotoGrid({ platform }: { platform: Platform }) {
  return (
    <div aria-hidden="true" className="grid grid-cols-3 gap-[2px]">
      {Array.from({ length: 15 }, (_, i) => (
        <div
          key={i}
          className="relative aspect-square"
          style={{ background: `oklch(${0.7 + ((i * 7) % 5) * 0.04} 0.05 ${(i * 47) % 360})` }}
        >
          {SELECTED.has(i) ? (
            <>
              <span className="absolute inset-0 bg-white/25 dark:bg-black/20" />
              <CheckCircleIcon
                className={cn(
                  "absolute size-[14px] rounded-full bg-white text-indigo-500",
                  platform === "ios" ? "right-1 bottom-1" : "top-1 left-1"
                )}
                weight="fill"
              />
            </>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function DialogButton({
  platform,
  className,
  children,
  onClick,
}: {
  platform: Platform;
  className?: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Pressable className={className} onClick={onClick} platform={platform}>
      {children}
    </Pressable>
  );
}

function IosAlert({ close }: { close: () => void }) {
  // Cancel on the leading side, the action on the trailing side.
  return (
    <div className="w-[176px] rounded-[22px] bg-card p-3.5 shadow-lg ring-1 ring-black/5 dark:bg-muted dark:ring-white/10">
      <p className="text-[11px] font-semibold">{TITLE}</p>
      <p className="mt-0.5 text-[9.5px] leading-snug text-muted-foreground">{MESSAGE}</p>
      <div className="mt-3 flex gap-1.5">
        <DialogButton
          className="h-[28px] flex-1 rounded-full bg-foreground/8 text-[10.5px] font-medium after:absolute after:-inset-y-px after:inset-x-0"
          onClick={close}
          platform="ios"
        >
          Cancel
        </DialogButton>
        <DialogButton
          className="h-[28px] flex-1 rounded-full bg-foreground/8 text-[10.5px] font-semibold text-red-700 after:absolute after:-inset-y-px after:inset-x-0 dark:text-red-400"
          onClick={close}
          platform="ios"
        >
          Delete
        </DialogButton>
      </div>
    </div>
  );
}

function M3Dialog({ close }: { close: () => void }) {
  // 28dp corners, text buttons at the trailing edge, dismiss left of confirm.
  return (
    <div className="w-[184px] rounded-[18px] bg-card p-[15px] pb-2.5 shadow-lg ring-1 ring-black/5 dark:bg-muted dark:ring-white/10">
      <p className="text-[14px] leading-tight">{TITLE}</p>
      <p className="mt-2 text-[9.5px] leading-snug text-muted-foreground">{MESSAGE}</p>
      <div className="mt-3 flex justify-end gap-1">
        <DialogButton
          className={cn("h-[25px] rounded-full px-2.5 text-[10px] font-medium after:absolute after:-inset-y-[2.5px] after:inset-x-0", BRAND_TEXT)}
          onClick={close}
          platform="android"
        >
          Cancel
        </DialogButton>
        <DialogButton
          className={cn("h-[25px] rounded-full px-2.5 text-[10px] font-medium after:absolute after:-inset-y-[2.5px] after:inset-x-0", BRAND_TEXT)}
          onClick={close}
          platform="android"
        >
          Delete
        </DialogButton>
      </div>
    </div>
  );
}

function CustomDialog({ platform, close }: { platform: Platform; close: () => void }) {
  // One design for both: centred, filled Delete first. Matches neither.
  return (
    <div className="w-[176px] rounded-lg bg-card p-3.5 text-center shadow-lg ring-1 ring-black/5 dark:bg-muted dark:ring-white/10">
      <p className="text-[12px] font-bold">{TITLE}</p>
      <p className="mt-1 text-[9.5px] leading-snug text-muted-foreground">{MESSAGE}</p>
      <div className="mt-3 flex gap-1.5">
        <DialogButton
          className="h-[26px] flex-1 rounded-md bg-rose-500 after:absolute after:-inset-y-[2px] after:inset-x-0 text-[10px] font-semibold text-white"
          onClick={close}
          platform={platform}
        >
          Delete
        </DialogButton>
        <DialogButton
          className="h-[26px] flex-1 rounded-md text-[10px] font-medium ring-1 after:absolute after:-inset-y-[2px] after:inset-x-0 ring-border ring-inset"
          onClick={close}
          platform={platform}
        >
          Cancel
        </DialogButton>
      </div>
    </div>
  );
}

function DialogPhone({ platform, mode }: { platform: Platform; mode: DialogMode }) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(true);
  const inset = PHONE_INSETS[platform];
  const ios = platform === "ios";
  const close = () => setOpen(false);
  const trash = (
    <Pressable
      aria-label="Delete 3 photos"
      className={cn(
        "grid size-[30px] place-items-center rounded-full",
        ios && "bg-card shadow-(--custom-shadow) dark:bg-muted"
      )}
      onClick={() => setOpen(true)}
      platform={platform}
    >
      <TrashIcon aria-hidden="true" className={cn("size-[15px]", ios && "text-red-600 dark:text-red-400")} />
    </Pressable>
  );

  return (
    <Phone
      height={400}
      width={228}
      label={`Delete confirmation on ${ios ? "iPhone" : "Android"}`}
      platform={platform}
    >
      <div
        className="absolute inset-0 text-foreground"
        style={{ paddingTop: inset.top, fontFamily: FONT[platform] }}
      >
        {ios ? (
          <div className="flex h-[34px] items-center justify-center text-[11px] font-semibold">
            3 Selected
          </div>
        ) : (
          <div className="flex h-[40px] items-center gap-1 px-1">
            <Pressable
              aria-label="Clear selection"
              className="grid size-[30px] place-items-center rounded-full"
              platform="android"
            >
              <XIcon aria-hidden="true" className="size-[15px]" />
            </Pressable>
            <p className="flex-1 text-[14px]">3 selected</p>
            {trash}
          </div>
        )}
        <PhotoGrid platform={platform} />
        {ios ? (
          <div className="absolute right-3 flex" style={{ bottom: inset.bottom + 6 }}>
            {trash}
          </div>
        ) : null}
      </div>

      {/* Starts open: render it in place on load, animate only later opens. */}
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key={mode}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-30 grid place-items-center bg-black/30"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={(event) => {
              // Android dialogs close on a scrim tap; iOS alerts don't.
              if (!ios && mode === "native" && event.target === event.currentTarget) close();
            }}
            style={{ fontFamily: mode === "native" ? FONT[platform] : undefined }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              animate={{ scale: 1 }}
              initial={{ scale: reduced ? 1 : ios ? 1.08 : 0.92 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              role="alertdialog"
              aria-label={TITLE}
            >
              {mode === "custom" ? (
                <CustomDialog close={close} platform={platform} />
              ) : ios ? (
                <IosAlert close={close} />
              ) : (
                <M3Dialog close={close} />
              )}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Phone>
  );
}

export function PlatformDialogDemo() {
  const [mode, setMode] = useState<DialogMode>("native");
  // On a phone each screen is full width, so show one at a time.
  const [shown, setShown] = useState<Platform>("ios");
  const native = mode === "native";

  return (
    <Demo className="gap-6 px-4 sm:px-6">
      <div className="flex w-full flex-wrap items-start justify-center gap-6">
        {(["ios", "android"] as const).map((platform) => (
          <div
            key={platform}
            className={cn(
              "flex flex-col items-center gap-3 max-sm:w-full",
              platform !== shown && "max-sm:hidden"
            )}
          >
            <DialogPhone key={mode} mode={mode} platform={platform} />
            <p className="max-w-[230px] text-center text-xs text-muted-foreground">
              {native
                ? platform === "ios"
                  ? "iPhone: Cancel leading, Delete trailing."
                  : "Android: text buttons at the trailing edge, Cancel left of Delete."
                : "Delete first, where both platforms put Cancel."}
            </p>
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center gap-2">
        <SegmentedControl
          ariaLabel="Dialog style"
          onChange={setMode}
          options={DIALOG_OPTIONS}
          value={mode}
        />
        <div className="sm:hidden">
          <SegmentedControl
            ariaLabel="Platform"
            onChange={setShown}
            options={PLATFORM_OPTIONS}
            value={shown}
          />
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Press a button to close the dialog, and the trash button to open it again.
      </p>
    </Demo>
  );
}
