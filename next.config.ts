import type { NextConfig } from 'next';

const srcRoot = `${process.cwd()}/src`;

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
    resolveAlias: {
      '@': srcRoot,
    },
  },
  webpack(config) {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      '@': srcRoot,
    };

    return config;
  },
};

export default nextConfig;
