---
name: i18n-manager
description: Use when adding translations, creating new language support, or managing internationalization. Handles translation files, language configuration, and generating translations from English source. ALL user-facing content MUST use i18n.
---

# i18n Manager

Manage translations and add new language support.

**Announce:** "I'm using the i18n-manager skill to handle translations."

## CRITICAL: What Uses i18n vs What Doesn't

**ALL user-facing content MUST use i18n. NO EXCEPTIONS.**

### Use i18n (User-Facing)

| Content Type            | Example                                      |
| ----------------------- | -------------------------------------------- |
| UI text                 | Labels, buttons, headings, placeholders      |
| Error messages to users | "You don't have permission", "Invalid email" |
| Email content           | Subject lines, body text, CTAs               |
| Push notifications      | Title, body, action buttons                  |
| Toast/alert messages    | Success, error, warning messages             |
| Form validation         | "Email is required", "Password too short"    |
| API error responses     | Error messages returned to clients           |

### Keep in English (Internal)

| Content Type     | Example                             |
| ---------------- | ----------------------------------- |
| Console logs     | `console.log("User logged in")`     |
| Analytics events | `posthog.capture("user_signed_up")` |
| Sentry errors    | Error tracking messages             |
| OpenTelemetry    | Spans, traces, metrics              |
| Log messages     | Pino, winston, etc.                 |
| Database fields  | Column names, enum values           |
| Code comments    | Developer documentation             |

### Examples

```typescript
// ❌ BAD - Hardcoded user-facing text
<Button>Submit</Button>
throwError("FORBIDDEN", "You don't have permission");
await sendEmail({ subject: "Welcome to our app!" });

// ✅ GOOD - i18n for user-facing
<Button>{t("actions.submit")}</Button>
throwError("FORBIDDEN", t("errors.noPermission"));
await sendEmail({ subject: t("emails.welcome.subject") });

// ✅ GOOD - English for internal
console.log(`[Auth] User ${userId} authenticated`);
posthog.capture("user_login", { method: "email" });
logger.info({ userId }, "Session created");
```

## Language Configuration

**Config file:** `packages/i18n/src/languages.json`

```json
{
  "defaultLanguage": "en",
  "fallbackLanguage": "en",
  "supportedLanguages": [
    { "code": "en", "name": "English", "nativeName": "English" },
    { "code": "es", "name": "Spanish", "nativeName": "Español" }
  ],
  "namespaces": ["common", "auth", "validation", "group", "dashboard", "emails", "errors"]
}
```

## Language Priority

### Web/Mobile App

Priority (highest to lowest):

1. **User preference** - Account setting, stored in localStorage/AsyncStorage
2. **Browser/device detected** - Navigator language or device locale
3. **Default English** - Fallback

**Applying user preference on login:**

```typescript
// When user logs in, apply their account language preference
i18n.changeLanguage(user.preferredLanguage);
```

### Email

Priority (highest to lowest):

1. **User preference** - Pass user's account language
2. **Default English** - Fallback

```typescript
// Pass user's language preference for emails
await sendEmail({
  locale: user.preferredLanguage || "en",
  // ...
});
```

## Translation Structure

```
packages/i18n/src/locales/
├── en/                    # English (source language)
│   ├── common.json        # General UI, navigation, hero, pricing
│   ├── auth.json          # Login, signup, password flows
│   ├── validation.json    # Form validation messages
│   ├── group.json         # Group/tenant related
│   ├── dashboard.json     # Dashboard content
│   ├── emails.json        # Email templates content
│   └── errors.json        # User-facing error messages
└── es/                    # Spanish (same structure)
    └── ...
```

## Adding Translation Keys

**Step 1:** Add to English first (source of truth)

```json
// packages/i18n/src/locales/en/errors.json
{
  "forbidden": {
    "noPermission": "You don't have permission to perform this action",
    "notMember": "You are not a member of this group"
  }
}
```

**Step 2:** Add to ALL other supported languages

```json
// packages/i18n/src/locales/es/errors.json
{
  "forbidden": {
    "noPermission": "No tienes permiso para realizar esta acción",
    "notMember": "No eres miembro de este grupo"
  }
}
```

**Step 3:** Use in code

```tsx
// In components
import { useTranslation } from "@app/i18n/web";

function MyComponent() {
  const { t } = useTranslation("errors");
  return <Text>{t("forbidden.noPermission")}</Text>;
}

// In API (pass key to client for translation)
throwError("FORBIDDEN", "errors.forbidden.noPermission");
```

## Adding a New Language

### Step 1: Update languages.json

```json
{
  "supportedLanguages": [
    { "code": "en", "name": "English", "nativeName": "English" },
    { "code": "es", "name": "Spanish", "nativeName": "Español" },
    { "code": "fr", "name": "French", "nativeName": "Français", "isRTL": false }
  ]
}
```

### Step 2: Create translation files

```bash
mkdir -p packages/i18n/src/locales/fr
```

For each namespace, create a JSON file with translated content based on English.

### Step 3: Update i18n configs

**Web** (`packages/i18n/src/i18n.web.ts`):

