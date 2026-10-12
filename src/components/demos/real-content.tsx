"use client";

import { ImageIcon } from "@phosphor-icons/react";
import Image, { type StaticImageData } from "next/image";
import { useState } from "react";

import cliffWalk from "@/assets/claude-monet-cliff-walk-pourville.jpg";
import lilies from "@/assets/claude-monet-water-lilies.jpg";
import lime from "@/assets/gradient-lime.jpg";
import mint from "@/assets/gradient-mint.jpg";
import peach from "@/assets/gradient-peach.jpg";
import reeded from "@/assets/gradient-reeded.jpg";
import violet from "@/assets/gradient-violet.jpg";
import { RIGHT_ICON, WRONG_ICON } from "@/components/app/compare";
import { Demo } from "@/components/app/demo";
import { SegmentedControl } from "@/components/app/segmented-control";
import { cn } from "@/lib/utils";

type Data = "ideal" | "real" | "fixed";

const DATA_OPTIONS = [
  { value: "ideal", label: "Ideal data" },
  { value: "real", label: "Real data", icon: WRONG_ICON },
  { value: "fixed", label: "Fixed", icon: RIGHT_ICON },
] as const;

const DIVIDER = "border-[#E7E7E7] dark:border-[#1E1E1E]";

const plural = new Intl.PluralRules("en-US");
const number = new Intl.NumberFormat("en-US");

function count(n: number, one: string, other: string) {
  return `${number.format(n)} ${plural.select(n) === "one" ? one : other}`;
}

function initials(text: string) {
  const words = text.split(/[\s@.]+/).filter(Boolean);
  const letters = text.includes("@")
    ? [words[0]?.[0]]
    : [words[0]?.[0], words.length > 1 ? words[words.length - 1][0] : ""];
  return letters.join("").toUpperCase();
}

/* A team list: the same markup with mock data, real data, and fixed CSS. */

type Person = {
  name: string;
  email: string;
  role: string;
  tasks: number;
  avatar: StaticImageData | null;
};

const IDEAL_PEOPLE: Person[] = [
  { name: "Jane Doe", email: "jane@acme.com", role: "Designer", tasks: 12, avatar: peach },
  { name: "Marco Silva", email: "marco@acme.com", role: "Engineer", tasks: 8, avatar: violet },
  { name: "Ana Ruiz", email: "ana@acme.com", role: "Product", tasks: 5, avatar: mint },
  { name: "Tom Lee", email: "tom@acme.com", role: "Support", tasks: 3, avatar: lime },
];

const REAL_PEOPLE: Person[] = [
  {
    name: "Maximiliane Wolfeschlegelsteinhausen-Bergdorff",
    email: "max@acme.com",
    role: "Senior Staff Engineer, Platform",
    tasks: 1284,
    avatar: peach,
  },
  { name: "", email: "kx7q@proton.me", role: "Contractor", tasks: 0, avatar: null },
  {
    name: "Siobhán Ní Bhriain",
    email: "siobhan@acme.de",
    role: "Kundenbetreuungsteamleiterin",
    tasks: 1,
    avatar: null,
  },
  { name: "山田 花子", email: "hanako@acme.jp", role: "デザイナー", tasks: 27, avatar: lilies },
];

function NaiveRow({ person }: { person: Person }) {
  // What usually ships: `truncate` is there, but nothing lets the text shrink.
  return (
    <li className="flex h-14 items-center gap-3 px-4">
      {person.avatar ? (
        <Image
          alt=""
          className="size-8 rounded-full"
          sizes="32px"
          src={person.avatar}
        />
      ) : (
        <span className="size-8 rounded-full bg-muted" />
      )}
      <div className="flex flex-col">
        <span className="truncate text-xs font-medium text-foreground">
          {person.name}
        </span>
        <span className="truncate text-xs text-muted-foreground">
          {person.role}
        </span>
      </div>
      <span className="ml-auto text-xs whitespace-nowrap text-muted-foreground">
        {person.tasks} tasks
      </span>
    </li>
  );
}

