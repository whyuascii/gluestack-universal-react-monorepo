---
name: i18n-manager
description: Use when adding translations, creating new language support, or managing internationalization. Handles translation files, language configuration, and generating translations from English source. ALL user-facing content MUST use i18n.
---

# i18n Manager

Manage translations and add new language support.

## What Uses i18n vs What Doesn't

**i18n (user-facing):** UI text, error messages, emails, push notifications, toasts, form validation, API errors shown to users.

**English (internal):** Console logs, analytics events, Sentry errors, OpenTelemetry, database fields, code comments.

```typescript
// ✅ User-facing → i18n
<Button>{t("actions.submit")}</Button>
throwError("FORBIDDEN", "errors.forbidden.noPermission");
await sendTemplateEmail("authWelcome", { locale: user.preferredLanguage || "en", ... });

// ✅ Internal → English
console.log(`[Auth] User ${userId} authenticated`);
posthog.capture("user_login", { method: "email" });
```

## Language Config

File: `packages/i18n/src/languages.json` — defines `supportedLanguages`, `defaultLanguage`, `namespaces`.

**Priority:** User preference → Browser/device detected → English fallback.

## Translation Structure

```
packages/i18n/src/locales/
├── en/                    # English (source of truth)
│   ├── common.json        # Navigation, hero, pricing, actions, status
│   ├── auth.json          # Login, signup, password flows
│   ├── validation.json    # Form validation messages
│   ├── group.json         # Group/tenant management
│   ├── dashboard.json     # Dashboard content
│   ├── emails.json        # Email template content
│   ├── errors.json        # User-facing error messages
│   └── subscriptions.json # Paywall, premium features
└── es/                    # Spanish (same structure)
```

## Adding Translation Keys

1. **Add to English first** (source of truth):

```json
// packages/i18n/src/locales/en/errors.json
{ "forbidden": { "noPermission": "You don't have permission" } }
```

2. **Add to ALL other languages:**

```json
// packages/i18n/src/locales/es/errors.json
{ "forbidden": { "noPermission": "No tienes permiso" } }
```

3. **Use in code:**

```typescript
const { t } = useTranslation("errors");
<Text>{t("forbidden.noPermission")}</Text>

// API errors — client translates the key
throwError("FORBIDDEN", "errors.forbidden.noPermission");
```

## Adding a New Language

1. Add to `languages.json` (`supportedLanguages` array)
2. Create `packages/i18n/src/locales/{code}/` with ALL namespace files
3. Update `i18n.web.ts` — imports, resources, `supportedLngs`
4. Update `i18n.mobile.ts` — same changes
5. Translate all JSON files preserving keys, `{{placeholders}}`, and arrays

## Translation Guidelines

**Do:** Preserve `{{placeholders}}` exactly, preserve array order, use native language conventions, add to ALL languages.

**Don't:** Translate JSON keys, change placeholder names, add/remove array items, change nesting structure.

## Quick Reference

```typescript
// Web import
import { useTranslation } from "@app/i18n/web";
// Mobile import
import { useTranslation } from "@app/i18n/mobile";

const { t } = useTranslation("namespace");
t("key.path"); // Simple
t("greeting", { name: "Alice" }); // Interpolation
t("items", { count: 5 }); // Pluralization
i18n.changeLanguage("es"); // Switch language
```

## Checklists

**New translation keys:**

- [ ] Added to English namespace file
- [ ] Added to ALL other languages
- [ ] Used `t("namespace.key")` in components
- [ ] No hardcoded text

**New language:**

- [ ] Added to `languages.json`
- [ ] Created locale directory with ALL namespace files
- [ ] Updated `i18n.web.ts` and `i18n.mobile.ts`
- [ ] Tested language switching on web and mobile
