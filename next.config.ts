import { withContentCollections } from "@content-collections/next";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/goats", destination: "/credits", permanent: true },
      { source: "/shadows-not-borders", destination: "/edges-and-elevation", permanent: true },
      { source: "/shadows-not-borders.md", destination: "/edges-and-elevation.md", permanent: true },
      { source: "/taste-is-trained", destination: "/how-to-get-references", permanent: true },
      { source: "/taste-is-trained.md", destination: "/how-to-get-references.md", permanent: true },
    ];
  },
  images: {
    remotePatterns: [{ hostname: "**" }],
  },
};

export default withContentCollections(nextConfig);
