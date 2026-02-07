/**
 * Commitlint Configuration
 *
 * Enforces conventional commit format:
 *   type(scope): description
 *
 * Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build
 *
 * Examples:
 *   feat: add user authentication
 *   fix(api): resolve database connection timeout
 *   docs: update README with setup instructions
 *   chore(deps): bump dependencies
 */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Enforce lowercase for type
    "type-case": [2, "always", "lower-case"],
    // Enforce lowercase for subject
    "subject-case": [2, "always", "lower-case"],
    // No period at end of subject
    "subject-full-stop": [2, "never", "."],
    // Max header length
    "header-max-length": [2, "always", 100],
    // Allowed types
    "type-enum": [
      2,
      "always",
      [
        "feat", // New feature
        "fix", // Bug fix
        "docs", // Documentation only
        "style", // Formatting, no code change
        "refactor", // Code change, no new feature or bug fix
        "test", // Adding tests
        "chore", // Maintenance tasks
        "perf", // Performance improvement
        "ci", // CI/CD changes
        "build", // Build system changes
        "revert", // Revert previous commit
      ],
    ],
  },
};
