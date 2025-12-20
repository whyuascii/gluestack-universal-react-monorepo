# Adding Components Guide

This guide walks through adding a new cross-platform component to the `components` package.

## Quick Start

1. Create component directory in `packages/components/src/`
2. Implement component using gluestack primitives
3. Export from `packages/components/src/index.ts`
4. Use in both web and mobile apps

## Step-by-Step Example

### 1. Create Component File

```bash
mkdir packages/components/src/custom-button
touch packages/components/src/custom-button/index.tsx
```

### 2. Implement Component

```tsx
// packages/components/src/custom-button/index.tsx
import { Pressable, Text } from "react-native";
import type { PressableProps } from "react-native";

export interface CustomButtonProps extends PressableProps {
  title: string;
  variant?: "primary" | "secondary" | "outline";
}

export function CustomButton({ title, variant = "primary", ...props }: CustomButtonProps) {
  const variantStyles = {
    primary: "bg-primary-500",
    secondary: "bg-secondary-500",
    outline: "bg-transparent border-2 border-primary-500",
  };

  const textStyles = {
    primary: "text-white",
    secondary: "text-white",
    outline: "text-primary-500",
  };

  return (
    <Pressable className={`px-6 py-3 rounded-lg ${variantStyles[variant]}`} {...props}>
      <Text className={`font-semibold text-center ${textStyles[variant]}`}>{title}</Text>
    </Pressable>
  );
}
```

### 3. Export Component

```typescript
// packages/components/src/index.ts
export { CustomButton } from "./custom-button";
export type { CustomButtonProps } from "./custom-button";
```

### 4. Use in Apps

```tsx
// apps/web/src/app/page.tsx or apps/mobile/src/app/index.tsx
import { CustomButton } from "@app/components";

export default function Page() {
  return (
    <CustomButton title="Click Me" variant="primary" onPress={() => console.log("Clicked!")} />
  );
}
```

## Best Practices

1. **Use gluestack primitives** - Ensures cross-platform compatibility
2. **TypeScript types** - Export prop interfaces
3. **NativeWind classes** - Use Tailwind for styling
4. **Platform detection** - Use `.web.tsx` / `.native.tsx` only when absolutely necessary
5. **Test on both platforms** - Always verify web and mobile work

## Platform-Specific Components

When you need different implementations:

```tsx
// packages/components/src/my-component/index.tsx (shared interface)
export interface MyComponentProps {
  title: string;
}

// packages/components/src/my-component/index.web.tsx
export function MyComponent({ title }: MyComponentProps) {
  return <div className="web-specific">{title}</div>;
}

// packages/components/src/my-component/index.native.tsx
export function MyComponent({ title }: MyComponentProps) {
  return (
    <View className="native-specific">
      <Text>{title}</Text>
    </View>
  );
}
```

## Related Documentation

- [Components Package](../packages/components.md)
- [Cross-Platform Strategy](../architecture/cross-platform.md)
