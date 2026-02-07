# @app/components

Cross-platform UI component library built with [Gluestack UI v3](https://gluestack.io/) and [NativeWind](https://www.nativewind.dev/). Provides 50+ components that work seamlessly across web (Next.js) and mobile (Expo/React Native) with ~90% code sharing.

## Installation

```bash
pnpm add @app/components
```

## Overview

| Feature              | Description                                         |
| -------------------- | --------------------------------------------------- |
| **Cross-platform**   | Single codebase for web and mobile                  |
| **Tailwind styling** | NativeWind + Tailwind Variants (TVA)                |
| **Accessible**       | ARIA attributes, semantic HTML, keyboard navigation |
| **Type-safe**        | Full TypeScript with variant props                  |
| **Themeable**        | Dark mode support via GluestackUIProvider           |

## Quick Start

```tsx
import { GluestackUIProvider, Box, Button, ButtonText, Heading, Text } from "@app/components";

function App() {
  return (
    <GluestackUIProvider mode="light">
      <Box className="p-4">
        <Heading size="xl">Welcome</Heading>
        <Text>Cross-platform UI components</Text>
        <Button action="primary" size="md">
          <ButtonText>Get Started</ButtonText>
        </Button>
      </Box>
    </GluestackUIProvider>
  );
}
```

## Components

### Layout

| Component              | Description                                         |
| ---------------------- | --------------------------------------------------- |
| `Box`                  | Base container (`<div>` on web, `<View>` on native) |
| `Center`               | Centered flex container                             |
| `HStack`               | Horizontal flex layout                              |
| `VStack`               | Vertical flex layout                                |
| `Grid`                 | CSS Grid layout                                     |
| `SafeAreaView`         | Safe area boundaries                                |
| `ScrollView`           | Scrollable container                                |
| `KeyboardAvoidingView` | Keyboard-aware container                            |

### Typography

| Component | Description                                  |
| --------- | -------------------------------------------- |
| `Heading` | Semantic headings (h1-h6) with size variants |
| `Text`    | Body text                                    |

```tsx
<Heading size="2xl">Large Title</Heading>  {/* h1 */}
<Heading size="lg">Section</Heading>       {/* h3 */}
<Text className="text-typography-500">Body text</Text>
```

### Buttons

| Component       | Description                  |
| --------------- | ---------------------------- |
| `Button`        | Base button with variants    |
| `ButtonText`    | Button label                 |
| `ButtonIcon`    | Button icon                  |
| `ButtonSpinner` | Loading spinner              |
| `ButtonGroup`   | Button grouping              |
| `PrimaryButton` | Styled primary action button |

```tsx
<Button action="primary" variant="solid" size="md">
  <ButtonText>Submit</ButtonText>
</Button>

<Button action="secondary" variant="outline">
  <ButtonIcon as={SettingsIcon} />
  <ButtonText>Settings</ButtonText>
</Button>

<PrimaryButton
  label="Continue"
  onPress={handlePress}
  isLoading={loading}
/>
```

**Button Variants:**

- `action`: `primary` | `secondary` | `positive` | `negative` | `default`
- `variant`: `solid` | `outline` | `link`
- `size`: `xs` | `sm` | `md` | `lg` | `xl`

### Forms

| Component                            | Description                                 |
| ------------------------------------ | ------------------------------------------- |
| `Input` / `InputField` / `InputSlot` | Text input with slots                       |
| `FormControl`                        | Form field wrapper                          |
| `FormControlLabel`                   | Field label                                 |
| `FormControlError`                   | Error message                               |
| `FormField`                          | Complete form field (label + input + error) |
| `Textarea`                           | Multi-line input                            |
| `Checkbox`                           | Checkbox control                            |
| `Radio`                              | Radio button                                |
| `Switch`                             | Toggle switch                               |
| `Slider`                             | Range slider                                |
| `Select`                             | Dropdown select                             |

```tsx
// Simple input
<Input>
  <InputField placeholder="Email" />
</Input>

// With slots (icons)
<Input>
  <InputSlot><Icon as={MailIcon} /></InputSlot>
  <InputField placeholder="Email" />
</Input>

// Complete form field
<FormField
  label="Email"
  error={errors.email}
  input={{
    placeholder: "you@example.com",
    keyboardType: "email-address",
  }}
/>
```

### Data Display

| Component                                       | Description         |
| ----------------------------------------------- | ------------------- |
| `Card`                                          | Content card        |
| `Badge`                                         | Status badge        |
| `Avatar` / `AvatarImage` / `AvatarFallbackText` | User avatar         |
| `Table`                                         | Data table          |
| `Divider`                                       | Visual separator    |
| `Progress`                                      | Progress bar        |
| `Skeleton`                                      | Loading placeholder |

```tsx
<Card className="p-4">
  <HStack className="items-center gap-3">
    <Avatar size="md">
      <AvatarImage source={{ uri: user.image }} />
      <AvatarFallbackText>{user.name}</AvatarFallbackText>
    </Avatar>
    <VStack>
      <Heading size="sm">{user.name}</Heading>
      <Badge action="success">Active</Badge>
    </VStack>
  </HStack>
</Card>
```

### Overlays & Modals

| Component     | Description                  |
| ------------- | ---------------------------- |
| `Modal`       | Modal dialog                 |
| `AlertDialog` | Confirmation dialog          |
| `Drawer`      | Side drawer                  |
| `Popover`     | Floating popover             |
| `Actionsheet` | Bottom action sheet (mobile) |
| `Toast`       | Toast notifications          |
| `Tooltip`     | Hover tooltip                |

```tsx
<Modal isOpen={isOpen} onClose={onClose}>
  <ModalBackdrop />
  <ModalContent>
    <ModalHeader>
      <Heading>Confirm</Heading>
      <ModalCloseButton />
    </ModalHeader>
    <ModalBody>
      <Text>Are you sure?</Text>
    </ModalBody>
    <ModalFooter>
      <Button onPress={onClose}>
        <ButtonText>Cancel</ButtonText>
      </Button>
      <Button action="primary">
        <ButtonText>Confirm</ButtonText>
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>
```

### Navigation

| Component   | Description             |
| ----------- | ----------------------- |
| `Link`      | Navigation link         |
| `Menu`      | Dropdown menu           |
| `Pressable` | Touch-enabled container |
| `FAB`       | Floating action button  |

### Lists

| Component         | Description                |
| ----------------- | -------------------------- |
| `FlatList`        | Flat scrollable list       |
| `SectionList`     | Grouped list with sections |
| `VirtualizedList` | Virtualized scrolling      |

### Feedback

| Component        | Description     |
| ---------------- | --------------- |
| `Spinner`        | Loading spinner |
| `Alert`          | Alert message   |
| `RefreshControl` | Pull-to-refresh |

### Icons

60+ pre-built icons using SVG:

```tsx
import { Icon, SettingsIcon, UserIcon, HomeIcon } from "@app/components";

<Icon as={SettingsIcon} size="md" className="text-primary-500" />;
```

**Available Icons:**

- **Arrows:** `ArrowUpIcon`, `ArrowDownIcon`, `ArrowLeftIcon`, `ArrowRightIcon`
- **Chevrons:** `ChevronUpIcon`, `ChevronDownIcon`, `ChevronLeftIcon`, `ChevronRightIcon`
- **Actions:** `AddIcon`, `RemoveIcon`, `EditIcon`, `TrashIcon`, `CopyIcon`, `DownloadIcon`
- **Navigation:** `HomeIcon`, `MenuIcon`, `SearchIcon`, `SettingsIcon`, `LinkIcon`
- **Users:** `UserIcon`, `UsersIcon`
- **Status:** `CheckIcon`, `CloseIcon`, `AlertCircleIcon`, `InfoIcon`, `HelpCircleIcon`
- **Media:** `PlayIcon`, `CalendarIcon`, `ClockIcon`, `BellIcon`, `MailIcon`, `PhoneIcon`
- **Toggle:** `EyeIcon`, `EyeOffIcon`, `LockIcon`, `UnlockIcon`, `MoonIcon`, `SunIcon`
- **Misc:** `StarIcon`, `HeartIcon`, `ShareIcon`, `RefreshCwIcon`, `LoaderIcon`, `GlobeIcon`

**Icon Sizes:** `2xs` | `xs` | `sm` | `md` | `lg` | `xl`

### Custom Composites

| Component             | Description                                  |
| --------------------- | -------------------------------------------- |
| `FormField`           | Complete form field with label, input, error |
| `PrimaryButton`       | Styled primary action button                 |
| `AppHeader`           | App header with title and avatar             |
| `AuthCard`            | Authentication flow card                     |
| `SocialAuthButton`    | OAuth provider button                        |
| `ForgotPasswordModal` | Password recovery modal                      |
| `StatCard`            | Statistics display card                      |

## Styling

### Tailwind Classes

All components accept `className` for Tailwind styling:

```tsx
<Box className="p-4 bg-background-50 rounded-lg shadow-md">
  <Text className="text-typography-900 font-semibold">Styled content</Text>
</Box>
```

### Variants (TVA)

Components use Tailwind Variants for type-safe styling:

```tsx
// Button variants
<Button action="primary" variant="solid" size="lg" />
<Button action="negative" variant="outline" size="sm" />

// Heading sizes map to semantic HTML
<Heading size="2xl" />  {/* h1 */}
<Heading size="xl" />   {/* h2 */}
<Heading size="lg" />   {/* h3 */}
```

### Dark Mode

Wrap your app with `GluestackUIProvider`:

```tsx
import { GluestackUIProvider } from "@app/components";

<GluestackUIProvider mode="dark">{children}</GluestackUIProvider>;
```

## Platform-Specific Behavior

Some components have platform-specific implementations:

| Component  | Web           | Native                |
| ---------- | ------------- | --------------------- |
| `Box`      | `<div>`       | `<View>`              |
| `Text`     | `<span>`      | `<Text>`              |
| `Heading`  | `<h1>`-`<h6>` | `@expo/html-elements` |
| `Card`     | CSS shadows   | React Native shadows  |
| `Skeleton` | CSS animation | Reanimated            |

Platform-specific files use `.web.tsx` suffix:

```
button/
├── index.tsx      # Native implementation
├── index.web.tsx  # Web implementation (optional)
└── styles.tsx     # Shared styles
```

## Accessibility

All components include accessibility features:

- **Semantic HTML** on web (headings, buttons, links)
- **ARIA attributes** (`aria-label`, `aria-describedby`, `aria-invalid`)
- **Keyboard navigation** (Enter/Space for buttons)
- **Screen reader support** (`accessibilityRole`, `accessibilityLabel`)
- **Focus management** for modals and overlays

```tsx
<FormField
  label="Email"
  error="Invalid email"
  input={{
    placeholder: "you@example.com",
    accessibilityLabel: "Email address input",
  }}
/>
// Automatically links label, input, and error with IDs
// Sets aria-invalid when error present
```

## Provider Setup

Required at app root:

```tsx
// app/_layout.tsx or App.tsx
import { GluestackUIProvider } from "@app/components";

export default function RootLayout({ children }) {
  return <GluestackUIProvider mode="light">{children}</GluestackUIProvider>;
}
```

The provider includes:

- Theme mode (light/dark)
- Overlay system (modals, popovers)
- Toast notifications

## Directory Structure

```
src/
├── index.ts                 # Main exports
├── gluestack-provider/      # Theme provider
├── box/                     # Box component
│   ├── index.tsx           # Native
│   ├── index.web.tsx       # Web
│   └── styles.tsx          # Shared styles
├── button/                  # Button component
├── input/                   # Input component
├── icon/                    # Icon system
├── FormField/               # Custom composite
├── PrimaryButton/           # Custom composite
└── ... (50+ components)
```

## Dependencies

**Peer Dependencies (must be installed in your app):**

- `react` ^19.0.0
- `react-native`
- `@gluestack-ui/nativewind-utils` ^1.0.0
- `nativewind` ^4.0.0
- `react-native-svg`

**Runtime Dependencies:**

- `@expo/html-elements` - Semantic HTML for React Native
- `@legendapp/motion` - Animations
- `@gorhom/bottom-sheet` - Bottom sheet
- `tailwind-merge` - Class merging
- `tailwind-variants` - Variant system

## Adding Components

1. Create component directory:

```
src/my-component/
├── index.tsx       # Implementation
├── index.web.tsx   # Web-specific (optional)
└── styles.tsx      # TVA styles
```

2. Define styles with TVA:

```tsx
// styles.tsx
import { tva } from "@gluestack-ui/nativewind-utils/tva";

export const myComponentStyle = tva({
  base: "flex-row items-center p-4",
  variants: {
    size: {
      sm: "p-2",
      md: "p-4",
      lg: "p-6",
    },
  },
});
```

3. Create component:

```tsx
// index.tsx
import { forwardRef } from "react";
import { View, ViewProps } from "react-native";
import { myComponentStyle } from "./styles";

type Props = ViewProps & {
  size?: "sm" | "md" | "lg";
};

export const MyComponent = forwardRef<View, Props>(({ size = "md", className, ...props }, ref) => (
  <View ref={ref} className={myComponentStyle({ size, class: className })} {...props} />
));

MyComponent.displayName = "MyComponent";
```

4. Export from `index.ts`:

```tsx
export * from "./my-component";
```

## Related Packages

| Package                | Purpose                                   |
| ---------------------- | ----------------------------------------- |
| `@app/ui`              | Screens, hooks, business logic components |
| `@app/tailwind-config` | Shared Tailwind configuration             |
| `@app/config`          | RBAC, subscription tiers                  |
