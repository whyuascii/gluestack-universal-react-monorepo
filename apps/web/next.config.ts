import createMDX from "@next/mdx";
import { withGluestackUI } from "@gluestack/ui-next-adapter";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
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
    "@app/config",
    "@app/subscriptions",
    "@app/notifications",
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
    // Note: Don't alias react/react-dom - Next.js handles this internally
    if (!isServer) {
      config.resolve.alias["@tanstack/react-query"] = require.resolve("@tanstack/react-query");
    }

    // Fix for "Cannot redefine property" errors during SSR
    // Force deterministic module IDs to prevent duplicate definitions
    config.optimization = {
      ...config.optimization,
      moduleIds: "deterministic",
    };

    return config;
  },
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

export default withMDX(withGluestackUI(nextConfig));
