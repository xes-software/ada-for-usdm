import type { NextConfig } from "next";

validateEnv();

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.experiments = {
      asyncWebAssembly: true,
      topLevelAwait: true,
      layers: true,
    };
    if (isServer) {
      config.plugins = [...config.plugins];
    }
    // fix warnings for async functions in the browser (https://github.com/vercel/next.js/issues/64792)
    if (!isServer) {
      config.output.environment = {
        ...config.output.environment,
        asyncFunction: true,
      };
    }
    return config;
  },
};

export default nextConfig;

function validateEnv() {
  const requiredEnvVars = [
    "DATABASE_URL",
    "MAESTRO_CARDANO_API_KEY",
    "NEXT_PUBLIC_CARDANO_NETWORK",
    "NODE_ENV",
  ];
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
}
