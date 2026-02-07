#!/usr/bin/env npx tsx
/**
 * Environment Variable Validator
 *
 * Validates that required environment variables are set correctly.
 * Run with: pnpm env:check
 */

import * as fs from "fs";
import * as path from "path";

// =============================================================================
// Configuration
// =============================================================================

interface EnvVar {
  name: string;
  required: boolean;
  description: string;
  validate?: (value: string) => boolean;
  errorMessage?: string;
}

const REQUIRED_VARS: EnvVar[] = [
  // Database
  {
    name: "DATABASE_URL",
    required: true,
    description: "PostgreSQL connection string",
    validate: (v) => v.startsWith("postgresql://") || v.startsWith("postgres://"),
    errorMessage: "Must be a valid PostgreSQL connection string",
  },

  // Authentication
  {
    name: "BETTER_AUTH_SECRET",
    required: true,
    description: "Better Auth secret key",
    validate: (v) => v.length >= 32,
    errorMessage: "Must be at least 32 characters",
  },
  {
    name: "BETTER_AUTH_URL",
    required: true,
    description: "Better Auth API URL",
    validate: (v) => v.startsWith("http://") || v.startsWith("https://"),
    errorMessage: "Must be a valid URL",
  },

  // URLs
  {
    name: "NEXT_PUBLIC_API_URL",
    required: true,
    description: "API URL for web client",
    validate: (v) => v.startsWith("http://") || v.startsWith("https://"),
    errorMessage: "Must be a valid URL",
  },
  {
    name: "EXPO_PUBLIC_API_URL",
    required: true,
    description: "API URL for mobile client",
    validate: (v) => v.startsWith("http://") || v.startsWith("https://"),
    errorMessage: "Must be a valid URL",
  },
  {
    name: "NEXT_PUBLIC_APP_URL",
    required: true,
    description: "Web app URL",
    validate: (v) => v.startsWith("http://") || v.startsWith("https://"),
    errorMessage: "Must be a valid URL",
  },

  // CORS
  {
    name: "TRUSTED_ORIGINS",
    required: true,
    description: "Trusted origins for CORS",
    validate: (v) => v.length > 0,
    errorMessage: "Must not be empty",
  },

  // Email
  {
    name: "RESEND_API_KEY",
    required: true,
    description: "Resend API key for transactional emails",
    validate: (v) => v.startsWith("re_"),
    errorMessage: "Must be a valid Resend API key (starts with re_)",
  },
  {
    name: "EMAIL_FROM_ADDRESS",
    required: true,
    description: "Email sender address",
    validate: (v) => v.includes("@"),
    errorMessage: "Must be a valid email address",
  },
];

const OPTIONAL_VARS: EnvVar[] = [
  // OAuth
  { name: "GOOGLE_CLIENT_ID", required: false, description: "Google OAuth client ID" },
  { name: "GOOGLE_CLIENT_SECRET", required: false, description: "Google OAuth client secret" },
  { name: "GITHUB_CLIENT_ID", required: false, description: "GitHub OAuth client ID" },
  { name: "GITHUB_CLIENT_SECRET", required: false, description: "GitHub OAuth client secret" },

  // Analytics (Web + API use NEXT_PUBLIC_*, Mobile uses EXPO_PUBLIC_*)
  { name: "NEXT_PUBLIC_POSTHOG_KEY", required: false, description: "PostHog API key (web + API)" },
  { name: "EXPO_PUBLIC_POSTHOG_KEY", required: false, description: "PostHog API key (mobile)" },

  // Push Notifications (Novu + Expo Push)
  { name: "NOVU_SECRET_KEY", required: false, description: "Novu secret key" },
  { name: "NOVU_APP_ID", required: false, description: "Novu app ID" },

  // Subscriptions
  { name: "NEXT_PUBLIC_REVENUECAT_API_KEY", required: false, description: "RevenueCat web key" },
  {
    name: "EXPO_PUBLIC_REVENUECAT_API_KEY_IOS",
    required: false,
    description: "RevenueCat iOS key",
  },
  {
    name: "EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID",
    required: false,
    description: "RevenueCat Android key",
  },
];

// =============================================================================
// Validation Logic
// =============================================================================

