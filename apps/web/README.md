# 🌐 Web App (Next.js)

The web application built with Next.js 15 and React Native Web for cross-platform component compatibility.

## 🚀 Quick Start

```bash
# From project root
pnpm --filter web dev

# Or from this directory
pnpm dev        # Start development server
pnpm build      # Build for production
pnpm start      # Start production server
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🏗️ Architecture

This app demonstrates:
- **Next.js 15**: App Router with Server Components
- **React Native Web**: Renders React Native components as HTML
- **Shared UI Components**: Uses components from `packages/ui/`
- **Hybrid Approach**: Mix React (HTML) and React Native components

## 📁 Key Files

```
apps/web/
├── src/app/
│   ├── page.tsx            # Home page
│   ├── nativewind/         # Shared components demo
│   └── layout.tsx          # Root layout
├── next.config.ts          # Next.js + RN Web config
├── tailwind.config.js      # Tailwind configuration
└── package.json            # Dependencies & scripts
```

## 🎨 Mixing React & React Native

You can seamlessly mix HTML elements with React Native components:

```tsx
export default function Page() {
  return (
    <div className="container">           {/* HTML element */}
      <header className="header">         {/* HTML element */}
        <Button                           {/* React Native component */}
          title="Shared Component"
          onPress={() => alert('Works!')}
        />
      </header>
    </div>
  );
}
```

## ⚙️ Configuration

### React Native Web Setup
The `next.config.ts` handles React Native Web integration:

```tsx
transpilePackages: [
  'react-native',
  'react-native-web',
  'nativewind',
],
webpack: (config) => {
  config.resolve.alias = {
    'react-native$': 'react-native-web',  // Key transformation
  };
  // Platform-specific file extensions
  config.resolve.extensions = [
    '.web.ts', '.web.tsx', '.web.js',
    ...config.resolve.extensions,
  ];
}
```

### Tailwind Integration
Works with both HTML elements and React Native components via NativeWind.

## 🔧 Development Features

- **Hot Reload**: Fast refresh for development
- **TypeScript**: Full type safety
- **Server Components**: Next.js 15 App Router
- **Cross-Platform Components**: Shared with mobile app

## 📦 Key Dependencies

- `next` - React framework
- `react-native-web` - RN components → HTML
- `nativewind` - Tailwind for React Native
- `ui` - Shared component library

## 🚀 Deployment

### Vercel (Recommended)
```bash
pnpm build
# Deploy to Vercel via Git or CLI
```

### Other Platforms
```bash
pnpm build
# Deploy the `.next` directory to any hosting platform
```

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Native Web](https://necolas.github.io/react-native-web/)
- [NativeWind Guide](https://www.nativewind.dev/)
- [Vercel Deployment](https://vercel.com/docs)
