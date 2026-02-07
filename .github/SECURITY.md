# Security Policy

## Supported Versions

We actively maintain and provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please report security vulnerabilities by emailing:

- **Email**: security@yourdomain.com (update with your actual security contact)

### What to Include

Please include the following information in your report:

1. **Description**: A clear description of the vulnerability
2. **Steps to Reproduce**: Detailed steps to reproduce the issue
3. **Impact**: The potential impact of the vulnerability
4. **Affected Components**: Which parts of the codebase are affected
5. **Suggested Fix**: If you have suggestions for fixing the issue

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: 24-48 hours
  - High: 7 days
  - Medium: 30 days
  - Low: Next release

### What to Expect

1. **Acknowledgment**: We'll confirm receipt of your report
2. **Investigation**: We'll investigate and validate the vulnerability
3. **Fix Development**: We'll develop and test a fix
4. **Disclosure**: We'll coordinate disclosure timing with you
5. **Credit**: We'll credit you in our security advisories (unless you prefer anonymity)

## Security Best Practices

### For Contributors

- Never commit secrets, API keys, or credentials
- Use environment variables for sensitive configuration
- Follow the principle of least privilege
- Keep dependencies up to date
- Review code for common vulnerabilities (OWASP Top 10)

### For Deployers

- Use HTTPS everywhere
- Enable rate limiting
- Configure proper CORS settings
- Use secure session management
- Regularly rotate secrets and API keys
- Monitor for suspicious activity

## Security Features

This project includes:

- **Authentication**: Better Auth with secure session management
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Zod schema validation on all inputs
- **CORS**: Configurable cross-origin resource sharing
- **SQL Injection Prevention**: Parameterized queries via Drizzle ORM
- **XSS Prevention**: React's built-in XSS protection + proper escaping

## Acknowledgments

We thank all security researchers who responsibly disclose vulnerabilities.
