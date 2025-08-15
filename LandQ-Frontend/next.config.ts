import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  webpack: (config, { isServer }) => {
    // Preserve existing externals
    config.externals = config.externals || [];
    config.externals.push('pino-pretty', 'lokijs', 'encoding');

    if (isServer) {
      // On the server side, we need to handle native modules
      config.externals.push({
        '@lazai-labs/alith-darwin-arm64': 'commonjs @lazai-labs/alith-darwin-arm64',
      });
    } else {
      // On the client side, we don't want to bundle native modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@lazai-labs/alith-darwin-arm64': false,
        'alith': false,
      };
    }

    return config;

  },

       // Disable Turbopack
/*  turbo: {
      enabled: false,
    }, */

  // Mark these packages as external for server components
  serverExternalPackages: ['@lazai-labs/alith-darwin-arm64', 'alith'],
};

export default nextConfig;
