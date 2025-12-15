# Frontend Development Guides

Step-by-step guides for building cross-platform UI components and screens.

## Available Guides

### [Creating Screens](./creating-screens.md)

Build full screens that work on web and mobile:

- Screen component structure
- Navigation integration (Next.js + Expo Router)
- State management patterns
- Loading and error states

**Use this when:**

- Adding a new page/screen to your app
- Building authenticated views
- Creating form-based interfaces

### [Adding Components](./adding-components.md)

Create reusable UI components:

- Cross-platform component patterns
- Using Gluestack UI primitives
- Custom component development
- Component composition

**Use this when:**

- Building new UI elements
- Extracting reusable components
- Creating design system components

### [Styling Guide](./styling.md)

Master Tailwind CSS with NativeWind:

- Tailwind class usage
- Platform-specific styles
- Theme customization
- Responsive design
- Dark mode

**Use this when:**

- Styling components
- Implementing designs
- Creating consistent UI
- Adding dark mode support

## Quick Reference

### Component Best Practices

**Cross-platform component:**

```typescript
import { View, Text } from "components/core";
import { Button } from "components/button";

export function MyComponent() {
  return (
    <View className="p-4 bg-white dark:bg-gray-900">
      <Text className="text-lg font-bold">Hello World</Text>
      <Button onPress={() => {}} className="mt-4">
        Click Me
      </Button>
    </View>
  );
}
```

**Platform-specific code:**

```typescript
import { Platform } from "react-native";

const styles = Platform.select({
  web: "cursor-pointer hover:bg-gray-100",
  native: "active:bg-gray-100",
});
```

## Package Organization

- **`packages/components`** - Gluestack UI + custom primitives (Button, Input, etc.)
- **`packages/ui`** - Business logic, screens, hooks
- **Apps consume both** - Import from either package as needed

**Import pattern:**

```typescript
// Primitives from components
import { Button, Input, Text } from "components";

// Business logic from ui
import { useAuth } from "ui/hooks";
import { LoginScreen } from "ui/screens";
```

## Related Documentation

- **[Components Package Reference](../../reference/packages/components.md)** - Component API documentation
- **[UI Package Reference](../../reference/packages/ui.md)** - Screens and hooks reference
- **[Cross-Platform Concepts](../../concepts/cross-platform.md)** - How code sharing works
