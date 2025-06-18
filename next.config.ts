import type { NextConfig } from "next";
const { PrismaPlugin } = require("@prisma/nextjs-monorepo-workaround-plugin");

console.log("Logging the env vars:", JSON.stringify(process.env, null, 2));

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
      config.plugins = [...config.plugins, new PrismaPlugin()];
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
