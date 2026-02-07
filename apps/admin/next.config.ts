import { withGluestackUI } from "@gluestack/ui-next-adapter";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: [
    "@app/components",
    "@app/core-contract",
    "nativewind",
    "@gluestack-ui/core",
    "@gluestack-ui/utils",
    "react-native-svg",
    "react-native-css-interop",
    "react-native-safe-area-context",
  ],
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Transform all direct `react-native` imports to `react-native-web`
      "react-native$": "react-native-web",
    };
    config.resolve.extensions = [
      ".web.js",
      ".web.jsx",
      ".web.ts",
      ".web.tsx",
      ...config.resolve.extensions,
    ];

    // Ensure single instance of React Query (client only)
    if (!isServer) {
      config.resolve.alias["@tanstack/react-query"] = require.resolve("@tanstack/react-query");
    }

    return config;
  },
};

export default withGluestackUI(nextConfig);
