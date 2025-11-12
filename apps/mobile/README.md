# 📱 Mobile App (Expo)

The React Native mobile app built with Expo and NativeWind for cross-platform styling.

## 🚀 Quick Start

```bash
# From project root
pnpm --filter mobile dev

# Or from this directory
pnpm dev        # Start Metro bundler
pnpm ios        # Open iOS simulator  
pnpm android    # Open Android emulator
pnpm web        # Open in browser
```

## 🏗️ Architecture

This app demonstrates:
- **Expo Router**: File-based routing with tab navigation
- **Shared UI Components**: Uses components from `packages/ui/`
- **NativeWind**: Tailwind CSS classes for consistent styling
- **Cross-Platform**: Same code runs on iOS, Android, and web

## 📁 Key Files

```
apps/mobile/
├── src/app/
│   ├── (tabs)/
│   │   ├── (home)/         # Home tab
│   │   └── demo/           # Demo tab
│   ├── _layout.tsx         # Root layout
│   └── index.tsx           # Entry redirect
├── tailwind.config.js      # NativeWind configuration
└── package.json            # Dependencies & scripts
```

## 🎨 Styling

Uses NativeWind for Tailwind CSS classes on React Native components:

```tsx
<View className="flex-1 bg-gray-50 p-4">
  <Text className="text-2xl font-bold text-gray-900">
    Styled with Tailwind
  </Text>
</View>
```

## 🔧 Development

- **Hot Reload**: Enabled for fast development
- **TypeScript**: Full type safety
- **Expo Router**: File-based navigation
- **Safe Area**: Proper handling with `react-native-safe-area-context`

## 📦 Key Dependencies

- `expo` - React Native platform
- `expo-router` - File-based routing
- `nativewind` - Tailwind for React Native
- `ui` - Shared component library
- `react-native-safe-area-context` - Safe area handling

## 🚀 Building & Deployment

```bash
# Development build
eas build --profile development

# Production builds
eas build --platform ios
eas build --platform android

# Submit to app stores
eas submit
```

## 📚 Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [NativeWind Guide](https://www.nativewind.dev/)
- [EAS Build & Submit](https://docs.expo.dev/build/introduction/)
