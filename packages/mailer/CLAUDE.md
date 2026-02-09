# packages/mailer — Resend Email Templates

React Email templates with Resend delivery and i18n support.

## Structure

```
src/
├── send.ts                # sendEmail() & sendTemplateEmail()
├── types.ts               # EmailTemplate, SendEmailParams types
├── i18n.ts                # Server-side translations (en + es)
├── providers/
│   ├── factory.ts         # Singleton provider factory
│   ├── resend.ts          # ResendMailerProvider (production)
│   └── noop.ts            # NoOpMailerProvider (dev — logs to console)
└── templates/
    ├── verify-email.tsx
    ├── reset-password.tsx
    ├── welcome.tsx
    ├── invite.tsx
    ├── waitlist.tsx
    ├── admin-invite.tsx
    ├── subscription-activated.tsx
    ├── payment-failed.tsx
    └── trial-ending.tsx
```

## Usage

```typescript
// 1. Initialize at API startup
import { initializeMailerProvider } from "@app/mailer";
await initializeMailerProvider();

// 2. Send template email
import { sendTemplateEmail } from "@app/mailer";
await sendTemplateEmail("authVerifyEmail", {
  to: "user@example.com",
  data: { name: "John", verificationLink: "https://..." },
  locale: "es", // Optional, defaults to "en"
});
```

## Templates

| Template                | Purpose                 |
| ----------------------- | ----------------------- |
| `authVerifyEmail`       | Email verification link |
| `authResetPassword`     | Password reset link     |
| `authWelcome`           | Welcome after signup    |
| `inviteToTenant`        | Group/tenant invitation |
| `waitlistWelcome`       | Waitlist confirmation   |
| `subscriptionActivated` | Subscription confirmed  |
| `paymentFailed`         | Payment failure alert   |
| `trialEnding`           | Trial expiration notice |
| `adminInvite`           | Admin portal invitation |

## Environment Variables

- `RESEND_API_KEY` — Resend API key (if missing, uses NoOp provider)
- `EMAIL_FROM_NAME` — Sender name (default: "App")
- `EMAIL_FROM_ADDRESS` — Sender email (default: "noreply@example.com")

## Rules

- Templates use `@react-email/components` — inline CSS, no Tailwind
- Max container width: 600px
- All templates support i18n via `locale` param (en + es)
- Provider auto-selects: Resend if API key present, NoOp otherwise
- Server-only package — never import in web/mobile client code
