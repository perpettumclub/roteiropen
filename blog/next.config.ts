import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/blog",
  assetPrefix: "/blog",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
