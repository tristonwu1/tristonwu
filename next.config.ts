import type { NextConfig } from "next";
import os from "os";

/** Lets phones on local Wi‑Fi load `/_next` assets in `next dev`. */
function localDevOrigins(): string[] {
  const origins = new Set<string>([
    "localhost",
    "127.0.0.1",
    "localhost:3000",
    "127.0.0.1:3000",
  ]);

  for (const entries of Object.values(os.networkInterfaces())) {
    if (!entries) continue;
    for (const entry of entries) {
      if (entry.family === "IPv4" && !entry.internal) {
        origins.add(entry.address);
        origins.add(`${entry.address}:3000`);
      }
    }
  }

  return [...origins];
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  ...(process.env.NODE_ENV === "development"
    ? { allowedDevOrigins: localDevOrigins() }
    : {}),
};

export default nextConfig;
