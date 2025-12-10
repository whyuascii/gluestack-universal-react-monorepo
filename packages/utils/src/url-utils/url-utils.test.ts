import { describe, expect, it } from "vitest";
import { buildDomainUrl, buildUrl } from "./index";

describe("buildDomainUrl", () => {
	describe("without subdomain", () => {
		it("should return staging domain for undefined environment stage", () => {
			const result = buildDomainUrl();
			expect(result).toBe("staging.demo-app.com");
		});

		it("should return staging domain for 'other' environment stage", () => {
			const result = buildDomainUrl({ environmentStage: "other" });
			expect(result).toBe("staging.demo-app.com");
		});

		it("should return staging domain for 'staging' environment stage", () => {
			const result = buildDomainUrl({ environmentStage: "staging" });
			expect(result).toBe("staging.demo-app.com");
		});

		it("should return production domain for 'production' environment stage", () => {
			const result = buildDomainUrl({ environmentStage: "production" });
			expect(result).toBe("demo-app.com");
		});

		it("should return sandbox domain for 'sandbox' environment stage", () => {
			const result = buildDomainUrl({ environmentStage: "sandbox" });
			expect(result).toBe("sandbox.demo-app.com");
		});

		it("should return demo domain for 'demo' environment stage", () => {
			const result = buildDomainUrl({ environmentStage: "demo" });
			expect(result).toBe("demo.demo-app.com");
		});

		it("should return preview domain for 'preview' environment stage", () => {
			const result = buildDomainUrl({ environmentStage: "preview" });
			expect(result).toBe("preview.demo-app.com");
		});

		it("should return dev environment domain for dev- prefixed environment stage", () => {
			const result = buildDomainUrl({ environmentStage: "dev-test-branch" });
			expect(result).toBe("test-branch.staging.demo-app.com");
		});

		it("should return custom environment domain for other environment stages", () => {
			const result = buildDomainUrl({ environmentStage: "custom-env" });
			expect(result).toBe("custom-env.staging.demo-app.com");
		});
	});

	describe("with subdomain", () => {
		it("should prepend subdomain to production domain", () => {
			const result = buildDomainUrl({ environmentStage: "production", subdomain: "api" });
			expect(result).toBe("api.demo-app.com");
		});

		it("should prepend subdomain to staging domain", () => {
			const result = buildDomainUrl({ environmentStage: "staging", subdomain: "internal-api" });
			expect(result).toBe("internal-api.staging.demo-app.com");
		});

		it("should prepend subdomain to sandbox domain", () => {
			const result = buildDomainUrl({ environmentStage: "sandbox", subdomain: "reporting" });
			expect(result).toBe("reporting.sandbox.demo-app.com");
		});

		it("should prepend subdomain to dev environment domain", () => {
			const result = buildDomainUrl({ environmentStage: "dev-feature-branch", subdomain: "api" });
			expect(result).toBe("api.feature-branch.staging.demo-app.com");
		});
	});

	describe("useDevEnvNames parameter", () => {
		it("should use dev environment names when useDevEnvNames is true (default)", () => {
			const result = buildDomainUrl({ environmentStage: "dev-test-branch" });
			expect(result).toBe("test-branch.staging.demo-app.com");
		});

		it("should use dev environment names when useDevEnvNames is explicitly true", () => {
			const result = buildDomainUrl({ environmentStage: "dev-test-branch", useDevEnvNames: true });
			expect(result).toBe("test-branch.staging.demo-app.com");
		});

		it("should use staging domain when useDevEnvNames is false", () => {
			const result = buildDomainUrl({ environmentStage: "dev-test-branch", useDevEnvNames: false });
			expect(result).toBe("staging.demo-app.com");
		});

		it("should use staging domain with subdomain when useDevEnvNames is false", () => {
			const result = buildDomainUrl({
				environmentStage: "dev-feature-branch",
				subdomain: "api",
				useDevEnvNames: false
			});
			expect(result).toBe("api.staging.demo-app.com");
		});

		it("should not affect non-dev environments when useDevEnvNames is false", () => {
			const result = buildDomainUrl({ environmentStage: "production", useDevEnvNames: false });
			expect(result).toBe("demo-app.com");
		});

		it("should not affect staging environment when useDevEnvNames is false", () => {
			const result = buildDomainUrl({ environmentStage: "staging", useDevEnvNames: false });
			expect(result).toBe("staging.demo-app.com");
		});

		it("should not affect sandbox environment when useDevEnvNames is false", () => {
			const result = buildDomainUrl({ environmentStage: "sandbox", useDevEnvNames: false });
			expect(result).toBe("sandbox.demo-app.com");
		});
	});

	describe("local development environments", () => {
		it("should return localhost:3000 for 'local' environment stage", () => {
			const result = buildDomainUrl({ environmentStage: "local" });
			expect(result).toBe("localhost:3000");
		});

		it("should return localhost:3000 for 'localhost' environment stage", () => {
			const result = buildDomainUrl({ environmentStage: "localhost" });
			expect(result).toBe("localhost:3000");
		});

		it("should ignore subdomain for local environments", () => {
			const result = buildDomainUrl({ environmentStage: "local", subdomain: "api" });
			expect(result).toBe("localhost:3000");
		});

		it("should ignore subdomain for localhost environments", () => {
			const result = buildDomainUrl({ environmentStage: "localhost", subdomain: "internal-api" });
			expect(result).toBe("localhost:3000");
		});
	});
});

