# Design System

A comprehensive, high-quality design system for cross-platform apps built with NativeWind and Gluestack UI.

## Philosophy

This design system prioritizes:

- **PURPOSE over percentages** - No rigid 60-30-10 color rules
- **HIERARCHY through contrast** - Visual importance via contrast, not just color ratios
- **CONTEXT-DRIVEN decisions** - Based on content and user needs
- **BRAND EXPRESSION** - Without formula constraints

## Quick Start

```tsx
import { Typography, PrimaryButton, View } from "@app/components";

function FeatureCard() {
  return (
    <View className="bg-surface p-6 rounded-2xl shadow-md">
      <Typography variant="overline" color="muted">
        NEW FEATURE
      </Typography>
      <Typography variant="h2" className="mt-2">
        Dashboard Analytics
      </Typography>
      <Typography variant="body-md" className="mt-4">
        Track your metrics in real-time with beautiful charts.
      </Typography>
      <PrimaryButton onPress={handleClick} className="mt-6">
        Get Started
      </PrimaryButton>
    </View>
  );
}
```

## Color System

### Semantic Surfaces

Use for layout hierarchy - where content lives:

| Token              | Light   | Dark    | Usage            |
| ------------------ | ------- | ------- | ---------------- |
| `surface-canvas`   | #FAFAF9 | #0C0A09 | App background   |
| `surface`          | #FFFFFF | #1C1917 | Cards, panels    |
| `surface-elevated` | #FFFFFF | #292524 | Modals, popovers |
| `surface-sunken`   | #F5F5F4 | #0C0A09 | Inset areas      |
| `surface-inverse`  | #1C1917 | #FAFAF9 | Dark on light    |

```tsx
<View className="bg-surface-canvas min-h-screen">
  <View className="bg-surface rounded-xl shadow-md p-6">
    <View className="bg-surface-sunken rounded-lg p-4">Inset content</View>
  </View>
</View>
```

### Semantic Content

Use for text and icons - what users read:

| Token              | Light   | Dark    | Usage                  |
| ------------------ | ------- | ------- | ---------------------- |
| `content`          | #44403C | #D6D3D1 | Body text              |
| `content-emphasis` | #1C1917 | #FAFAF9 | Headings, important    |
| `content-muted`    | #A8A29E | #78716C | Captions, hints        |
| `content-inverse`  | #FFFFFF | #1C1917 | On colored backgrounds |
| `content-link`     | #F97066 | #FEB8B0 | Interactive text       |

```tsx
<Typography variant="h1" className="text-content-emphasis">Page Title</Typography>
<Typography variant="body-md" className="text-content">Body text here.</Typography>
<Typography variant="caption" className="text-content-muted">Helper text</Typography>
```

### Brand Colors

Flexible usage based on context:

| Scale   | Primary     | Secondary   | Accent      |
| ------- | ----------- | ----------- | ----------- |
| 50      | #FFF5F4     | #F0FDF6     | #FFFBEB     |
| 100     | #FFE8E6     | #DCFCE9     | #FEF3C7     |
| 200     | #FFCFC9     | #BBF7D4     | #FDE68A     |
| 300     | #FEB8B0     | #86EFB8     | #FCD34D     |
| 400     | #F99B91     | #7DD3A8     | #FBBF24     |
| **500** | **#F97066** | **#4ADE80** | **#F59E0B** |
| 600     | #E85A50     | #22C55E     | #D97706     |
| 700     | #D64940     | #16A34A     | #B45309     |
| 800     | #B83A32     | #166534     | #92400E     |
| 900     | #952E28     | #14532D     | #78350F     |

```tsx
<PrimaryButton variant="solid">Primary Action</PrimaryButton>
<View className="bg-primary-500 text-white p-4">Brand moment</View>
<Badge className="bg-secondary-100 text-secondary-800">Success</Badge>
```

### Functional States

Use for feedback - meaning, not decoration:

| State   | Background | Border  | Text    | Icon    |
| ------- | ---------- | ------- | ------- | ------- |
| Success | #F0FDF4    | #86EFAC | #166534 | #22C55E |
| Warning | #FFFBEB    | #FCD34D | #92400E | #F59E0B |
| Error   | #FEF2F2    | #FCA5A5 | #991B1B | #EF4444 |
| Info    | #EFF6FF    | #93C5FD | #1E40AF | #3B82F6 |

```tsx
<Alert className="bg-success-bg border border-success-border">
  <Icon className="text-success-icon" />
  <Text className="text-success-text">Operation completed!</Text>
</Alert>
```

## Typography

