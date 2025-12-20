# Components Package

The `components` package provides cross-platform UI components using **gluestack UI v3** and custom components.

## Overview

**gluestack UI v3** provides truly cross-platform components that work identically on web (Next.js) and mobile (React Native).

## Installation

Already installed as a workspace dependency in your apps:

```json
{
  "dependencies": {
    "components": "workspace:*"
  }
}
```

## Usage

```tsx
import { Button, ButtonText, Box, Text, Input } from "@app/components";

function MyScreen() {
  return (
    <Box className="flex-1 p-4 bg-background-0">
      <Text className="text-2xl font-bold mb-4">Welcome</Text>
      <Input className="mb-4" placeholder="Enter your email" />
      <Button className="bg-primary-500 px-6 py-3 rounded-lg">
        <ButtonText className="text-white">Submit</ButtonText>
      </Button>
    </Box>
  );
}
```

## Available Components

### Layout

- `Box` - Container component
- `Center` - Center content
- `HStack` - Horizontal stack
- `VStack` - Vertical stack

### Typography

- `Text` - Text component
- `Heading` - Heading component

### Forms

- `Button` / `ButtonText`
- `Input`
- `Checkbox`
- `Radio`
- `Switch`
- `Textarea`

### Feedback

- `Alert`
- `Progress`
- `Spinner`
- `Toast`

### Overlay

- `Modal`
- `Popover`
- `Tooltip`

## Styling

All components support className prop with Tailwind classes:

```tsx
<Button className="bg-primary-500 hover:bg-primary-600 px-4 py-2 rounded-lg">
  <ButtonText className="text-white font-medium">Click Me</ButtonText>
</Button>
```

## Platform-Specific Behavior

Components automatically adapt to the platform:

- **Web**: Renders as HTML elements with CSS
- **Mobile**: Renders as React Native components

## Custom Components

Create custom components in `packages/components/src/`:

```tsx
// packages/components/src/card/index.tsx
import { Box, Text } from "../core";

export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box className="bg-background-50 p-4 rounded-lg shadow-md">
      <Text className="text-lg font-bold mb-2">{title}</Text>
      {children}
    </Box>
  );
}
```

Export from `packages/components/src/index.ts`:

```typescript
export { Card } from "./card";
```

## Related Documentation

- [Cross-Platform Strategy](../architecture/cross-platform.md)
- [Adding Components Guide](../guides/adding-components.md)
- [UI Package](./ui.md)