function FixedRow({ person }: { person: Person }) {
  const name = person.name || person.email;
  return (
    <li className="flex h-14 items-center gap-3 px-4">
      {person.avatar ? (
        <Image
          alt=""
          className="size-8 shrink-0 rounded-full object-cover"
          sizes="32px"
          src={person.avatar}
        />
      ) : (
        <span
          aria-hidden="true"
          className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-medium text-muted-foreground"
        >
          {initials(name)}
        </span>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <span
          className="truncate text-xs font-medium text-foreground"
          title={name}
        >
          {name}
        </span>
        <span className="truncate text-xs text-muted-foreground" title={person.role}>
          {person.role}
        </span>
      </div>
      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
        {person.tasks === 0 ? "No tasks" : count(person.tasks, "task", "tasks")}
      </span>
    </li>
  );
}

export function RealContentDemo() {
  const [data, setData] = useState<Data>("ideal");
  const people = data === "ideal" ? IDEAL_PEOPLE : REAL_PEOPLE;
  const Row = data === "fixed" ? FixedRow : NaiveRow;

  return (
    <Demo className="gap-8 px-4 sm:px-8">
      <div className="w-full max-w-sm overflow-hidden rounded-xl bg-card shadow-(--custom-shadow)">
        <div
          className={cn(
            "flex h-11 items-center gap-2 border-b px-4 text-xs font-medium text-foreground",
            DIVIDER
          )}
        >
          Team
          <span className="text-muted-foreground tabular-nums">
            {people.length}
          </span>
        </div>
        <ul className="py-1">
          {people.map((person) => (
            <Row key={person.email} person={person} />
          ))}
        </ul>
      </div>

      <SegmentedControl
        ariaLabel="Data"
        onChange={setData}
        options={DATA_OPTIONS}
        value={data}
      />
    </Demo>
  );
}

/* A grid of saved images: mock placeholders, real uploads, fixed CSS. */

type Pin = {
  id: string;
  title: string;
  saves: number;
  image: StaticImageData | null;
};

const IDEAL_PINS: Pin[] = [
  { id: "a", title: "Lorem ipsum", saves: 12, image: null },
  { id: "b", title: "Dolor sit amet", saves: 8, image: null },
  { id: "c", title: "Consectetur", saves: 24, image: null },
  { id: "d", title: "Adipiscing elit", saves: 5, image: null },
];

const REAL_PINS: Pin[] = [
  {
    id: "lilies",
    title: "Water lilies, the full Orangerie panorama, scanned at 600 dpi (final v3)",
    saves: 12480,
    image: lilies,
  },
  { id: "reeded", title: "", saves: 1, image: reeded },
  {
    id: "cliff",
    title: "Klippenwanderung bei Pourville",
    saves: 0,
    image: cliffWalk,
  },
  { id: "heic", title: "IMG_2041.HEIC", saves: 3, image: null },
];

const IMAGE_SIZES = "(min-width: 640px) 140px, 45vw";
const CARD =
  "flex flex-col gap-2 rounded-xl bg-card p-1.5 pb-2.5 shadow-(--custom-shadow)";

function NaivePin({ pin, ideal }: { pin: Pin; ideal: boolean }) {
  return (
    <li className={CARD}>
      {ideal ? (
        <div className="aspect-video w-full rounded-lg bg-muted" />
      ) : pin.image ? (
        <Image
          alt=""
          className="h-auto w-full rounded-lg"
          sizes={IMAGE_SIZES}
          src={pin.image}
        />
      ) : null}
      <p className="px-1 text-xs leading-4 font-medium text-foreground">
        {pin.title}
      </p>
      <p className="px-1 text-xs text-muted-foreground">{pin.saves} saves</p>
    </li>
  );
}

function FixedPin({ pin }: { pin: Pin }) {
  return (
    <li className={cn(CARD, "min-w-0")}>
      {pin.image ? (
        <Image
          alt=""
          className="aspect-4/3 h-auto w-full rounded-lg object-cover"
          sizes={IMAGE_SIZES}
          src={pin.image}
        />
      ) : (
        <div className="grid aspect-4/3 w-full place-items-center rounded-lg bg-muted">
          <ImageIcon
            aria-hidden="true"
            className="size-5 text-muted-foreground"
          />
        </div>
      )}
      <p
        className={cn(
          "line-clamp-2 h-8 px-1 text-xs leading-4 font-medium break-words",
          pin.title ? "text-foreground" : "text-muted-foreground"
        )}
        title={pin.title || undefined}
      >
        {pin.title || "Untitled"}
      </p>
      <p className="mt-auto px-1 text-xs text-muted-foreground tabular-nums">
        {pin.saves === 0 ? "No saves" : count(pin.saves, "save", "saves")}
      </p>
    </li>
  );
}

export function RealContentGridDemo() {
  const [data, setData] = useState<Data>("ideal");
  const pins = data === "ideal" ? IDEAL_PINS : REAL_PINS;

  return (
    <Demo className="gap-8 px-4 sm:px-8">
      {/* Top-aligned in a box as tall as the tallest mode, so the toggle
          below never jumps. */}
      <div className="flex min-h-96 w-full max-w-xl items-start sm:min-h-46">
        <ul className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
          {pins.map((pin) =>
            data === "fixed" ? (
              <FixedPin key={pin.id} pin={pin} />
            ) : (
              <NaivePin key={pin.id} ideal={data === "ideal"} pin={pin} />
            )
          )}
        </ul>
      </div>

      <SegmentedControl
        ariaLabel="Data"
        onChange={setData}
        options={DATA_OPTIONS}
        value={data}
      />
    </Demo>
  );
}