### Semantic Variants

```tsx
import { Typography, DisplayText, HeadingText, BodyText, Caption, Label } from "@app/components";

// Display - Large hero text
<DisplayText size="lg">Welcome Back</DisplayText>

// Headings - Section titles
<HeadingText level={1}>Page Title</HeadingText>
<HeadingText level={2}>Section Title</HeadingText>
<HeadingText level={3}>Subsection</HeadingText>

// Body - Content text
<BodyText size="lg">Intro paragraph with more emphasis.</BodyText>
<BodyText>Standard body text for most content.</BodyText>
<BodyText size="sm">Smaller body text for dense content.</BodyText>

// Special purpose
<Lead>An intro paragraph that summarizes the content.</Lead>
<Overline>CATEGORY LABEL</Overline>
<Caption>Image caption or fine print</Caption>
<Label>Form label</Label>
<Code>inline_code</Code>
```

### Font Size Scale

| Token              | Size | Line Height | Usage             |
| ------------------ | ---- | ----------- | ----------------- |
| `text-display-2xl` | 72px | 1.1         | Hero headlines    |
| `text-display-xl`  | 60px | 1.1         | Large headlines   |
| `text-display-lg`  | 48px | 1.1         | Section heroes    |
| `text-heading-xl`  | 24px | 1.3         | Page titles       |
| `text-heading-lg`  | 20px | 1.4         | Section titles    |
| `text-heading-md`  | 18px | 1.4         | Subsections       |
| `text-body-lg`     | 18px | 1.6         | Intro paragraphs  |
| `text-body-md`     | 16px | 1.6         | Body text         |
| `text-body-sm`     | 14px | 1.6         | Secondary content |
| `text-caption`     | 12px | 1.4         | Captions, hints   |
| `text-overline`    | 11px | 1.4         | Category labels   |
| `text-label`       | 14px | 1.4         | Form labels       |

### Letter Spacing

```tsx
<Text className="tracking-tightest">Display text (-0.05em)</Text>
<Text className="tracking-tight">Headlines (-0.01em)</Text>
<Text className="tracking-normal">Body text (0)</Text>
<Text className="tracking-wide">Subtle emphasis (0.025em)</Text>
<Text className="tracking-widest">Overlines (0.1em)</Text>
<Text className="tracking-caps">ALL CAPS TEXT (0.15em)</Text>
```

## Animation & Motion

CSS-based animations using Tailwind classes. These work on both web and mobile through NativeWind.

### Tailwind Animation Classes

```tsx
// Continuous animations
<View className="animate-float">Floating element</View>
<View className="animate-bounce">Bouncing</View>
<View className="animate-pulse">Pulsing opacity</View>
<View className="animate-spin">Spinning</View>
<View className="animate-ping">Ping effect</View>
<View className="animate-wiggle">Wiggle attention</View>

// Entry animations
<View className="animate-fade-in">Fade in</View>
<View className="animate-slide-up">Slide up</View>
<View className="animate-scale-in">Scale in</View>
<View className="animate-pop-in">Pop in</View>

// Loading
<View className="animate-shimmer bg-gradient-to-r from-surface via-surface-sunken to-surface" />
```

### Transition Timing

```tsx
// Duration presets
<View className="duration-instant" />  // 50ms
<View className="duration-fast" />     // 150ms
<View className="duration-normal" />   // 250ms
<View className="duration-slow" />     // 400ms
<View className="duration-slower" />   // 600ms

// Easing presets
<View className="ease-smooth" />    // Smooth default
<View className="ease-bounce" />    // Playful bounce
<View className="ease-elastic" />   // Elastic snap
<View className="ease-spring" />    // Spring-like
<View className="ease-out-expo" />  // Dramatic exit
```

## Dark Mode

### Implementation

```tsx
// Colors automatically adjust with dark: prefix
<View className="bg-surface dark:bg-dark-surface">
  <Text className="text-content dark:text-dark-content">Adapts to theme</Text>
</View>;

// Using NativeWind's useColorScheme
import { useColorScheme } from "nativewind";

function ThemeToggle() {
  const { colorScheme, setColorScheme } = useColorScheme();

  return (
    <Switch
      value={colorScheme === "dark"}
      onValueChange={(v) => setColorScheme(v ? "dark" : "light")}
    />
  );
}
```

### Dark Mode Color Tokens

Access via `dark:` prefix or `dark.*` colors:

