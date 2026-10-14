"use client";

import { Barlow, Barlow_Condensed, DM_Serif_Display } from "next/font/google";
import { useEffect, useRef, useState } from "react";

import { RIGHT_ICON, WRONG_ICON } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { ScaledPage } from "@/components/demos/scaled-page";
import { cn } from "@/lib/utils";

// Two fictional products with unrelated looks. Each page renders at its real
// size (1440 x 900 or 390 x 844) and is scaled down, so the type sizes and
// the fold are the real ones.

const body = Barlow({ subsets: ["latin"], weight: ["400", "600"] });
const condensed = Barlow_Condensed({ subsets: ["latin"], weight: "700" });
const serif = DM_Serif_Display({ subsets: ["latin"], weight: "400" });

type Version = "weak" | "strong";
type Device = "desktop" | "phone";
type ProductKey = "fieldbook" | "kilnwise";

const VERSIONS = [
  { value: "weak", label: "Weak", icon: WRONG_ICON },
  { value: "strong", label: "Strong", icon: RIGHT_ICON },
] as const;

const DEVICES = [
  { value: "desktop", label: "1440 × 900" },
  { value: "phone", label: "390 × 844" },
] as const;

const PRODUCTS = [
  { value: "fieldbook", label: "Fieldbook" },
  { value: "kilnwise", label: "Kilnwise" },
] as const;

const SIZE = {
  desktop: { width: 1440, height: 900 },
  phone: { width: 390, height: 844 },
} as const;

type Look = {
  ground: string;
  ink: string;
  muted: string;
  grey: string;
  button: string;
  link: string;
  headlineFont: string;
  blob: string;
  panel: string;
  nextGround: string;
};

const LOOKS: Record<ProductKey, Look> = {
  fieldbook: {
    ground: "#eaf5ec",
    ink: "#0f2e1c",
    muted: "#2f4d3b",
    grey: "#566a5d",
    button: "bg-[#1d6b3a] text-white",
    link: "text-[#0f2e1c]",
    headlineFont: condensed.className,
    blob: "radial-gradient(40% 50% at 25% 35%, #b9e4c5 0%, transparent 70%), radial-gradient(35% 45% at 78% 60%, #c9ecd3 0%, transparent 70%)",
    panel: "bg-white text-[#0f2e1c]",
    nextGround: "#ffffff",
  },
  kilnwise: {
    ground: "#1838a8",
    ink: "#ffffff",
    muted: "#dbe3ff",
    grey: "#b4c3f5",
    button: "bg-[#ffb547] text-[#1f1300]",
    link: "text-white",
    headlineFont: serif.className,
    blob: "radial-gradient(40% 50% at 22% 30%, #3557d1 0%, transparent 70%), radial-gradient(35% 45% at 80% 65%, #2b4bc4 0%, transparent 70%)",
    panel: "bg-[#0f2575] text-white",
    nextGround: "#0f2575",
  },
};

const COPY = {
  fieldbook: {
    name: "Fieldbook",
    weak: {
      eyebrow: "Introducing Fieldbook 2.0",
      headline: "Reimagine how your team works in the field",
      body: "Fieldbook is the all-in-one platform that empowers teams to collect, manage and analyze data with ease.",
    },
    strong: {
      headline: "Survey plots offline. Map them back at camp.",
      body: "Fieldbook is a survey app for field ecologists. Record species and counts per quadrat with no signal, and it maps them when you're back online.",
      action: "Start a free survey",
      secondary: "See a sample report",
      next: "From quadrat to report in one afternoon",
    },
  },
  kilnwise: {
    name: "Kilnwise",
    weak: {
      eyebrow: "Introducing Kilnwise AI",
      headline: "Where creativity meets efficiency",
      body: "Kilnwise is the modern platform that helps creative teams streamline their workflow and do more of what they love.",
    },
    strong: {
      headline: "Kiln shelves, booked by the inch.",
      body: "Kilnwise runs firing schedules for shared pottery studios. Members book shelf space, and get a text when their firing has cooled.",
      action: "Set up your studio",
      secondary: "Watch a firing get booked",
      next: "Every shelf, every firing, one calendar",
    },
  },
} as const;

