import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import { allConcepts } from "content-collections";
import { Analytics } from "@vercel/analytics/next";

import { JsonLd } from "@/components/app/json-ld";
import { Providers } from "@/components/app/providers";
import { SiteShell } from "@/components/app/site-shell";
import { groupBySection } from "@/lib/sections";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

import "./globals.css";

const inter = localFont({
  src: [
    {
      path: "../../public/fonts/InterVariable.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../../public/fonts/InterVariable-Italic.woff2",
      weight: "100 900",
      style: "italic",
    },
  ],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s • ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: ["/og/index"],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/og/index"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const sections = groupBySection(
    allConcepts.map(({ title, slug, section, order }) => ({
      title,
      slug,
      section,
      order,
    }))
  );
  const sourcePaths = Object.fromEntries(
    allConcepts.map((c) => [c.slug, c.sourcePath])
  );

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE_NAME,
            description: SITE_DESCRIPTION,
            url: SITE_URL,
            author: {
              "@type": "Person",
              name: "Kausthubh",
              url: "https://github.com/kausthubh-coder",
            },
          }}
        />
        <Providers>
          <SiteShell sections={sections} sourcePaths={sourcePaths}>
            {children}
          </SiteShell>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