| Token           | Dark Value | Usage          |
| --------------- | ---------- | -------------- |
| `dark-canvas`   | #0C0A09    | App background |
| `dark-surface`  | #1C1917    | Cards          |
| `dark-elevated` | #292524    | Modals         |
| `dark-content`  | #D6D3D1    | Body text      |
| `dark-emphasis` | #FAFAF9    | Headings       |
| `dark-muted`    | #78716C    | Captions       |

## Shadows & Elevation

### Shadow Scale

```tsx
<View className="shadow-sm" />    // Subtle
<View className="shadow" />        // Default
<View className="shadow-md" />     // Cards
<View className="shadow-lg" />     // Dropdowns
<View className="shadow-xl" />     // Modals
<View className="shadow-2xl" />    // Dialogs
```

### Focus Rings

```tsx
// Primary focus ring
<Button className="focus:shadow-focus" />

// Error focus ring
<Input className="focus:shadow-focus-error" />

// Web focus-visible
<Button className="focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2" />
```

## Spacing & Layout

### Border Radius

```tsx
<View className="rounded" />      // 4px
<View className="rounded-lg" />   // 8px
<View className="rounded-xl" />   // 16px
<View className="rounded-2xl" />  // 24px
<View className="rounded-3xl" />  // 32px
<View className="rounded-full" /> // 9999px
```

## Interactive States

### Hover & Active

```tsx
<Pressable className="bg-surface hover:bg-interactive-hover active:bg-interactive-active">
  Interactive element
</Pressable>

// Dark mode variants
<Pressable className="bg-dark-surface hover:bg-interactive-hover-dark active:bg-interactive-active-dark">
  Dark interactive
</Pressable>
```

### Disabled States

```tsx
<Button disabled className="bg-interactive-disabled text-interactive-disabled-text opacity-50">
  Disabled
</Button>
```

## Component Examples

### High-Quality Card

```tsx
<View
  className="bg-surface rounded-2xl shadow-md p-6
  transition-all duration-normal
  hover:shadow-lg hover:-translate-y-1
  dark:bg-dark-surface group"
>
  <Overline>FEATURED</Overline>
  <HeadingText level={3} className="mt-2">
    Card Title
  </HeadingText>
  <BodyText className="mt-3 text-content-muted">Card description with helpful context.</BodyText>
  <PrimaryButton className="mt-4" size="sm">
    Learn More
  </PrimaryButton>
</View>
```

### Form with Validation

```tsx
<FormField label="Email Address" error={errors.email?.message} required>
  <Input
    placeholder="you@example.com"
    className={errors.email ? "border-error-border focus:shadow-focus-error" : ""}
  />
</FormField>
```

### Alert States

```tsx
// Success
<View className="bg-success-bg border border-success-border rounded-xl p-4">
  <HStack className="items-center gap-3">
    <CheckCircle className="text-success-icon" />
    <Text className="text-success-text font-medium">Successfully saved!</Text>
  </HStack>
</View>

// Error
<View className="bg-error-bg border border-error-border rounded-xl p-4 animate-shake">
  <HStack className="items-center gap-3">
    <XCircle className="text-error-icon" />
    <Text className="text-error-text font-medium">Please fix the errors below.</Text>
  </HStack>
</View>
```

## Best Practices

### 1. Use Semantic Tokens

```tsx
// ✅ Good - uses semantic tokens
<View className="bg-surface text-content" />

// ❌ Avoid - hardcoded colors
<View style={{ backgroundColor: "#FFFFFF", color: "#44403C" }} />
```

### 2. Provide Both Light and Dark Variants

```tsx
// ✅ Good - both modes covered
<Text className="text-content dark:text-dark-content" />

// ❌ Avoid - only light mode
<Text className="text-gray-800" />
```

### 3. Use Typography Component for Text

```tsx
// ✅ Good - semantic typography
<HeadingText level={2}>Section Title</HeadingText>
<BodyText>Content paragraph...</BodyText>

// ❌ Avoid - raw Text with manual styling
<Text style={{ fontSize: 24, fontWeight: 'bold' }}>Section Title</Text>
```

### 4. Use CSS Animations for Polish

```tsx
// ✅ Good - CSS animations with Tailwind
<View className="animate-fade-in">
  {items.map((item) => (
    <ListItem key={item.id} />
  ))}
</View>;

// Use transition classes for hover/focus states
<Button className="transition-all duration-normal hover:scale-105">Click me</Button>;
```

## Resources

- [NativeWind Dark Mode](https://www.nativewind.dev/docs/core-concepts/dark-mode)
- [NativeWind Theming](https://www.nativewind.dev/docs/guides/themes)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Gluestack UI Components](https://gluestack.io/ui/docs/components)
