import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      fs: './lib/empty.ts',
      net: './lib/empty.ts',
      tls: './lib/empty.ts',
      dns: './lib/empty.ts',
      child_process: './lib/empty.ts',
      'pg-native': './lib/empty.ts',
      'sodium-native': './lib/empty.ts',
      'require-addon': './lib/empty.ts',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Suppress harmless Stellar crypto native module warnings from cluttering Vercel deployment logs
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      { module: /sodium-native/ },
      { module: /require-addon/ },
      { message: /Critical dependency/ }
    ];

    if (!isServer) {
      // stellar-sdk relies on Node.js-native modules not present in the browser.
      // We tell webpack to ignore them so the browser bundle compiles cleanly.
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        'pg-native': false,
        'sodium-native': false,
        'require-addon': false,
      };
    }
    return config;
  },
};

export default nextConfig;
