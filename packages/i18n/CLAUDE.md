# packages/i18n — Internationalization (i18next)

Two languages (en, es), 10 namespaces, platform-specific configs.

## Structure

```
src/
├── i18n.web.ts              # Web config (browser-languagedetector + localStorage)
├── i18n.mobile.ts           # Mobile config (asyncStorageDetector + expo-localization)
├── web.ts                   # Export: @app/i18n/web
├── mobile.ts                # Export: @app/i18n/mobile
├── types.ts                 # CustomTypeOptions for react-i18next autocomplete
├── languages.json           # Language metadata + namespace registry
├── detectors/
│   └── asyncStorageDetector.ts  # Custom RN language detector
└── locales/
    ├── en/                  # English (source of truth)
    │   ├── common.json      # General app strings, nav, hero, pricing
    │   ├── auth.json        # Login, signup, password flows
    │   ├── validation.json  # Field validation messages
    │   ├── errors.json      # Error messages by category
    │   ├── dashboard.json   # Dashboard UI
    │   ├── settings.json    # Settings UI
    │   ├── group.json       # Group/tenant management
    │   ├── todos.json       # Todo feature
    │   ├── subscriptions.json # Billing/subscription UI
    │   └── emails.json      # Email templates
    └── es/                  # Spanish (must mirror en/ exactly)
```

## Usage

```typescript
// In shared screens (packages/ui)
import { useTranslation } from "react-i18next";
const { t } = useTranslation();
<Text>{t("dashboard.greeting", { name: "John" })}</Text>

// Change language
import { useTranslation } from "react-i18next";
const { i18n } = useTranslation();
i18n.changeLanguage("es"); // Auto-persisted to storage
```

## App Initialization

```typescript
// Web (apps/web)
import i18n from "@app/i18n/web";

// Mobile (apps/mobile)
import i18n from "@app/i18n/mobile";
```

## Language Detection Priority

1. **User preference** — localStorage (web) / AsyncStorage (mobile)
2. **Device/browser** — navigator.language (web) / expo-localization (mobile)
3. **Fallback** — English

Storage key: `"user-language"` on both platforms.

## Adding Translation Keys

1. Add keys to `locales/en/<namespace>.json` (source of truth)
2. Add same keys to `locales/es/<namespace>.json` with Spanish translations
3. Preserve `{{placeholders}}` exactly between languages

## Adding a New Namespace

1. Create `locales/en/<name>.json` and `locales/es/<name>.json`
2. Register in `languages.json` → `namespaces` array
3. Add imports to both `i18n.web.ts` and `i18n.mobile.ts`
4. Add type to `types.ts` → `Resources` interface

## Interpolation

```json
{
  "greeting": "Welcome back, {{name}}",
  "count": "{{count}} items",
  "date": "Renews on {{date}}"
}
```

## Rules

- English is the source of truth — add keys there first
- ALL user-facing text must use `t()` — no hardcoded strings
- Keys must exist in ALL languages (en + es)
- Preserve `{{placeholders}}` exactly across translations
- Internal logs, analytics events, and PostHog names stay in English
- New namespaces must be registered in languages.json AND both i18n configs
