import { withContentCollections } from "@content-collections/next";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/goats", destination: "/credits", permanent: true }];
  },
  images: {
    remotePatterns: [{ hostname: "**" }],
  },
};

export default withContentCollections(nextConfig);
