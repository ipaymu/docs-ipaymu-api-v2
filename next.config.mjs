import { createMDX } from 'fumadocs-mdx/next';
import utwm from 'unplugin-tailwindcss-mangle/webpack';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  webpack: (config, { dev }) => {
    if (!dev) {
      config.plugins.push(utwm());
    }
    return config;
  },
};

export default withMDX(config);
