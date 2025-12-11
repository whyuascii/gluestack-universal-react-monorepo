// Base domain configuration - update these constants for your application
const BASE_DOMAIN = "demo-app.com";
const LOCAL_PORT = 3000;

/**
 * Builds a domain URL based on environment stage
 *
 * @param options - Configuration object for domain building
 * @param options.environmentStage - The environment stage (production, staging, sandbox, demo, preview, dev-*, etc.)
 * @param options.subdomain - Optional subdomain to prepend (e.g., "api", "admin")
 * @param options.useDevEnvNames - Whether to use dev environment names or treat dev-* as staging (defaults to true)
 * @returns The full domain URL
 */
export const buildDomainUrl = (
  options: {
    environmentStage?: string;
    subdomain?: string;
    useDevEnvNames?: boolean;
  } = {}
): string => {
  const { environmentStage, subdomain, useDevEnvNames = true } = options;
  let domain: string;

  if (!environmentStage || environmentStage === "other") {
    domain = `staging.${BASE_DOMAIN}`;
  } else if (environmentStage === "local" || environmentStage === "localhost") {
    return `localhost:${LOCAL_PORT}`;
  } else if (environmentStage.startsWith("dev-")) {
    if (useDevEnvNames) {
      const devEnvironment = environmentStage.replace("dev-", "");
      domain = `${devEnvironment}.staging.${BASE_DOMAIN}`;
    } else {
      domain = `staging.${BASE_DOMAIN}`;
    }
  } else if (environmentStage === "production") {
    domain = BASE_DOMAIN;
  } else if (["staging", "sandbox", "demo", "preview"].includes(environmentStage)) {
    domain = `${environmentStage}.${BASE_DOMAIN}`;
  } else {
    // Default fallback for other environments
    domain = `${environmentStage}.staging.${BASE_DOMAIN}`;
  }

  if (subdomain) {
    return `${subdomain}.${domain}`;
  }

  return domain;
};

/**
 * Builds a full URL with protocol based on environment stage
 *
 * @param options - Configuration object for URL building
 * @param options.environmentStage - The environment stage
 * @param options.subdomain - Optional subdomain to prepend
 * @param options.path - Optional path to append (should start with /)
 * @param options.protocol - Protocol to use (defaults to https)
 * @returns The full URL
 */
export const buildUrl = (
  options: {
    environmentStage?: string;
    subdomain?: string;
    path?: string;
    protocol?: "http" | "https";
  } = {}
): string => {
  const { environmentStage, subdomain, path, protocol } = options;

  // Determine the protocol - use http for local environments unless explicitly overridden
  const finalProtocol =
    protocol ||
    (environmentStage === "local" || environmentStage === "localhost" ? "http" : "https");

  const domain = buildDomainUrl({ environmentStage, subdomain });
  const basePath = path || "";

  return `${finalProtocol}://${domain}${basePath}`;
};
