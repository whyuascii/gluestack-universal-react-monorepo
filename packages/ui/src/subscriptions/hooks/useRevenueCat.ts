// TypeScript needs a single entry point, but at runtime
// Metro/Webpack will resolve to .native.ts or .web.ts
// Export types from native (as the default for type checking)
export * from "./useRevenueCat.native";
