# UI Components Guide

This guide covers the shared UI components in `packages/components` that help build polished, cross-platform user experiences.

## Overview

The components package provides:

- **Error States** - Network errors, general errors, empty states
- **Animations** - Smooth transitions with React Native Reanimated
- **Typography** - Semantic text components
- **Haptic Feedback** - Touch feedback for mobile
- **Permissions** - Unified permission handling
- **Offline Detection** - Network status indicators

## Error States

Beautiful, consistent error and empty state screens.

### NetworkError

Display when network requests fail.

```tsx
import { NetworkError } from "@app/components";

function MyScreen() {
  const { data, error, refetch } = useQuery(...);

  if (error) {
    return <NetworkError onRetry={refetch} />;
  }

  return <Content data={data} />;
}
```

**Props:**

| Prop             | Type         | Default | Description                        |
| ---------------- | ------------ | ------- | ---------------------------------- |
| `onRetry`        | `() => void` | -       | Callback when retry button pressed |
| `onGoHome`       | `() => void` | -       | Callback when home button pressed  |
| `showHomeButton` | `boolean`    | `true`  | Show the home navigation button    |

### GeneralError

Customizable error screen for any error type.

```tsx
import { GeneralError } from "@app/components";

<GeneralError
  title="Payment Failed"
  message="We couldn't process your payment. Please try again."
  onRetry={() => retryPayment()}
  retryText="Retry Payment"
  icon={CreditCard}
  iconColorClass="text-warning-icon"
  iconBgClass="bg-warning-bg"
/>;
```

**Props:**

| Prop             | Type            | Default                | Description                   |
| ---------------- | --------------- | ---------------------- | ----------------------------- |
| `title`          | `string`        | "Something went wrong" | Error title                   |
| `message`        | `string`        | -                      | Error description             |
| `onRetry`        | `() => void`    | -                      | Retry callback                |
| `retryText`      | `string`        | "Try Again"            | Retry button text             |
| `isRetrying`     | `boolean`       | `false`                | Show loading state            |
| `onGoHome`       | `() => void`    | -                      | Home navigation callback      |
| `showHomeButton` | `boolean`       | `true`                 | Show home button              |
| `icon`           | `ComponentType` | `AlertCircle`          | Custom icon                   |
| `iconColorClass` | `string`        | `"text-error-icon"`    | Icon color                    |
| `iconBgClass`    | `string`        | `"bg-error-bg"`        | Icon background               |
| `compact`        | `boolean`       | `false`                | Compact mode for inline usage |
| `errorDetails`   | `string`        | -                      | Dev-only error details        |
| `componentStack` | `string`        | -                      | Dev-only component stack      |

### EmptyState

Show when lists or content areas are empty.

```tsx
import { EmptyState } from "@app/components";
import { FileText, Plus } from "lucide-react-native";

<EmptyState
  icon={FileText}
  title="No documents yet"
  message="Create your first document to get started"
  actionText="Create Document"
  actionIcon={Plus}
  onAction={() => setShowCreateModal(true)}
  suggestions={["Import from Google Docs", "Start from a template", "Upload a PDF"]}
/>;
```

### Preset Empty States

Pre-configured empty states for common scenarios:

```tsx
import {
  EmptySearchResults,
  EmptyList,
  EmptyNotifications,
  EmptyFavorites
} from "@app/components";

// No search results
<EmptySearchResults
  query={searchQuery}
  onClear={() => setSearchQuery("")}
/>

// Empty list with add action
<EmptyList
  itemName="tasks"
  onAdd={() => setShowAddTask(true)}
/>

// No notifications
<EmptyNotifications />

// No favorites
<EmptyFavorites onExplore={() => navigateToExplore()} />
```

### Using with ErrorBoundary

Wrap your app sections with ErrorBoundary for automatic error handling:

```tsx
import { ErrorBoundary } from "@app/analytics";
import { GeneralError } from "@app/components";

<ErrorBoundary
  fallback={(error, info, retry) => (
    <GeneralError
      onRetry={retry}
      errorDetails={error.toString()}
      componentStack={info.componentStack}
    />
  )}
>
  <YourComponent />
</ErrorBoundary>;
```

## Typography

Semantic typography components for consistent text styling.

```tsx
import { Typography, HeadingText, BodyText } from "@app/components";

// Using Typography component
<Typography variant="display-lg" color="emphasis">
  Welcome Back
</Typography>

<Typography variant="body-md" color="muted">
  Sign in to continue to your account
</Typography>

// Using specialized components
<HeadingText level={1}>Page Title</HeadingText>
<HeadingText level={2}>Section Title</HeadingText>

<BodyText size="lg">Large body text</BodyText>
<BodyText size="sm" color="muted">Small muted text</BodyText>
```

**Typography Variants:**

| Category | Variants                                                              |
| -------- | --------------------------------------------------------------------- |
| Display  | `display-2xl`, `display-xl`, `display-lg`, `display-md`, `display-sm` |
| Headings | `h1`, `h2`, `h3`, `h4`, `h5`, `h6`                                    |
| Body     | `body-xl`, `body-lg`, `body-md`, `body-sm`, `body-xs`                 |
| Special  | `lead`, `caption`, `overline`, `label`, `code`, `blockquote`          |

**Color Options:**

- `default` - Standard text color
- `emphasis` - High emphasis (headings)
- `muted` - Secondary text
- `subtle` - Tertiary text
- `inverse` - For dark backgrounds
- `primary`, `error`, `success`, `warning` - Semantic colors

## HapticTab

Add haptic feedback to tab bar buttons.