```typescript
// Add imports for new language
import authFR from "./locales/fr/auth.json";
import commonFR from "./locales/fr/common.json";
// ... all namespaces

// Add to resources
const resources = {
  en: { /* ... */ },
  es: { /* ... */ },
  fr: {
    common: commonFR,
    auth: authFR,
    // ... all namespaces
  },
};

// Update supportedLngs
supportedLngs: ["en", "es", "fr"],
```

**Mobile** (`packages/i18n/src/i18n.mobile.ts`): Same changes.

### Step 4: Translate content

Translate ALL JSON files from English. Preserve:

- Key structure (exact same keys)
- Interpolation placeholders: `{{name}}`, `{{count}}`, etc.
- Array structures for lists

## Generating Translations

When adding a new language:

1. **Read English source** for each namespace
2. **Translate to target language** preserving:
   - Exact JSON structure
   - All interpolation placeholders (`{{variable}}`)
   - Array ordering
3. **Save to target locale directory**

Translation prompt template:

```
Translate the following English JSON to [LANGUAGE].
Preserve the exact JSON structure and all {{placeholders}}.
Only translate the string values, not the keys.

[English JSON content]
```

## Translation Guidelines

### Do's

- Keep interpolation placeholders exactly: `{{name}}` stays `{{name}}`
- Preserve array order (features lists, etc.)
- Use native language conventions for dates, numbers
- Include proper punctuation for target language
- Add translations to ALL supported languages when adding new keys

### Don'ts

- Don't translate JSON keys
- Don't change placeholder names
- Don't add/remove array items
- Don't change nesting structure
- Don't hardcode user-facing text anywhere

## Namespaces Reference

| Namespace       | Content                                            |
| --------------- | -------------------------------------------------- |
| `common`        | Navigation, hero, pricing, footer, actions, status |
| `auth`          | Login, signup, password reset, email verification  |
| `validation`    | Form validation error messages                     |
| `group`         | Group/tenant management screens                    |
| `dashboard`     | Dashboard integrations, stats, notes               |
| `emails`        | Email template content (subjects, bodies)          |
| `errors`        | User-facing API error messages                     |
| `subscriptions` | Paywall, subscription management, premium features |

## Checklist for New Language

- [ ] Add language to `languages.json`
- [ ] Create `packages/i18n/src/locales/{code}/` directory
- [ ] Create ALL namespace JSON files with translations
- [ ] Update `i18n.web.ts` imports and resources
- [ ] Update `i18n.mobile.ts` imports and resources
- [ ] Update `supportedLngs` in both configs
- [ ] Test language switching in web and mobile

## Checklist for New Translation Keys

- [ ] Add key to English namespace file first
- [ ] Add translated key to ALL other supported languages
- [ ] Use `t("namespace.key")` in components
- [ ] Never hardcode the text directly

## Common i18n Mistakes and Fixes

### API Error Messages

```typescript
// ❌ BAD - Hardcoded error message
throwError("FORBIDDEN", "You don't have permission");

// ✅ GOOD - i18n key (client translates)
throwError("FORBIDDEN", "errors:forbidden.noPermission");

// ❌ BAD - Only added to English
// packages/i18n/src/locales/en/errors.json
{ "forbidden": { "noPermission": "You don't have permission" } }

// ✅ GOOD - Added to ALL languages
// packages/i18n/src/locales/en/errors.json
{ "forbidden": { "noPermission": "You don't have permission" } }
// packages/i18n/src/locales/es/errors.json
{ "forbidden": { "noPermission": "No tienes permiso" } }
```

### Email Templates

```typescript
// ❌ BAD - Hardcoded email content
await sendEmail({
  subject: "Welcome to our app!",
  body: `Hi ${name}, welcome!`,
});

// ✅ GOOD - Template with locale
await sendTemplateEmail("authWelcome", {
  to: user.email,
  locale: user.preferredLanguage || "en",
  data: { name: user.name },
});
```

### Dynamic Values with Placeholders

```json
// packages/i18n/src/locales/en/group.json
{
  "members": {
    "count": "{{count}} member",
    "count_plural": "{{count}} members",
    "welcome": "Welcome to {{groupName}}!"
  }
}
```

```typescript
// Usage with interpolation
t("members.count", { count: memberCount });
t("members.welcome", { groupName: tenant.name });
```

### Namespace Organization

| Namespace        | What Goes Here     | Example Keys                                          |
| ---------------- | ------------------ | ----------------------------------------------------- |
| `common`         | Shared UI elements | `actions.save`, `actions.cancel`, `status.loading`    |
| `auth`           | Auth flows         | `login.title`, `signup.button`, `errors.invalidEmail` |
| `errors`         | Error messages     | `forbidden.noPermission`, `notFound.resource`         |
| `validation`     | Form validation    | `required`, `email.invalid`, `password.tooShort`      |
| `emails`         | Email content      | `welcome.subject`, `verify.body`                      |
| Feature-specific | Feature UI         | `settings.title`, `dashboard.stats`                   |

## Quick Reference

```typescript
// Import for web
import { useTranslation } from "@app/i18n/web";

// Import for mobile
import { useTranslation } from "@app/i18n/mobile";

// Using translation
const { t } = useTranslation("namespace");
<Text>{t("key.path")}</Text>

// With interpolation
t("greeting", { name: user.name })

// With pluralization
t("items", { count: 5 }) // Uses items or items_plural

// Changing language
import { i18n } from "@app/i18n/web";
i18n.changeLanguage("es");
```
