import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "storage", // Internal Docker name
        port: "9000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost", // What the browser actually calls
        port: "9000",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
