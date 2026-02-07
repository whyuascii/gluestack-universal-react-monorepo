# @app/i18n

Cross-platform internationalization using [i18next](https://www.i18next.com/) and [react-i18next](https://react.i18next.com/).

## Features

- **Platform-specific imports**: Separate entry points for web and mobile
- **Automatic language detection**: Browser language (web) or device locale (mobile)
- **Preference persistence**: localStorage (web) or AsyncStorage (mobile)
- **Database sync**: User preference syncs across devices when logged in
- **Type-safe translations**: Full TypeScript support with namespace types

## Setup

### Web (Next.js)

```typescript
// apps/web/src/app/providers.tsx
import i18n from "@app/i18n/web";
import { I18nextProvider } from "react-i18next";

export function Providers({ children }) {
  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}
```

### Mobile (Expo)

```typescript
// apps/mobile/src/app/_layout.tsx
import i18n from "@app/i18n/mobile";
import { I18nextProvider } from "react-i18next";

export default function RootLayout() {
  return (
    <I18nextProvider i18n={i18n}>
      <Slot />
    </I18nextProvider>
  );
}
```

## Usage

### Basic Translation

```typescript
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t } = useTranslation();

  return (
    <View>
      <Text>{t("common:actions.save")}</Text>
      <Text>{t("auth:login.title")}</Text>
    </View>
  );
}
```

### With Interpolation

```typescript
const { t } = useTranslation();

// JSON: "greeting": "Welcome back, {{name}}"
t("common:dashboard.greeting", { name: "John" });
// Output: "Welcome back, John"

// JSON: "copyright": "{{year}} Your Company. All rights reserved."
t("common:footer.copyright", { year: new Date().getFullYear() });
// Output: "2024 Your Company. All rights reserved."
```

### Changing Language

```typescript
import { useTranslation } from "react-i18next";

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    // Automatically cached to localStorage (web) or AsyncStorage (mobile)
  };

  return (
    <Button onPress={() => changeLanguage("es")}>
      Switch to Spanish
    </Button>
  );
}
```

### Syncing with Database (Logged-in Users)

```typescript
import { useLanguageSync } from "@app/ui";

// Add to authenticated layout to sync user's preference on login
function AuthenticatedLayout({ children }) {
  useLanguageSync();
  return <>{children}</>;
}
```

## Language Priority

The detection order (highest to lowest):

| Platform      | Priority                                                           |
| ------------- | ------------------------------------------------------------------ |
| **Web**       | 1. localStorage → 2. Browser language → 3. English                 |
| **Mobile**    | 1. AsyncStorage → 2. Device locale → 3. English                    |
| **Logged-in** | 1. Database preference → 2. Local storage → 3. Device → 4. English |

## Supported Languages

| Code | Language | Native Name |
| ---- | -------- | ----------- |
| `en` | English  | English     |
| `es` | Spanish  | Español     |

## Namespaces

Translations are organized by feature area:

| Namespace       | Purpose                                 |
| --------------- | --------------------------------------- |
| `common`        | Shared UI (navigation, actions, status) |
| `auth`          | Login, signup, password reset           |
| `validation`    | Form validation messages                |
| `errors`        | Error messages                          |
| `group`         | Tenant/group management                 |
| `dashboard`     | Dashboard-specific content              |
| `settings`      | Settings screens                        |
| `todos`         | Todo feature                            |
| `subscriptions` | Subscription/billing content            |
| `emails`        | Email template content                  |

## Adding Translations

### 1. Add to English (source of truth)

```json
// src/locales/en/common.json
{
  "myFeature": {
    "title": "My Feature",
    "description": "This is my feature"
  }
}
```

### 2. Add to Spanish

```json
// src/locales/es/common.json
{
  "myFeature": {
    "title": "Mi Característica",
    "description": "Esta es mi característica"
  }
}
```

### 3. Use in code

```typescript
t("common:myFeature.title");
t("common:myFeature.description");
```

## Adding a New Language

1. Create locale folder and copy all JSON files:

```bash
mkdir -p src/locales/fr
cp src/locales/en/*.json src/locales/fr/
```

2. Translate all JSON files in the new folder.

3. Update `languages.json`:

```json
{
  "supportedLanguages": [
    { "code": "en", "name": "English", "nativeName": "English" },
    { "code": "es", "name": "Spanish", "nativeName": "Español" },
    { "code": "fr", "name": "French", "nativeName": "Français" }
  ]
}
```

4. Update `SupportedLanguageSchema` in `packages/core-contract`:

```typescript
export const SupportedLanguageSchema = z.enum(["en", "es", "fr"]);
```

5. Import and add resources in `i18n.web.ts` and `i18n.mobile.ts`:

```typescript
import commonFR from "./locales/fr/common.json";
// ... other FR imports

const resources = {
  en: {
    /* ... */
  },
  es: {
    /* ... */
  },
  fr: {
    common: commonFR,
    // ... other namespaces
  },
};
```

6. Update `supportedLngs` in both config files:

```typescript
i18n.init({
  supportedLngs: ["en", "es", "fr"],
  // ...
});
```

## Adding a New Namespace

1. Create the JSON files:

```bash
touch src/locales/en/myNamespace.json
touch src/locales/es/myNamespace.json
```

2. Add content:

```json
// src/locales/en/myNamespace.json
{
  "title": "My Namespace",
  "items": {
    "one": "One item",
    "many": "{{count}} items"
  }
}
```

3. Import in both `i18n.web.ts` and `i18n.mobile.ts`:

```typescript
import myNamespaceEN from "./locales/en/myNamespace.json";
import myNamespaceES from "./locales/es/myNamespace.json";

const resources = {
  en: {
    // ... existing
    myNamespace: myNamespaceEN,
  },
  es: {
    // ... existing
    myNamespace: myNamespaceES,
  },
};
```

4. Add to namespace list:

```typescript
i18n.init({
  ns: ["common", "auth" /* ... */, , "myNamespace"],
  // ...
});
```

5. Update types in `types.ts`:

```typescript
import type myNamespaceEN from "./locales/en/myNamespace.json";

interface Resources {
  // ... existing
  myNamespace: typeof myNamespaceEN;
}
```

## Best Practices

### Use Namespaces

```typescript
// Good - explicit namespace
t("auth:login.title");
t("common:actions.save");

// Avoid - relies on defaultNS
t("actions.save");
```

### Handle Plurals

```json
{
  "items": {
    "zero": "No items",
    "one": "1 item",
    "other": "{{count}} items"
  }
}
```

```typescript
t("items", { count: 0 }); // "No items"
t("items", { count: 1 }); // "1 item"
t("items", { count: 5 }); // "5 items"
```

### Keep Keys Organized

```json
{
  "feature": {
    "title": "Feature Title",
    "description": "Feature description",
    "actions": {
      "create": "Create",
      "edit": "Edit",
      "delete": "Delete"
    },
    "errors": {
      "notFound": "Feature not found",
      "forbidden": "Access denied"
    }
  }
}
```

### Error Messages with i18n Keys

```typescript
// In API actions
throwError("NOT_FOUND", "errors:notFound.user");

// Client displays translated message
const { t } = useTranslation();
t(error.message); // Translates "errors:notFound.user"
```
