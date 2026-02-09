---
name: mobile-developer
description: Use when implementing mobile frontend - creates Expo Router screens, mobile-specific components, and native integrations
allowed-tools: Read, Glob, Grep, Edit, Write, Bash
---

# Mobile Developer

Implement mobile frontend using Expo 54 and Expo Router.

> **Shared rules apply:** See README for type safety, i18n, screens, error states, responsive design, and mobile auth requirements.

## Architecture

```
packages/ui/src/
├── screens/{auth,private}/  → ALL screens live here (shared with web)
├── hooks/                   → Shared hooks
└── stores/                  → Shared state

apps/mobile/src/app/
├── (auth)/     → Auth routes (login, signup)
├── (private)/  → Protected routes
│   ├── (tabs)/ → Tab navigator
│   ├── notifications/
│   └── profile/
├── _layout.tsx → Root layout
└── index.tsx   → Entry redirect
```

## Implementation Order

1. Use Shared Hooks → 2. Use Shared Screen → 3. Mobile Route → 4. Navigation

### Step 3: Mobile Route

```typescript
// apps/mobile/src/app/(private)/settings.tsx
import { SettingsScreen } from "@app/ui/screens";
import { signOut } from "@app/auth/client/native";  // MUST pass native signOut

export default function Settings() {
  return <SettingsScreen signOut={signOut} />;
}
```

### Step 4: Navigation

**Tabs:**

```typescript
<Tabs>
  <Tabs.Screen name="dashboard" options={{ title: "Home", tabBarIcon: HomeIcon }} />
</Tabs>
```

**Stack (Private Layout):**

```typescript
import { useSession } from "@app/auth/client/native";
// Guard with session check, redirect to login if null
```

**Navigate:** `router.push("/settings")`, `router.replace("/dashboard")`, `router.back()`

**Params:** `const { id } = useLocalSearchParams<{ id: string }>();`

## Mobile-Specific Patterns

**Safe Area:** `<SafeAreaView className="flex-1"><Screen /></SafeAreaView>`

**Platform Code:** `Platform.OS === "ios"` / `Platform.OS === "android"`

**File Variants:** `.native.tsx` (iOS+Android), `.ios.tsx`, `.android.tsx`

**Keyboard:** `<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>`

**Pull to Refresh:** `<ScrollView refreshControl={<RefreshControl refreshing={r} onRefresh={fn} />}>`

**ActionSheet:**

```typescript
<Actionsheet isOpen={isOpen} onClose={onClose}>
  <ActionsheetContent>
    <ActionsheetItem onPress={handleEdit}>{t("actions.edit")}</ActionsheetItem>
  </ActionsheetContent>
</Actionsheet>
```

**FlatList:** For long lists, use `keyExtractor`, `onEndReached` for pagination.

**NativeWind:** Same Tailwind classes work. Exceptions: no `hover:`, no `cursor-*`.

**Platform Auth (CRITICAL):** Mobile MUST pass `signOut` from `@app/auth/client/native` to shared screens. The native and web clients are separate Better Auth instances with separate state.

**Native APIs:**

```typescript
import * as Notifications from "expo-notifications";
import * as ImagePicker from "expo-image-picker";
const { status } = await Notifications.requestPermissionsAsync();
```

## Testing

```bash
pnpm --filter mobile dev     # Expo dev server
pnpm --filter mobile ios     # iOS simulator
pnpm --filter mobile android # Android emulator
```

Test on: iPhone SE (375px), iPhone 15 (393px), iPad (768px+)

## Checklist

- [ ] `pnpm --filter mobile typecheck` passes
- [ ] Screen in `packages/ui/src/screens/` (NOT apps/mobile)
- [ ] Mobile route is thin wrapper only
- [ ] Platform-specific auth passed (signOut from native client)
- [ ] Safe area and keyboard handling
- [ ] All text uses `useTranslation()`, translations in all locales
- [ ] Responsive on all device sizes (SE, iPhone 15, iPad)
- [ ] Runs on iOS simulator and Android emulator
