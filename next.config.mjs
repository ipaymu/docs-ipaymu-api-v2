import { createMDX } from "fumadocs-mdx/next";
import utwm from "unplugin-tailwindcss-mangle/webpack";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  output: process.env.NEXT_OUTPUT === "export" ? "export" : "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  basePath: process.env.BASE_PATH || "",
  webpack: (config, { dev }) => {
    if (!dev) {
      config.plugins.push(utwm());
    }
    return config;
  },
};

export default withMDX(config);