describe("buildUrl", () => {
	describe("default protocol (https)", () => {
		it("should build full URL with https protocol", () => {
			const result = buildUrl({ environmentStage: "production" });
			expect(result).toBe("https://demo-app.com");
		});

		it("should build full URL with subdomain", () => {
			const result = buildUrl({ environmentStage: "production", subdomain: "api" });
			expect(result).toBe("https://api.demo-app.com");
		});

		it("should build full URL with path", () => {
			const result = buildUrl({ environmentStage: "production", path: "/settings/calendar/callback" });
			expect(result).toBe("https://demo-app.com/settings/calendar/callback");
		});

		it("should build full URL with subdomain and path", () => {
			const result = buildUrl({ environmentStage: "staging", subdomain: "api", path: "/v1/health" });
			expect(result).toBe("https://api.staging.demo-app.com/v1/health");
		});
	});

	describe("custom protocol", () => {
		it("should build full URL with http protocol", () => {
			const result = buildUrl({ environmentStage: "staging", protocol: "http" });
			expect(result).toBe("http://staging.demo-app.com");
		});

		it("should build full URL with http protocol, subdomain and path", () => {
			const result = buildUrl({ environmentStage: "staging", subdomain: "api", path: "/test", protocol: "http" });
			expect(result).toBe("http://api.staging.demo-app.com/test");
		});
	});

	describe("environment-specific scenarios", () => {
		it("should build URL for dev environment", () => {
			const result = buildUrl({
				environmentStage: "dev-feature",
				subdomain: "internal-api",
				path: "/v1/calendar-integrations"
			});
			expect(result).toBe("https://internal-api.feature.staging.demo-app.com/v1/calendar-integrations");
		});

		it("should build URL for sandbox environment", () => {
			const result = buildUrl({ environmentStage: "sandbox", path: "/login" });
			expect(result).toBe("https://sandbox.demo-app.com/login");
		});

		it("should build URL for undefined environment (defaults to staging)", () => {
			const result = buildUrl({ subdomain: "www", path: "/" });
			expect(result).toBe("https://www.staging.demo-app.com/");
		});

		it("should build URL with no options (defaults to staging)", () => {
			const result = buildUrl();
			expect(result).toBe("https://staging.demo-app.com");
		});
	});

	describe("local development environments", () => {
		it("should build URL with http protocol for local environment", () => {
			const result = buildUrl({ environmentStage: "local" });
			expect(result).toBe("http://localhost:3000");
		});

		it("should build URL with http protocol for localhost environment", () => {
			const result = buildUrl({ environmentStage: "localhost" });
			expect(result).toBe("http://localhost:3000");
		});

		it("should build URL with path for local environment", () => {
			const result = buildUrl({ environmentStage: "local", path: "/settings/calendar/callback" });
			expect(result).toBe("http://localhost:3000/settings/calendar/callback");
		});

		it("should ignore subdomain for local environments", () => {
			const result = buildUrl({ environmentStage: "local", subdomain: "api", path: "/v1/health" });
			expect(result).toBe("http://localhost:3000/v1/health");
		});

		it("should allow explicit protocol override for local environments", () => {
			const result = buildUrl({ environmentStage: "local", protocol: "https" });
			expect(result).toBe("https://localhost:3000");
		});
	});
});
