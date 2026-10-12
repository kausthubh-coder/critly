"use client";

import { BackspaceIcon, ArrowFatUpIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

import { RIGHT_ICON, WRONG_ICON } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { cn } from "@/lib/utils";

/* Validation timing: every keystroke vs on blur. */

type Timing = "keystroke" | "blur";
type Field = "email" | "password";

const TIMING_OPTIONS = [
  { value: "keystroke", label: "Every keystroke", icon: WRONG_ICON },
  { value: "blur", label: "On blur", icon: RIGHT_ICON },
] as const;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function isValid(field: Field, value: string) {
  return field === "email" ? EMAIL.test(value.trim()) : value.length >= 8;
}

function errorText(field: Field, value: string) {
  if (field === "email") {
    return value === "" ? "Enter your email." : "Enter an email like name@example.com.";
  }
  return "Use at least 8 characters.";
}

const INPUT =
  "h-10 w-full rounded-lg bg-transparent px-3 text-base shadow-(--custom-shadow) outline-none placeholder:text-muted-foreground/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-foreground aria-invalid:shadow-[0_0_0_1px_var(--color-destructive)] dark:bg-muted/40";

export function InputValidationDemo() {
  const [timing, setTiming] = useState<Timing>("keystroke");
  const [values, setValues] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [created, setCreated] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function reset() {
    setValues({ email: "", password: "" });
    setTouched({ email: false, password: false });
    setCreated(false);
  }

  function showError(field: Field) {
    const value = values[field];
    if (isValid(field, value)) return false;
    if (timing === "keystroke") return value !== "" || touched[field];
    return touched[field];
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setTouched({ email: true, password: true });
    if (!isValid("email", values.email)) return emailRef.current?.focus();
    if (!isValid("password", values.password))
      return passwordRef.current?.focus();
    setCreated(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(reset, 1800);
  }

  const fields = [
    {
      field: "email" as const,
      label: "Email",
      ref: emailRef,
      props: {
        type: "email",
        autoComplete: "email",
        autoCapitalize: "none",
        spellCheck: false,
        placeholder: "name@example.com",
      },
      hint: "",
    },
    {
      field: "password" as const,
      label: "Password",
      ref: passwordRef,
      props: {
        type: "password",
        autoComplete: "new-password",
        placeholder: "",
      },
      hint: "At least 8 characters.",
    },
  ];

  return (
    <Demo className="gap-7 px-4 sm:px-8">
      <form
        className="flex w-full max-w-xs flex-col gap-2 rounded-xl bg-card p-4 shadow-(--custom-shadow)"
        noValidate
        onSubmit={onSubmit}
      >
        {fields.map(({ field, label, ref, props, hint }) => {
          const error = showError(field);
          const id = `input-details-${field}`;
          return (
            <div key={field} className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground" htmlFor={id}>
                {label}
              </label>
              <input
                ref={ref}
                id={id}
                aria-describedby={`${id}-message`}
                aria-invalid={error || undefined}
                className={INPUT}
                onBlur={() => {
                  if (values[field] !== "")
                    setTouched((t) => ({ ...t, [field]: true }));
                }}
                onChange={(event) => {
                  const value = event.target.value;
                  setValues((v) => ({ ...v, [field]: value }));
                  setCreated(false);
                }}
                value={values[field]}
                {...props}
              />
              <p
                id={`${id}-message`}
                className={cn(
                  "h-4 text-xs",
                  error ? "text-destructive" : "text-muted-foreground"
                )}
              >
                {error ? errorText(field, values[field]) : hint}
              </p>
            </div>
          );
        })}
        <button
          className="mt-1 inline-flex h-9 cursor-pointer items-center justify-center rounded-full bg-foreground px-4 text-sm font-medium text-background transition-transform duration-100 ease-out outline-none hover:bg-foreground/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-foreground active:scale-[0.97] motion-reduce:transition-none"
          type="submit"
        >
          {created ? "Account created" : "Create account"}
        </button>
      </form>
      <SegmentedControl
        ariaLabel="Validation timing"
        onChange={(next) => {
          setTiming(next);
          reset();
        }}
        options={TIMING_OPTIONS}
        value={timing}
      />
    </Demo>
  );
}

/* Which keyboard each field brings up on a phone. */

type Attrs = "generic" | "specific";
type KeyboardKind = "text" | "email" | "tel" | "decimal" | "numeric";

const ATTR_OPTIONS = [
  { value: "generic", label: "type=text, 14px", icon: WRONG_ICON },
  { value: "specific", label: "Typed, 16px", icon: RIGHT_ICON },
] as const;

const PHONE_FIELDS = [
  {
    id: "email",
    label: "Email",
    placeholder: "you@example.com",
    keyboard: "email",
    attrs: 'type="email" autocomplete="email"',
    suggestion: "jane@example.com",
  },
  {
    id: "phone",
    label: "Phone",
    placeholder: "+1 555 0100",
    keyboard: "tel",
    attrs: 'type="tel" autocomplete="tel"',
    suggestion: "",
  },
  {
    id: "tip",
    label: "Tip",
    placeholder: "0.00",
    keyboard: "decimal",
    attrs: 'inputmode="decimal"',
    suggestion: "",
  },
  {
    id: "code",
    label: "Verification code",
    placeholder: "6 digits",
    keyboard: "numeric",
    attrs: 'inputmode="numeric" autocomplete="one-time-code"',
    suggestion: "From Messages  482 913",
  },
] as const;

const SCREEN_HEIGHT = 520;
const KEYBOARD_HEIGHT = 190;
const ZOOM = 16 / 14;

const KEY =
  "flex h-7 items-center justify-center rounded-[5px] bg-card text-[12px] text-foreground shadow-[0_1px_0_rgb(0_0_0/0.18)] dark:bg-neutral-600 dark:shadow-[0_1px_0_rgb(0_0_0/0.5)]";
const KEY_DARK =
  "flex h-7 items-center justify-center rounded-[5px] bg-neutral-300 text-[11px] text-foreground shadow-[0_1px_0_rgb(0_0_0/0.18)] dark:bg-neutral-700 dark:shadow-[0_1px_0_rgb(0_0_0/0.5)]";

const QWERTY = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];

function LetterKeyboard({ email }: { email: boolean }) {
  return (
    <div className="flex flex-col gap-2 px-1">
      <div className="flex gap-[5px]">
        {QWERTY[0].split("").map((key) => (
          <span key={key} className={cn(KEY, "flex-1")}>
            {key}
          </span>
        ))}
      </div>
      <div className="flex gap-[5px] px-3">
        {QWERTY[1].split("").map((key) => (
          <span key={key} className={cn(KEY, "flex-1")}>
            {key}
          </span>
        ))}
      </div>
      <div className="flex gap-[5px]">
        <span className={cn(KEY_DARK, "w-9 shrink-0")}>
          <ArrowFatUpIcon className="size-3.5" />
        </span>
        <div className="flex flex-1 gap-[5px] px-1">
          {QWERTY[2].split("").map((key) => (
            <span key={key} className={cn(KEY, "flex-1")}>
              {key}
            </span>
          ))}
        </div>
        <span className={cn(KEY_DARK, "w-9 shrink-0")}>
          <BackspaceIcon className="size-3.5" />
        </span>
      </div>
      <div className="flex gap-[5px]">
        <span className={cn(KEY_DARK, "w-12 shrink-0")}>123</span>
        <span className={cn(KEY, "flex-1 text-[11px]")}>space</span>
        {email ? (
          <>
            <span className={cn(KEY, "w-8 shrink-0")}>@</span>
            <span className={cn(KEY, "w-8 shrink-0")}>.</span>
          </>
        ) : null}
        <span className={cn(KEY_DARK, "w-14 shrink-0")}>return</span>
      </div>
    </div>
  );
}

const PAD_LETTERS = ["", "ABC", "DEF", "GHI", "JKL", "MNO", "PQRS", "TUV", "WXYZ"];

function NumberPad({ kind }: { kind: "tel" | "decimal" | "numeric" }) {
  const corner = kind === "tel" ? "+*#" : kind === "decimal" ? "." : "";

  return (
    <div className="grid grid-cols-3 gap-1 px-1">
      {PAD_LETTERS.map((letters, index) => (
        <span key={index} className={cn(KEY, "h-8 flex-col gap-0 leading-none")}>
          <span className="text-[16px]">{index + 1}</span>
          {kind === "tel" || kind === "numeric" ? (
            <span className="h-2 text-[7px] tracking-[0.12em]">{letters}</span>
          ) : null}
        </span>
      ))}
      <span
        className={cn(
          corner ? KEY : "",
          "h-8 text-[15px]",
          !corner && "flex items-center justify-center"
        )}
      >
        {corner}
      </span>
      <span className={cn(KEY, "h-8 text-[17px]")}>0</span>
      <span className="flex h-8 items-center justify-center text-foreground">
        <BackspaceIcon className="size-5" />
      </span>
    </div>
  );
}

function Keyboard({
  kind,
  suggestion,
}: {
  kind: KeyboardKind;
  suggestion: string;
}) {
  return (
    <div className="flex h-full flex-col gap-2 bg-neutral-200/90 px-1 pt-1.5 dark:bg-neutral-800/95">
      <div className="flex h-7 items-center justify-center text-[11px] text-foreground">
        {suggestion ? (
          <span className="rounded-md px-2 py-1 tabular-nums">{suggestion}</span>
        ) : null}
      </div>
      {kind === "text" || kind === "email" ? (
        <LetterKeyboard email={kind === "email"} />
      ) : (
        <NumberPad kind={kind} />
      )}
    </div>
  );
}

export function InputKeyboardDemo() {
  const [attrs, setAttrs] = useState<Attrs>("generic");
  const [selected, setSelected] = useState<number | null>(null);
  const [view, setView] = useState({ zoomed: false, x: 0, y: 0, shift: 0 });
  const fieldRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const specific = attrs === "specific";
  const field = selected === null ? null : PHONE_FIELDS[selected];

  function select(index: number) {
    const el = fieldRefs.current[index];
    if (!el) return;
    setSelected(index);
    // iOS Safari zooms until the text reads as 16px, and stays zoomed after.
    const zoomed = view.zoomed || !specific;
    const x = specific ? view.x : el.offsetLeft;
    const y = specific ? view.y : el.offsetTop;
    const scale = zoomed ? ZOOM : 1;
    // Then it scrolls the field above the keyboard.
    const bottom = y + (el.offsetTop + el.offsetHeight - y) * scale;
    const room = SCREEN_HEIGHT - KEYBOARD_HEIGHT - 16;
    setView({ zoomed, x, y, shift: Math.max(0, bottom - room) });
  }

  function deselect() {
    setSelected(null);
    setView((v) => ({ ...v, shift: 0 }));
  }

  function changeAttrs(next: Attrs) {
    setAttrs(next);
    setSelected(null);
    setView({ zoomed: false, x: 0, y: 0, shift: 0 });
  }

  return (
    <Demo className="gap-7 px-4 sm:px-8">
      <div className="rounded-[36px] bg-card p-2 shadow-(--custom-shadow)">
        <div
          className="relative w-[264px] overflow-clip rounded-[28px] bg-background"
          style={{ height: SCREEN_HEIGHT }}
        >
          <div
            className="flex h-full flex-col gap-2.5 px-4 pt-5 transition-transform duration-300 ease-snappy motion-reduce:transition-none"
            onClick={(event) => {
              if (event.target === event.currentTarget) deselect();
            }}
            style={{
              transform: `translateY(${-view.shift}px) scale(${view.zoomed ? ZOOM : 1})`,
              transformOrigin: `${view.x}px ${view.y}px`,
            }}
          >
            <span className="pb-1 text-sm font-medium">Checkout</span>
            {PHONE_FIELDS.map((item, index) => (
              <div key={item.id} className="flex flex-col gap-1">
                <span className="text-[11px] text-muted-foreground">
                  {item.label}
                </span>
                <button
                  ref={(el) => {
                    fieldRefs.current[index] = el;
                  }}
                  aria-label={`${item.label} field`}
                  aria-pressed={selected === index}
                  className={cn(
                    "flex h-9 w-full cursor-text items-center rounded-lg bg-card px-3 text-left text-muted-foreground/60 shadow-(--custom-shadow) outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-foreground dark:bg-muted/40",
                    specific ? "text-base" : "text-sm",
                    selected === index &&
                      "shadow-[0_0_0_1.5px_var(--color-foreground)]"
                  )}
                  onClick={() => select(index)}
                  type="button"
                >
                  {selected === index ? (
                    <span className="-ml-px mr-px h-[1.1em] w-0.5 rounded-full bg-foreground" />
                  ) : null}
                  {item.placeholder}
                </button>
              </div>
            ))}
          </div>

          <div
            aria-hidden="true"
            className={cn(
              "absolute inset-x-0 bottom-0 transition-transform duration-300 ease-snappy motion-reduce:transition-none",
              field ? "translate-y-0" : "translate-y-full"
            )}
            style={{ height: KEYBOARD_HEIGHT }}
          >
            <Keyboard
              kind={field && specific ? field.keyboard : "text"}
              suggestion={field && specific ? field.suggestion : ""}
            />
          </div>
        </div>
      </div>

      <p className="flex h-4 max-w-full items-center truncate font-mono text-[11px] text-muted-foreground">
        {field
          ? specific
            ? `<input ${field.attrs}>`
            : '<input type="text"> at 14px'
          : "Tap a field"}
      </p>

      <SegmentedControl
        ariaLabel="Input attributes"
        onChange={changeAttrs}
        options={ATTR_OPTIONS}
        value={attrs}
      />
    </Demo>
  );
}
