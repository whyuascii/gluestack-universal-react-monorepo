# Email Guide

Complete reference for Resend email integration in this boilerplate.

## Overview

Transactional email is powered by [Resend](https://resend.com), providing:

- React Email templates (component-based)
- Transactional email sending
- Email verification for auth
- Password reset emails
- Marketing and notification emails

## Architecture

```
packages/mailer/
├── src/
│   ├── index.ts              # Main exports
│   ├── client.ts             # Resend client
│   ├── send.ts               # Send functions
│   └── templates/
│       ├── base/
│       │   └── Layout.tsx    # Base email layout
│       ├── auth/
│       │   ├── Welcome.tsx
│       │   ├── VerifyEmail.tsx
│       │   └── ResetPassword.tsx
│       ├── transactional/
│       │   └── Notification.tsx
│       └── index.ts          # Template exports
```

## Configuration

### Environment Variables

```bash
# Required
RESEND_API_KEY=re_xxxxx

# Email settings
EMAIL_FROM_ADDRESS=hello@yourdomain.com
EMAIL_FROM_NAME=Your App Name
```

### Domain Verification

1. Go to [resend.com/domains](https://resend.com/domains)
2. Add your domain
3. Add DNS records (SPF, DKIM, DMARC)
4. Wait for verification (usually minutes)

## Usage

### Sending Email

```typescript
import { sendEmail } from "@app/mailer";

await sendEmail({
  to: "user@example.com",
  subject: "Welcome!",
  template: "welcome",
  data: {
    name: "John",
    appName: "Your App",
  },
});
```

### Send with React Component

```typescript
import { sendEmail } from "@app/mailer";
import { WelcomeEmail } from "@app/mailer/templates";

await sendEmail({
  to: "user@example.com",
  subject: "Welcome to the app!",
  react: <WelcomeEmail name="John" />,
});
```

### Available Send Functions

```typescript
import {
  sendEmail, // Generic send
  sendWelcomeEmail, // After signup
  sendVerificationEmail, // Email verification
  sendPasswordResetEmail, // Password reset
  sendNotificationEmail, // General notifications
} from "@app/mailer";

// Welcome email
await sendWelcomeEmail({
  to: user.email,
  name: user.name,
});

// Verification email
await sendVerificationEmail({
  to: user.email,
  name: user.name,
  verificationUrl: `https://app.com/verify?token=${token}`,
});

// Password reset
await sendPasswordResetEmail({
  to: user.email,
  name: user.name,
  resetUrl: `https://app.com/reset?token=${token}`,
});
```

## Email Templates

### Base Layout

All emails extend a common layout:

```tsx
// packages/mailer/src/templates/base/Layout.tsx
import { Html, Head, Body, Container, Section, Text, Link, Img } from "@react-email/components";

interface LayoutProps {
  children: React.ReactNode;
  preview?: string;
}

export function Layout({ children, preview }: LayoutProps) {
  return (
    <Html>
      <Head />
      {preview && <Preview>{preview}</Preview>}
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          <Img src="https://yourdomain.com/logo.png" width="120" height="40" alt="Logo" />

          {/* Content */}
          {children}

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>&copy; {new Date().getFullYear()} Your Company</Text>
            <Link href="https://yourdomain.com/unsubscribe">Unsubscribe</Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: "sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "600px",
};

const footer = {
  textAlign: "center" as const,
  marginTop: "40px",
};

const footerText = {
  color: "#8898aa",
  fontSize: "12px",
};
```

### Creating Templates

```tsx
// packages/mailer/src/templates/auth/Welcome.tsx
import { Text, Button, Section } from "@react-email/components";
import { Layout } from "../base/Layout";

interface WelcomeEmailProps {
  name: string;
  appName?: string;
}

export function WelcomeEmail({ name, appName = "Your App" }: WelcomeEmailProps) {
  return (
    <Layout preview={`Welcome to ${appName}!`}>
      <Section>
        <Text style={heading}>Welcome to {appName}!</Text>

        <Text style={paragraph}>
          Hi {name}, thanks for signing up. We're excited to have you on board.
        </Text>

        <Button href="https://yourdomain.com/dashboard" style={button}>
          Get Started
        </Button>

        <Text style={paragraph}>If you have any questions, just reply to this email.</Text>
      </Section>
    </Layout>
  );
}

const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  marginBottom: "24px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "1.5",
  marginBottom: "16px",
};

const button = {
  backgroundColor: "#4CAF50",
  borderRadius: "4px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  padding: "12px 24px",
  display: "inline-block",
};
```

### Verification Email

```tsx
// packages/mailer/src/templates/auth/VerifyEmail.tsx
import { Text, Button, Section, Code } from "@react-email/components";
import { Layout } from "../base/Layout";

interface VerifyEmailProps {
  name: string;
  verificationUrl: string;
  verificationCode?: string;
}

export function VerifyEmail({ name, verificationUrl, verificationCode }: VerifyEmailProps) {
  return (
    <Layout preview="Verify your email address">
      <Section>
        <Text style={heading}>Verify your email</Text>

        <Text style={paragraph}>
          Hi {name}, please verify your email address by clicking the button below.
        </Text>

        <Button href={verificationUrl} style={button}>
          Verify Email
        </Button>

        {verificationCode && (
          <>
            <Text style={paragraph}>Or enter this code manually:</Text>
            <Code style={code}>{verificationCode}</Code>
          </>
        )}

        <Text style={smallText}>
          This link expires in 24 hours. If you didn't create an account, you can safely ignore this
          email.
        </Text>
      </Section>
    </Layout>
  );
}
```

### Password Reset Email

```tsx
// packages/mailer/src/templates/auth/ResetPassword.tsx
import { Text, Button, Section } from "@react-email/components";
import { Layout } from "../base/Layout";