const CHECKS = [
  { label: "Says what it is", weak: false, strong: true },
  { label: "Says who it's for", weak: false, strong: true },
  { label: "Shows the product", weak: false, strong: true },
  { label: "One next step", weak: false, strong: true },
  { label: "The next section peeks in", weak: false, strong: true },
] as const;

const SIZES: Record<Device, Record<Version, string>> = {
  desktop: {
    weak: "Body 14px · headline 44px",
    strong: "Body 20px · headline 72px",
  },
  phone: {
    weak: "Body 14px · headline 32px",
    strong: "Body 17px · headline 40px",
  },
};

export function FirstScreenDemo() {
  const [version, setVersion] = useState<Version>("weak");
  const [device, setDevice] = useState<Device>("desktop");
  const [product, setProduct] = useState<ProductKey>("fieldbook");
  const [flash, setFlash] = useState<"idle" | "running" | "asked">("idle");
  const curtainRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const current = timers.current;
    return () => current.forEach(clearTimeout);
  }, []);

  function runFlash() {
    const curtain = curtainRef.current;
    if (!curtain) return;
    timers.current.forEach(clearTimeout);
    setFlash("running");
    curtain.style.opacity = "1";
    // Cover, wait, uncover for about 50ms, cover again. Set on the element
    // directly so React's render timing doesn't stretch the 50ms.
    timers.current = [
      setTimeout(() => {
        curtain.style.opacity = "0";
        timers.current.push(
          setTimeout(() => {
            curtain.style.opacity = "1";
            setFlash("asked");
          }, 50)
        );
      }, 700),
    ];
  }

  function reveal() {
    if (curtainRef.current) curtainRef.current.style.opacity = "0";
    setFlash("idle");
  }

  const { width, height } = SIZE[device];
  const look = LOOKS[product];

  return (
    <Demo className="gap-6 px-4 sm:px-8">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <SegmentedControl
          ariaLabel="Product"
          onChange={setProduct}
          options={PRODUCTS}
          value={product}
        />
        <SegmentedControl
          ariaLabel="Screen size"
          onChange={setDevice}
          options={DEVICES}
          value={device}
        />
      </div>

      <div className="relative flex h-[360px] w-full items-center justify-center sm:h-[372px]">
        {device === "desktop" ? (
          <div className="w-full overflow-hidden rounded-lg ring-1 ring-black/10 dark:ring-white/15">
            <ScaledPage
              height={height}
              label={`${COPY[product].name} landing page at ${width} by ${height}`}
              width={width}
            >
              <Page device="desktop" look={look} product={product} version={version} />
            </ScaledPage>
          </div>
        ) : (
          <div className="h-full overflow-hidden rounded-[18px] ring-1 ring-black/10 dark:ring-white/15">
            <ScaledPage
              fit="height"
              height={height}
              label={`${COPY[product].name} landing page at ${width} by ${height}`}
              width={width}
            >
              <Page device="phone" look={look} product={product} version={version} />
            </ScaledPage>
          </div>
        )}

        <div
          ref={curtainRef}
          aria-hidden="true"
          className={cn(
            "absolute inset-0 flex items-center justify-center rounded-lg bg-muted opacity-0",
            flash === "idle" && "pointer-events-none"
          )}
        >
          {flash === "asked" ? (
            <span className="max-w-[30ch] px-6 text-center text-sm text-foreground">
              What was it, and who is it for?
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <SegmentedControl
          ariaLabel="Version"
          onChange={setVersion}
          options={VERSIONS}
          value={version}
        />
        <button
          className="inline-flex h-8 cursor-pointer items-center rounded-full bg-muted px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground max-sm:h-11"
          onClick={flash === "asked" ? reveal : runFlash}
          type="button"
        >
          {flash === "asked" ? "Show it again" : "Flash it for 50ms"}
        </button>
      </div>

      <div className="grid w-full max-w-md gap-2">
        <ul className="grid gap-1.5 sm:grid-cols-2 sm:gap-x-6">
          {CHECKS.map((check) => (
            <li
              key={check.label}
              className="flex items-center gap-2 text-xs text-foreground"
            >
              {check[version] ? RIGHT_ICON : WRONG_ICON}
              <span>
                {check.label}
                <span className="sr-only">
                  {check[version] ? ": yes" : ": no"}
                </span>
              </span>
            </li>
          ))}
        </ul>
        <span className="text-xs text-muted-foreground tabular-nums">
          {SIZES[device][version]}
        </span>
      </div>
    </Demo>
  );
}

function Page({
  device,
  look,
  product,
  version,
}: {
  device: Device;
  look: Look;
  product: ProductKey;
  version: Version;
}) {
  const copy = COPY[product];
  const phone = device === "phone";
  const { width, height } = SIZE[device];

  return (
    <div
      className={cn("relative overflow-hidden", body.className)}
      style={{
        width,
        height,
        background: version === "weak" ? `${look.blob}, ${look.ground}` : look.ground,
        color: look.ink,
      }}
    >
      {version === "weak" ? (
        <WeakPage copy={copy} look={look} phone={phone} />
      ) : (
        <StrongPage copy={copy} look={look} phone={phone} product={product} />
      )}
    </div>
  );
}

type Copy = (typeof COPY)[ProductKey];

function Wordmark({ name, look, size }: { name: string; look: Look; size: number }) {
  return (
    <span className={look.headlineFont} style={{ fontSize: size }}>
      {name}
    </span>
  );
}

function WeakPage({ copy, look, phone }: { copy: Copy; look: Look; phone: boolean }) {
  return (
    <div className="absolute inset-0">
      <div
        className={cn(
          "flex items-center justify-between",
          phone ? "h-[60px] px-5" : "h-[72px] px-12"
        )}
      >
        <Wordmark look={look} name={copy.name} size={phone ? 22 : 24} />
        {phone ? (
          <span className="grid gap-[5px]">
            <span className="block h-[2px] w-6" style={{ background: look.ink }} />
            <span className="block h-[2px] w-6" style={{ background: look.ink }} />
            <span className="block h-[2px] w-6" style={{ background: look.ink }} />
          </span>
        ) : (
          <>
            <span className="flex gap-8 text-[14px]" style={{ color: look.muted }}>
              <span>Product</span>
              <span>Solutions</span>
              <span>Resources</span>
              <span>Pricing</span>
              <span>Company</span>
            </span>
            <span className="flex items-center gap-5 text-[14px]">
              <span>Log in</span>
              <span className={cn("rounded-md px-4 py-2.5", look.button)}>
                Get started
              </span>
            </span>
          </>
        )}
      </div>

      <div
        className={cn(
          "flex flex-col items-center text-center",
          phone ? "gap-5 px-6 pt-[150px]" : "gap-6 pt-[230px]"
        )}
      >
        <span
          className="rounded-full border px-3 py-1 text-[13px]"
          style={{ color: look.muted, borderColor: look.grey }}
        >
          ✦ {copy.weak.eyebrow}
        </span>
        <p
          className={cn(
            "max-w-[16ch] leading-[1.1] font-semibold text-balance",
            phone ? "text-[32px]" : "text-[44px]"
          )}
        >
          {copy.weak.headline}
        </p>
        <p
          className={cn("max-w-[52ch] text-[14px] leading-[1.6]")}
          style={{ color: look.grey }}
        >
          {copy.weak.body}
        </p>
        <span
          className={cn(
            "mt-2 flex gap-3 text-[14px]",
            phone && "w-full flex-col"
          )}
        >
          <span className={cn("rounded-md px-5 py-3", look.button)}>
            Get started
          </span>
          <span className={cn("rounded-md px-5 py-3", look.button)}>
            Book a demo
          </span>
        </span>
      </div>
    </div>
  );
}

function StrongPage({
  copy,
  look,
  phone,
  product,
}: {
  copy: Copy;
  look: Look;
  phone: boolean;
  product: ProductKey;
}) {
  const s = copy.strong;
  const Visual = product === "fieldbook" ? FieldbookVisual : KilnwiseVisual;

  if (phone) {
    return (
      <div className="absolute inset-0">
        <div className="flex h-[60px] items-center justify-between px-5">
          <Wordmark look={look} name={copy.name} size={24} />
          <span className="text-[16px] font-semibold">Sign in</span>
        </div>
        <div className="flex flex-col gap-5 px-5 pt-6">
          <p className={cn("text-[40px] leading-[1.02] text-balance", look.headlineFont)}>
            {s.headline}
          </p>
          <p className="text-[17px] leading-[1.45]" style={{ color: look.muted }}>
            {s.body}
          </p>
          <span
            className={cn(
              "flex h-[52px] items-center justify-center rounded-lg text-[17px] font-semibold",
              look.button
            )}
          >
            {s.action}
          </span>
          <div className="mt-3">
            <Visual look={look} phone />
          </div>
        </div>
        <div
          className="mt-10 h-[400px] px-5 pt-8"
          style={{ background: look.nextGround }}
        >
          <span className={cn("text-[28px] leading-[1.1]", look.headlineFont)}>
            {s.next}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      <div className="flex h-[72px] items-center justify-between px-16">
        <Wordmark look={look} name={copy.name} size={28} />
        <span className="flex items-center gap-10 text-[17px]">
          <span>How it works</span>
          <span>Pricing</span>
          <span>Customers</span>
          <span className="font-semibold">Sign in</span>
        </span>
      </div>
      <div className="grid grid-cols-[1fr_640px] items-center gap-14 px-16 pt-[64px]">
        <div className="flex flex-col gap-7">
          <p className={cn("max-w-[13ch] text-[72px] leading-[1.02]", look.headlineFont)}>
            {s.headline}
          </p>
          <p className="max-w-[34ch] text-[20px] leading-[1.5]" style={{ color: look.muted }}>
            {s.body}
          </p>
          <span className="flex items-center gap-7 text-[18px]">
            <span
              className={cn("rounded-lg px-7 py-4 font-semibold", look.button)}
            >
              {s.action}
            </span>
            <span className={cn("underline underline-offset-4", look.link)}>
              {s.secondary}
            </span>
          </span>
        </div>
        <Visual look={look} />
      </div>
      <div
        className="absolute inset-x-0 top-[790px] h-[300px] px-16 pt-12"
        style={{ background: look.nextGround }}
      >
        <span className={cn("text-[40px]", look.headlineFont)}>{s.next}</span>
      </div>
    </div>
  );
}

const SPECIES = [
  ["Festuca rubra", "34%"],
  ["Plantago lanceolata", "12%"],
  ["Lotus corniculatus", "8%"],
  ["Trifolium repens", "6%"],
] as const;

function FieldbookVisual({ look, phone = false }: { look: Look; phone?: boolean }) {
  return (
    <div className={cn("flex gap-5", phone ? "flex-col" : "items-end")}>
      <div
        className={cn(
          "flex flex-col gap-3 rounded-2xl p-5 shadow-[0_12px_32px_rgba(15,46,28,0.15)]",
          look.panel,
          phone ? "w-full" : "w-[340px]"
        )}
      >
        <span className="flex items-center justify-between text-[15px]">
          <span className="font-semibold">Plot 14 · Quadrat 3</span>
          <span className="rounded-full bg-[#eaf5ec] px-2 py-0.5 text-[13px]">
            Offline
          </span>
        </span>
        {(phone ? SPECIES.slice(0, 2) : SPECIES).map(([name, cover]) => (
          <span
            key={name}
            className="flex items-center justify-between border-t border-[#d5e6da] pt-3 text-[16px]"
          >
            <span className="italic">{name}</span>
            <span className="tabular-nums">{cover}</span>
          </span>
        ))}
        <span className="mt-1 rounded-lg bg-[#1d6b3a] py-2.5 text-center text-[15px] font-semibold text-white">
          Add species
        </span>
      </div>
      {phone ? null : (
        <div className="relative h-[360px] w-[280px] overflow-hidden rounded-2xl bg-[#d4ead9] shadow-[0_12px_32px_rgba(15,46,28,0.15)]">
          <svg aria-hidden="true" className="absolute inset-0 size-full" viewBox="0 0 240 300" preserveAspectRatio="xMidYMid slice">
            <path d="M0 210 C60 180 90 230 150 200 S220 160 240 170" fill="none" stroke="#9cc9a8" strokeWidth="14" />
            <path d="M20 0 C40 80 10 140 60 300" fill="none" stroke="#b7dcc1" strokeWidth="6" />
            {[
              [70, 60],
              [120, 90],
              [170, 70],
              [90, 140],
              [150, 150],
              [190, 120],
            ].map(([x, y], index) => (
              <rect key={index} fill={index === 3 ? "#1d6b3a" : "#ffffff"} height="18" rx="3" stroke="#1d6b3a" strokeWidth="2" width="18" x={x} y={y} />
            ))}
          </svg>
          <span className="absolute bottom-3 left-3 rounded-md bg-white px-2 py-1 text-[13px] text-[#0f2e1c]">
            6 plots · synced 18:42
          </span>
        </div>
      )}
    </div>
  );
}

const SHELVES = [
  [
    ["Ama", 3],
    ["Joss", 2],
    ["", 2],
  ],
  [
    ["Priya", 4],
    ["Theo", 3],
  ],
  [
    ["Studio", 5],
    ["", 2],
  ],
] as const;

function KilnwiseVisual({ look, phone = false }: { look: Look; phone?: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl p-6",
        look.panel,
        phone ? "w-full" : "w-[640px]"
      )}
    >
      <span className="flex items-center justify-between text-[16px]">
        <span className="font-semibold">Glaze firing · Thu 18:00</span>
        <span className="text-[#dbe3ff]">Cone 6</span>
      </span>
      <div className={cn("grid gap-4", phone ? "grid-cols-1" : "grid-cols-[1fr_200px]")}>
        <div className="flex flex-col gap-2">
          {SHELVES.map((shelf, row) => (
            <div key={row} className={cn("flex gap-1.5 rounded-md bg-[#0a1b57] p-1.5", phone ? "h-11" : "h-[76px]")}>
              {shelf.map(([who, inches], index) => (
                <span
                  key={index}
                  className={cn(
                    "flex items-center justify-center rounded text-[14px]",
                    who ? "bg-[#ffb547] text-[#1f1300]" : "border border-dashed border-[#8fa2e6] text-[#dbe3ff]"
                  )}
                  style={{ flex: inches }}
                >
                  {who ? `${who} · ${inches}″` : "free"}
                </span>
              ))}
            </div>
          ))}
        </div>
        {phone ? null : (
          <div className="flex flex-col justify-between rounded-md bg-[#0a1b57] p-3">
            <svg aria-hidden="true" className="h-[180px] w-full" preserveAspectRatio="none" viewBox="0 0 176 90">
              <path d="M0 86 L60 40 L100 8 L118 8 L176 80" fill="none" stroke="#ffb547" strokeWidth="3" vectorEffect="non-scaling-stroke" />
            </svg>
            <span className="text-[13px] text-[#dbe3ff]">Cool by Sat 09:00</span>
          </div>
        )}
      </div>
    </div>
  );
}
