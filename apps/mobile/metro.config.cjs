const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

// Find the monorepo root
const monorepoRoot = path.resolve(__dirname, "../..");

const config = getDefaultConfig(__dirname);

// Watch all files in the monorepo
config.watchFolders = [monorepoRoot];

// Ensure node_modules from both the app and root are resolved
// IMPORTANT: monorepo root must come FIRST to ensure singleton packages resolve correctly
config.resolver.nodeModulesPaths = [
  path.resolve(monorepoRoot, "node_modules"),
  path.resolve(__dirname, "node_modules"),
];

// Critical packages that must resolve to a single instance to share React context
const singletonPackages = [
  "react",
  "react-dom",
  "react-native",
  "react-native-svg",
  "@tanstack/react-query",
  "react-native-safe-area-context",
  "@react-navigation/native",
  "@react-navigation/core",
];

// Build extraNodeModules to ensure all packages resolve to the same instance
config.resolver.extraNodeModules = {};

// Map singleton packages to monorepo root
for (const pkg of singletonPackages) {
  config.resolver.extraNodeModules[pkg] = path.resolve(monorepoRoot, "node_modules", pkg);
}

// Resolve workspace packages to their source directories
// This ensures Metro bundles from source, not dist, so all imports use the same context
const workspacePackages = [
  "@app/ui",
  "@app/auth",
  "@app/components",
  "@app/i18n",
  "@app/analytics",
  "@app/subscriptions",
  "@app/notifications",
  "@app/config",
  "@app/core-contract",
];

for (const pkg of workspacePackages) {
  const pkgName = pkg.replace("@app/", "");
  config.resolver.extraNodeModules[pkg] = path.resolve(monorepoRoot, "packages", pkgName);
}

// Custom resolver to ensure React and related packages always resolve to monorepo root
// This prevents duplicate React instances which break hooks
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Check if module is a singleton package or a subpath of one (e.g., react/jsx-runtime)
  for (const pkg of singletonPackages) {
    if (moduleName === pkg || moduleName.startsWith(pkg + "/")) {
      try {
        const resolvedPath = require.resolve(moduleName, {
          paths: [path.resolve(monorepoRoot, "node_modules")],
        });
        return {
          filePath: resolvedPath,
          type: "sourceFile",
        };
      } catch (e) {
        // Fall back to default resolution if not found
        break;
      }
    }
  }

  // Default resolution for everything else
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });
