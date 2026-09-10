import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // The matrix was replaced by the pairing reels; keep old links alive.
    return [{ source: "/matrix", destination: "/pairing", permanent: false }];
  },
};

export default nextConfig;
