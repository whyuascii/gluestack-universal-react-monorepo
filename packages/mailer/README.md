# @app/mailer

Transactional email service using [Resend](https://resend.com) and [React Email](https://react.email).

## Features

- **React Email Templates**: Type-safe, component-based email templates
- **Pluggable Providers**: Resend (default) or NoOp for testing
- **Built-in i18n**: English and Spanish translations included
- **Template Preview**: Visual preview with React Email dev server

## Setup

### Environment Variables

```bash
# Required for email delivery
RESEND_API_KEY=re_xxxxx

# Optional configuration
EMAIL_FROM_NAME="My App"           # Default: "App"
EMAIL_FROM_ADDRESS="hi@myapp.com"  # Default: "noreply@example.com"
EMAIL_REPLY_TO="support@myapp.com" # Optional reply-to address

# Force disable emails (uses NoOp provider)
MAILER_PROVIDER=none
```

### Initialization

Initialize the mailer at app startup:

```typescript
// apps/api/src/plugins/mailer.ts
import { initializeMailerProvider } from "@app/mailer";

await initializeMailerProvider();
```

## Usage

### Send Template Email (Recommended)

```typescript
import { sendTemplateEmail } from "@app/mailer";

// Email verification
await sendTemplateEmail("authVerifyEmail", {
  to: "user@example.com",
  locale: "en", // Optional, defaults to "en"
  data: {
    name: "John",
    verificationLink: "https://myapp.com/verify?token=xxx",
  },
});

// Password reset
await sendTemplateEmail("authResetPassword", {
  to: "user@example.com",
  data: {
    name: "John",
    resetLink: "https://myapp.com/reset?token=xxx",
    expiresIn: "1 hour",
  },
});

// Subscription activated
await sendTemplateEmail("subscriptionActivated", {
  to: "user@example.com",
  locale: "es", // Spanish
  data: {
    name: "Juan",
    planName: "Pro",
    dashboardLink: "https://myapp.com/dashboard",
  },
});
```

### Send Raw Email

```typescript
import { sendEmail } from "@app/mailer";

await sendEmail({
  to: "user@example.com",
  subject: "Custom Email",
  html: "<h1>Hello!</h1><p>Custom content here.</p>",
  text: "Hello! Custom content here.", // Optional plain text version
  tags: { campaign: "onboarding" }, // Optional metadata
});
```

## Available Templates

| Template                | Purpose                  | Required Data                                    |
| ----------------------- | ------------------------ | ------------------------------------------------ |
| `authVerifyEmail`       | Email verification       | `name`, `verificationLink`                       |
| `authResetPassword`     | Password reset           | `name`, `resetLink`, `expiresIn?`                |
| `authWelcome`           | Welcome after signup     | `name`, `dashboardLink`                          |
| `inviteToTenant`        | Team/org invitation      | `inviterName`, `tenantName`, `inviteLink`        |
| `waitlistWelcome`       | Waitlist confirmation    | `name`, `unsubscribeLink?`                       |
| `subscriptionActivated` | Subscription started     | `name`, `planName`, `dashboardLink`              |
| `paymentFailed`         | Payment failure          | `name`, `retryDate`, `updatePaymentUrl`          |
| `trialEnding`           | Trial expiration warning | `name`, `planName`, `trialEndDate`, `upgradeUrl` |

## i18n Support

Templates support `en` and `es` locales. Translations are embedded and applied automatically:

```typescript
// English (default)
await sendTemplateEmail("authVerifyEmail", {
  to: "user@example.com",
  data: { name: "John", verificationLink: "..." },
});

// Spanish
await sendTemplateEmail("authVerifyEmail", {
  to: "user@example.com",
  locale: "es",
  data: { name: "Juan", verificationLink: "..." },
});
```

## Preview Templates

Launch the React Email dev server to preview templates:

```bash
pnpm --filter @app/mailer preview
```

Opens at http://localhost:3000 with hot reload for template development.

## Provider System

### Default Behavior

| Condition              | Provider                         |
| ---------------------- | -------------------------------- |
| `RESEND_API_KEY` set   | Resend (sends real emails)       |
| `MAILER_PROVIDER=none` | NoOp (logs only, no emails sent) |
| No API key             | NoOp (development fallback)      |

### Direct Provider Access

```typescript
import { getMailerProvider, initializeMailerProvider } from "@app/mailer";

// Get current provider
const provider = getMailerProvider();
const config = provider.getConfig();

// Check initialization status
import { isMailerProviderInitialized } from "@app/mailer";
if (!isMailerProviderInitialized()) {
  await initializeMailerProvider();
}
```

### Testing

For tests, the NoOp provider logs emails without sending:

```typescript
import { resetMailerProvider, initializeMailerProvider } from "@app/mailer";

beforeEach(async () => {
  resetMailerProvider();
  process.env.MAILER_PROVIDER = "none";
  await initializeMailerProvider();
});
```

## Adding a New Template

1. Create the template in `src/templates/`:

```tsx
// src/templates/my-template.tsx
import { Html, Head, Body, Container, Text, Button } from "@react-email/components";
import * as React from "react";

interface MyTemplateProps {
  name: string;
  actionUrl: string;
  i18n_greeting?: string;
  i18n_cta?: string;
}

export function MyTemplate({ name, actionUrl, i18n_greeting, i18n_cta }: MyTemplateProps) {
  return (
    <Html>
      <Head />
      <Body>
        <Container>
          <Text>{i18n_greeting || `Hi ${name},`}</Text>
          <Button href={actionUrl}>{i18n_cta || "Take Action"}</Button>
        </Container>
      </Body>
    </Html>
  );
}

export default MyTemplate;
```

2. Export from `src/templates/index.ts`:

```typescript
export { MyTemplate as myTemplate } from "./my-template";
```

3. Add the type to `src/types.ts`:

```typescript
export type EmailTemplate =
  | "authVerifyEmail"
  // ... existing templates
  | "myTemplate";

export interface TemplateData {
  // ... existing templates
  myTemplate: {
    name: string;
    actionUrl: string;
  };
}
```

4. Add translations in `src/i18n.ts`:

```typescript
const translations = {
  en: {
    // ... existing
    myTemplate: {
      subject: "Action Required",
      greeting: "Hi {{name}},",
      cta: "Take Action",
    },
  },
  es: {
    // ... existing
    myTemplate: {
      subject: "Accion Requerida",
      greeting: "Hola {{name}},",
      cta: "Tomar Accion",
    },
  },
};
```

5. Add subject and translation mapping in `src/send.ts`:

```typescript
// In getSubjectForTemplate()
case "myTemplate":
  return t(locale, "myTemplate.subject");

// In getTranslationsForTemplate()
case "myTemplate":
  return {
    i18n_greeting: t(locale, "myTemplate.greeting", { name: data.name }),
    i18n_cta: t(locale, "myTemplate.cta"),
  };
```
