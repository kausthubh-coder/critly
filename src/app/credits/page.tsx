import type { Metadata } from "next";

const TITLE = "Credits";
const DESCRIPTION = "The projects and people Critly is built on.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/credits" },
  openGraph: {
    type: "website",
    title: TITLE,
    description: DESCRIPTION,
    url: "/credits",
    images: ["/og/credits"],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og/credits"],
  },
};

type Credit = {
  name: string;
  url: string;
  domain: string;
  description: string;
};

type Group = {
  heading: string;
  credits: Credit[];
};

const GROUPS: Group[] = [
  {
    heading: "Built on",
    credits: [
      {
        name: "Craft",
        url: "https://github.com/gustavo-fior/craft",
        domain: "github.com",
        description:
          "Gustavo Fior's library, where the site, the demo framework and the first concepts started (MIT)",
      },
    ],
  },
  {
    heading: "The check learns from",
    credits: [
      {
        name: "lintapple",
        url: "https://github.com/gholtzap/lintapple",
        domain: "github.com",
        description:
          "Checks the rendered page against an explicit design policy",
      },
      {
        name: "@shadcn/lint",
        url: "https://github.com/shadcn-ui/lint",
        domain: "github.com",
        description:
          "Lint errors written as instructions an agent can follow",
      },
    ],
  },
  {
    heading: "Writing that shaped the concepts",
    credits: [
      {
        name: "Rauno Freiberg",
        url: "https://rauno.me",
        domain: "rauno.me",
        description: "Design engineer at Vercel",
      },
      {
        name: "Emil Kowalski",
        url: "https://emilkowal.ski",
        domain: "emilkowal.ski",
        description: "Design engineer at Linear",
      },
      {
        name: "Jakub Krehel",
        url: "https://jakub.kr",
        domain: "jakub.kr",
        description: "Founding Design Engineer at Interfere",
      },
      {
        name: "Paco Coursey",
        url: "https://paco.me",
        domain: "paco.me",
        description: "Design engineer at Linear",
      },
      {
        name: "Shu Ding",
        url: "https://shud.in",
        domain: "shud.in",
        description: "Engineer at Vercel",
      },
      {
        name: "Benji Taylor",
        url: "https://benji.org",
        domain: "benji.org",
        description: "Design at X",
      },
      {
        name: "Raphael Salaja",
        url: "https://www.raphaelsalaja.com",
        domain: "raphaelsalaja.com",
        description: "Design engineer at Warp",
      },
    ],
  },
];

export default function CreditsPage() {
  return (
    <article>
      <h1 className="text-base font-medium">Credits</h1>
      <p className="mt-3 text-sm text-muted-foreground text-pretty">
        Critly stands on other people&apos;s work. Each concept page also lists
        the posts it draws from.
      </p>
      <div className="mt-8 flex flex-col gap-10">
        {GROUPS.map((group) => (
          <section key={group.heading}>
            <h2 className="text-sm font-medium">{group.heading}</h2>
            <ul className="mt-2 flex flex-col">
              {group.credits.map((credit) => (
                <li key={credit.url}>
                  <a
                    href={credit.url}
                    target="_blank"
                    rel="noreferrer"
                    className="-mx-3 flex items-center gap-3 rounded-md px-3 py-3 hover:bg-muted text-pretty pr-4"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${credit.domain}&sz=64`}
                      alt=""
                      width={16}
                      height={16}
                      loading="lazy"
                      className="size-4 shrink-0 rounded-[3px]"
                    />
                    <span className="min-w-0 text-sm">
                      <span className="text-foreground">{credit.name}</span>
                      <span className="text-muted-foreground mx-2">{"∙"}</span>
                      <span className="text-muted-foreground">
                        {credit.description}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </article>
  );
}