interface ResetPasswordProps {
  name: string;
  resetUrl: string;
}

export function ResetPassword({ name, resetUrl }: ResetPasswordProps) {
  return (
    <Layout preview="Reset your password">
      <Section>
        <Text style={heading}>Reset your password</Text>

        <Text style={paragraph}>Hi {name}, we received a request to reset your password.</Text>

        <Button href={resetUrl} style={button}>
          Reset Password
        </Button>

        <Text style={smallText}>
          This link expires in 1 hour. If you didn't request a password reset, you can safely ignore
          this email.
        </Text>
      </Section>
    </Layout>
  );
}
```

## Better Auth Integration

Better Auth uses these templates automatically for:

- Email verification
- Password reset
- Magic link login (if enabled)

Configure in `packages/auth/src/config.ts`:

```typescript
import { betterAuth } from "better-auth";
import { sendVerificationEmail, sendPasswordResetEmail } from "@app/mailer";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail({
        to: user.email,
        name: user.name || "User",
        verificationUrl: url,
      });
    },
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name || "User",
        resetUrl: url,
      });
    },
  },
});
```

## Notification Emails

### Transactional Notifications

```typescript
import { sendNotificationEmail } from "@app/mailer";

// New comment notification
await sendNotificationEmail({
  to: author.email,
  subject: "New comment on your post",
  title: "Someone commented on your post",
  body: `${commenter.name} left a comment on "${post.title}"`,
  actionUrl: `https://app.com/posts/${post.id}`,
  actionText: "View Comment",
});
```

### Batch Sending

```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Send to multiple recipients
await resend.batch.send([
  {
    from: "hello@yourdomain.com",
    to: "user1@example.com",
    subject: "Newsletter",
    react: <NewsletterEmail />,
  },
  {
    from: "hello@yourdomain.com",
    to: "user2@example.com",
    subject: "Newsletter",
    react: <NewsletterEmail />,
  },
]);
```

## Preview Templates

### Development Preview

```bash
# Start email preview server
cd packages/mailer
pnpm dev
```

Opens at `http://localhost:3001` with hot reload.

### Export Static HTML

```typescript
import { render } from "@react-email/render";
import { WelcomeEmail } from "./templates";

const html = render(<WelcomeEmail name="John" />);
console.log(html);
```

## Testing

### Test Mode

In development, emails go to Resend's test inbox:

```typescript
// Check sent emails in Resend dashboard
// Or use the test API
const resend = new Resend(process.env.RESEND_API_KEY);
const emails = await resend.emails.list();
```

### Unit Tests

```typescript
import { render } from "@react-email/render";
import { WelcomeEmail } from "@app/mailer/templates";

describe("WelcomeEmail", () => {
  it("renders with name", () => {
    const html = render(<WelcomeEmail name="John" />);
    expect(html).toContain("Hi John");
  });

  it("includes CTA button", () => {
    const html = render(<WelcomeEmail name="John" />);
    expect(html).toContain("Get Started");
  });
});
```

## Styling Best Practices

### Inline Styles

Email clients require inline styles:

```tsx
// Good
<Text style={{ color: "#333", fontSize: "16px" }}>Hello</Text>

// Bad - won't work in most clients
<Text className="text-gray-700">Hello</Text>
```

### Safe Fonts

```typescript
const fontFamily = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`;
```

### Table-Based Layout

For complex layouts, use tables:

```tsx
import { Row, Column } from "@react-email/components";

<Row>
  <Column style={{ width: "50%" }}>Left</Column>
  <Column style={{ width: "50%" }}>Right</Column>
</Row>;
```

### Responsive Design

```tsx
const container = {
  maxWidth: "600px",
  margin: "0 auto",
  padding: "20px",
};

// Mobile-friendly buttons
const button = {
  display: "block",
  width: "100%",
  textAlign: "center" as const,
};
```

## Troubleshooting

### Emails not sending

1. Check `RESEND_API_KEY` is valid
2. Verify domain in Resend dashboard
3. Check Resend logs for errors
4. Ensure `EMAIL_FROM_ADDRESS` matches verified domain

### Emails going to spam

1. Verify SPF, DKIM, DMARC records
2. Use verified sending domain
3. Avoid spam trigger words
4. Include unsubscribe link

### Template not rendering

1. Check React Email components are imported correctly
2. Verify props are passed
3. Test with `render()` function
4. Check Resend API response for errors

### Styles not applying

1. Use inline styles, not CSS classes
2. Test in multiple email clients
3. Use web-safe fonts
4. Avoid complex CSS (flexbox, grid)

## Best Practices

1. **Verify your domain** - Required for production
2. **Use templates** - Don't write raw HTML
3. **Test in clients** - Gmail, Outlook, Apple Mail behave differently
4. **Include text version** - For accessibility
5. **Track opens/clicks** - Resend provides analytics
6. **Handle bounces** - Monitor for invalid addresses
7. **Respect preferences** - Always include unsubscribe

## Next Steps

- **[AUTH.md](./AUTH.md)** - Auth email flows
- **[NOTIFICATIONS.md](./NOTIFICATIONS.md)** - Push notifications
- **[React Email Docs](https://react.email)** - Component documentation
- **[Resend Docs](https://resend.com/docs)** - API reference
