export class HealthActions {
  static async check() {
    return {
      status: "ok" as const,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
    };
  }
}
