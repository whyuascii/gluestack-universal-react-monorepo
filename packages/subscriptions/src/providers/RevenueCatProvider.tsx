// TypeScript needs a single entry point, but at runtime
// Metro/Webpack will resolve to .native.tsx or .web.tsx
// Export types from native (as the default for type checking)
export * from "./RevenueCatProvider.native";