```tsx
import { Tabs } from "expo-router";
import { HapticTab } from "@app/components";

<Tabs
  screenOptions={{
    tabBarButton: HapticTab,
  }}
>
  <Tabs.Screen name="home" />
  <Tabs.Screen name="settings" />
</Tabs>;
```

### Haptic Feedback Hooks

Use haptics anywhere in your app:

```tsx
import { useHaptics, triggerHaptic, triggerNotificationHaptic } from "@app/components";

function MyComponent() {
  const { impact, selection, notification, isAvailable } = useHaptics();

  const handlePress = () => {
    impact("medium"); // light, medium, heavy, soft, rigid
  };

  const handleToggle = () => {
    selection(); // For toggles, checkboxes
  };

  const handleSuccess = () => {
    notification("success"); // success, warning, error
  };

  return <Button onPress={handlePress}>Press Me</Button>;
}

// Or use standalone functions
triggerHaptic("heavy");
triggerNotificationHaptic("error");
```

## PermissionRequester

Unified permission handling for camera, location, notifications, etc.

### Using the Hook

```tsx
import { usePermission } from "@app/components";

function CameraScreen() {
  const { status, request, openSettings, info, isGranted } = usePermission("camera");

  if (!isGranted) {
    return (
      <View>
        <Text>{info.description}</Text>
        <Button onPress={request}>Enable Camera</Button>
        {status === "denied" && <Button onPress={openSettings}>Open Settings</Button>}
      </View>
    );
  }

  return <CameraView />;
}
```

### Using the Component

```tsx
import { PermissionRequester, PermissionRequestView } from "@app/components";

// Render prop pattern
<PermissionRequester
  permission="camera"
  onGranted={() => startCamera()}
  onDenied={() => showFallback()}
>
  {({ status, request, openSettings, info }) => (
    <Button onPress={request}>
      {status === "denied" ? "Open Settings" : "Enable Camera"}
    </Button>
  )}
</PermissionRequester>

// Pre-built UI
<PermissionRequestView
  permission="notifications"
  onGranted={() => enablePush()}
  onSkip={() => navigation.goBack()}
/>
```

**Supported Permissions:**

- `camera` - Camera access
- `location` - Foreground location
- `locationBackground` - Background location
- `notifications` - Push notifications
- `mediaLibrary` - Photo library
- `contacts` - Contacts access
- `microphone` - Microphone access

## OfflineIndicator

Show network status to users.

### Basic Usage

```tsx
import { OfflineIndicator } from "@app/components";

function App() {
  return (
    <>
      <OfflineIndicator position="top" />
      <MainContent />
    </>
  );
}
```

### Variants

```tsx
// Banner style (default)
<OfflineIndicator variant="banner" />

// Minimal style
<OfflineIndicator variant="minimal" />

// Floating style
<OfflineIndicator variant="floating" />
```

### Custom Messages

```tsx
<OfflineIndicator
  message="No internet connection"
  onlineMessage="Back online!"
  showOnlineMessage={true}
  onlineMessageDuration={3000}
  showRetry={true}
  onRetry={() => refetchAll()}
/>
```

### Using the Hook

```tsx
import { useNetworkStatus } from "@app/components";

function MyComponent() {
  const { isOffline, isOnline, isConnected, isInternetReachable } = useNetworkStatus();

  if (isOffline) {
    return <OfflineFallback />;
  }

  return <OnlineContent />;
}
```

### OfflineAware Wrapper

Automatically show offline screen when disconnected:

```tsx
import { OfflineAware } from "@app/components";

<OfflineAware offlineComponent={<CustomOfflineScreen />} onRetry={() => refetch()}>
  <MainContent />
</OfflineAware>;
```

## Best Practices

### Error Handling Pattern

```tsx
function DataScreen() {
  const { data, error, isLoading, refetch } = useQuery(...);
  const { isOffline } = useNetworkStatus();

  // Network error
  if (isOffline) {
    return <NetworkError onRetry={refetch} />;
  }

  // Loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // API error
  if (error) {
    return (
      <GeneralError
        title="Failed to load data"
        message={error.message}
        onRetry={refetch}
        compact
      />
    );
  }

  // Empty state
  if (!data?.length) {
    return (
      <EmptyList
        itemName="items"
        onAdd={() => setShowAddModal(true)}
      />
    );
  }

  // Success
  return <DataList data={data} />;
}
```

### Animation Guidelines

1. **Use enter animations sparingly** - Only on important UI elements
2. **Keep durations short** - 200-400ms is usually best
3. **Use spring for natural feel** - Especially for modals and sheets
4. **Stagger list items** - 50-100ms delay creates nice flow
5. **Match exit to enter** - If fadeInUp, use fadeOutDown

### Accessibility

All components include proper accessibility attributes:

```tsx
<NotificationBell
  accessibilityLabel={`${unreadCount} unread notifications`}
  accessibilityRole="button"
/>

<EmptyState
  // Announces content to screen readers
  accessibilityLiveRegion="polite"
/>
```

## Component Exports

All components are exported from `@app/components`:

```tsx
import {
  // Error States
  NetworkError,
  GeneralError,
  EmptyState,
  EmptySearchResults,
  EmptyList,
  EmptyNotifications,
  EmptyFavorites,

  // Typography
  Typography,
  HeadingText,
  BodyText,

  // Haptics
  HapticTab,
  useHaptics,
  triggerHaptic,
  triggerSelectionHaptic,
  triggerNotificationHaptic,

  // Permissions
  PermissionRequester,
  PermissionRequestView,
  usePermission,

  // Offline
  OfflineIndicator,
  OfflineAware,
  useNetworkStatus,
} from "@app/components";
```
