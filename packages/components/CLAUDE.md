# packages/components — Cross-Platform UI Primitives

71 components: 50+ Gluestack UI primitives + custom composites. Shared between web and mobile.

## Structure

```
src/
├── index.ts           # Main barrel (web + mobile shared)
├── native.ts          # Mobile-only exports (HapticTab, OfflineIndicator, PermissionRequester)
├── <component>/       # Each component is a directory
│   ├── index.tsx      # React Native implementation (default)
│   ├── index.web.tsx  # Web implementation (auto-resolved by bundler)
│   └── styles.tsx     # Shared Tailwind Variants styling
├── ErrorStates/       # NetworkError, GeneralError, EmptyState + presets
├── AppHeader/         # App header composite
├── AuthCard/          # Auth form wrapper
├── FormField/         # Form field with label + error
├── PrimaryButton/     # Styled button with variants
├── SocialAuthButton/  # OAuth login buttons
├── StatCard/          # Dashboard stat card
└── Typography/        # Text primitives
```

## Three-File Component Pattern

**Native (`index.tsx`):**

```typescript
import { View, type ViewProps } from "react-native";
import { cardStyle } from "./styles";

type ICardProps = ViewProps & VariantProps<typeof cardStyle> & { className?: string };

const Card = React.forwardRef<React.ComponentRef<typeof View>, ICardProps>(
  ({ className, size = "md", variant = "elevated", ...props }, ref) => (
    <View className={cardStyle({ size, variant, class: className })} {...props} ref={ref} />
  )
);
```

**Web (`index.web.tsx`):**

```typescript
// Same API, but uses HTML <div> instead of React Native View
const Card = React.forwardRef<HTMLDivElement, ICardProps>(
  ({ className, size = "md", variant = "elevated", ...props }, ref) => (
    <div className={cardStyle({ size, variant, class: className })} {...props} ref={ref} />
  )
);
```

**Styles (`styles.tsx`):**

```typescript
import { tva } from "@gluestack-ui/utils/nativewind-utils";

export const cardStyle = tva({
  base: "rounded-lg bg-background-0 p-4",
  variants: {
    size: { sm: "p-2", md: "p-4", lg: "p-6" },
    variant: { elevated: "shadow-lg", outline: "border border-outline-200" },
  },
});
```

## ErrorStates

```typescript
import { NetworkError, GeneralError, EmptyState, EmptySearchResults } from "@app/components";

<NetworkError onRetry={refetch} isRetrying={isRefetching} />
<GeneralError onRetry={refetch} onGoHome={goHome} errorDetails={error.message} />
<EmptyState title="No items" actionText="Add Item" onAction={openModal} />
<EmptySearchResults query={search} onClear={() => setSearch("")} />
```

Presets: `EmptySearchResults`, `EmptyList`, `EmptyNotifications`, `EmptyFavorites`

## Exports

```typescript
// Cross-platform (web + mobile)
import { Button, Card, Box, Text } from "@app/components";

// Mobile-only
import { HapticTab, OfflineIndicator } from "@app/components/native";
```

## Key Dependencies

- **Gluestack UI v3** — headless component creators
- **NativeWind 4** — Tailwind for React Native
- **Tailwind Variants (TVA)** — type-safe variant system via `tva()`
- **@expo/html-elements** — semantic HTML on web (h1-h6)
- **@gorhom/bottom-sheet** — mobile bottom sheets

## Rules

- Always use three-file pattern for new components
- Use `tva()` from `@gluestack-ui/utils/nativewind-utils` for styling
- Use `VariantProps<typeof style>` for type-safe variant props
- Use `React.forwardRef` with `displayName`
- Mobile-only components go in `native.ts`, NOT `index.ts`
- Use design tokens from `packages/tailwind-config/DESIGN-SYSTEM.md`
