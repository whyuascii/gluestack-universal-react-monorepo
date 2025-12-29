import { withGluestackUI } from "@gluestack/ui-next-adapter";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: [
    "@app/ui",
    "@app/i18n",
    "@app/analytics",
    "@app/components",
    "@app/auth",
    "@app/subscriptions",
    "nativewind",
    "@gluestack-ui/core",
    "@gluestack-ui/utils",
    "react-native-svg",
    "react-native-css-interop",
    "react-native-reanimated",
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

    // Ensure single instance of React Query across all packages
    if (!isServer) {
      config.resolve.alias["@tanstack/react-query"] = require.resolve("@tanstack/react-query");
    }

    return config;
  },
};

export default withGluestackUI(nextConfig);