function loadEnvFile(): Record<string, string> {
  const envPath = path.join(process.cwd(), ".env");

  if (!fs.existsSync(envPath)) {
    return {};
  }

  const content = fs.readFileSync(envPath, "utf-8");
  const vars: Record<string, string> = {};

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const [, key, value] = match;
      // Remove quotes if present
      vars[key.trim()] = value.trim().replace(/^["']|["']$/g, "");
    }
  }

  return vars;
}

function validateVar(
  envVar: EnvVar,
  value: string | undefined
): { valid: boolean; message?: string } {
  if (!value || value.trim() === "") {
    if (envVar.required) {
      return { valid: false, message: "Missing required variable" };
    }
    return { valid: true };
  }

  if (envVar.validate && !envVar.validate(value)) {
    return { valid: false, message: envVar.errorMessage || "Invalid value" };
  }

  return { valid: true };
}

// =============================================================================
// Main
// =============================================================================

function main() {
  console.log("\n🔍 Validating environment configuration...\n");

  // Load from .env file and process.env
  const fileVars = loadEnvFile();
  const env = { ...fileVars, ...process.env };

  let hasErrors = false;
  const warnings: string[] = [];

  // Check required variables
  console.log("Required Variables:");
  console.log("─".repeat(60));

  for (const envVar of REQUIRED_VARS) {
    const value = env[envVar.name];
    const result = validateVar(envVar, value);

    if (result.valid) {
      const displayValue = value
        ? value.length > 20
          ? value.substring(0, 20) + "..."
          : value
        : "";
      console.log(`  ✅ ${envVar.name}`);
    } else {
      console.log(`  ❌ ${envVar.name}: ${result.message}`);
      console.log(`     └─ ${envVar.description}`);
      hasErrors = true;
    }
  }

  // Check optional variables
  console.log("\nOptional Variables:");
  console.log("─".repeat(60));

  const enabledFeatures: string[] = [];
  const disabledFeatures: string[] = [];

  // Group by feature
  const features: Record<string, { vars: string[]; enabled: boolean }> = {
    "Google OAuth": {
      vars: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
      enabled: false,
    },
    "GitHub OAuth": {
      vars: ["GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET"],
      enabled: false,
    },
    Analytics: {
      vars: ["NEXT_PUBLIC_POSTHOG_KEY", "EXPO_PUBLIC_POSTHOG_KEY"],
      enabled: false,
    },
    "Push Notifications": {
      vars: ["NOVU_SECRET_KEY", "NOVU_APP_ID"],
      enabled: false,
    },
    "Subscriptions (Web)": {
      vars: ["NEXT_PUBLIC_REVENUECAT_API_KEY"],
      enabled: false,
    },
    "Subscriptions (iOS)": {
      vars: ["EXPO_PUBLIC_REVENUECAT_API_KEY_IOS"],
      enabled: false,
    },
    "Subscriptions (Android)": {
      vars: ["EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID"],
      enabled: false,
    },
  };

  for (const [feature, config] of Object.entries(features)) {
    const hasAny = config.vars.some((v) => env[v] && env[v].trim() !== "");
    const hasAll = config.vars.every((v) => env[v] && env[v].trim() !== "");

    if (hasAll) {
      console.log(`  ✅ ${feature}: Enabled`);
      enabledFeatures.push(feature);
    } else if (hasAny) {
      console.log(`  ⚠️  ${feature}: Partially configured`);
      const missing = config.vars.filter((v) => !env[v] || env[v].trim() === "");
      console.log(`     └─ Missing: ${missing.join(", ")}`);
      warnings.push(`${feature} is partially configured`);
    } else {
      console.log(`  ⬚  ${feature}: Disabled`);
      disabledFeatures.push(feature);
    }
  }

  // Summary
  console.log("\n" + "═".repeat(60));
  console.log("Summary:");
  console.log("─".repeat(60));

  if (hasErrors) {
    console.log("\n❌ Configuration has errors. Fix the required variables above.\n");
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.log("\n⚠️  Warnings:");
    for (const warning of warnings) {
      console.log(`   - ${warning}`);
    }
  }

  console.log("\n✅ All required variables are configured correctly!\n");

  if (enabledFeatures.length > 0) {
    console.log("Enabled features: " + enabledFeatures.join(", "));
  }
  if (disabledFeatures.length > 0) {
    console.log("Disabled features: " + disabledFeatures.join(", "));
  }

  console.log("\n");
  process.exit(0);
}

main();
