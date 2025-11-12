# React Native Monorepo Template

## 📋 Current Versions & Updates

> **Note**: This template currently uses:
> - **Tailwind CSS v3** - Utility-first CSS framework
> - **NativeWind v4** - Tailwind CSS for React Native
> - **Expo SDK 54** - React Native development platform
> - **gluestack-v3** - Crossplatform, Copy & Paste Shadcn style like UI primitives library

## 🚀 Features

- **🔄 Cross-Platform**: Share components between web and mobile
- **📦 Monorepo**: Turborepo with pnpm workspaces
- **🎨 Consistent Styling**: Using gluestack-v3 components with NativeWind (Tailwind for React Native)
- **⚡ Fast Development**: Hot reload on all platforms
- **📱 Modern Stack**: Next.js 15, Expo, React 19, TypeScript
- **🏗️ Clean Architecture**: Minimal, extensible, production-ready


## 🛠️ Tech Stack

| Technology       | Purpose                      | Version |
|------------------|------------------------------|---------|
| **Turborepo**    | Monorepo build system        | Latest  |
| **Next.js**      | React framework for web      | 15.x    |
| **Expo**         | React Native platform        | 54.x    |
| **React**        | UI library                   | 19.0    |
| **NativeWind**   | Cross-platform styling       | 4.x     |
| **gluestack-v3** | Cross-platform UI primitives | 3.x     |
| **TypeScript**   | Type safety                  | 5.x     |
| **pnpm**         | Package manager              | 10.x    |

## 📁 Project Structure

```
react-native-starter/
├── apps/
│   ├── mobile/          # Expo React Native app
│   └── web/             # Next.js web app
├── packages/
│   └── ui/              # Shared component library based on gluestack-v3
├── CLAUDE.md            # AI assistant guidance
├── turbo.json           # Turborepo configuration
└── package.json         # Root dependencies & scripts
```

## 🚦 Quick Start

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

```bash
# Start all apps (web + mobile)
pnpm dev

# Start individual apps
pnpm --filter web dev      # Next.js web app
pnpm --filter mobile dev   # Expo mobile app
```

### Platform-Specific Commands

```bash
# Mobile development
cd apps/mobile
pnpm ios       # iOS simulator
pnpm android   # Android emulator
pnpm web       # Web browser

# Web development
cd apps/web
pnpm dev       # Development server
pnpm build     # Production build
pnpm start     # Production server
```

## 🏗️ Architecture


## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development |
| `pnpm build` | Build all apps for production |
| `pnpm lint` | Lint all workspaces |
| `pnpm check-types` | TypeScript type checking |

## 🚀 Deployment



## 📚 Documentation

### Core Technologies
- **[Next.js](https://nextjs.org/docs)** - React framework with App Router
- **[Expo](https://docs.expo.dev/)** - React Native development platform
- **[Turborepo](https://turbo.build/repo/docs)** - High-performance build system
- **[React Native](https://reactnative.dev/docs/getting-started)** - Cross-platform mobile development
- **[TypeScript](https://www.typescriptlang.org/docs/)** - Type-safe JavaScript

### Styling & UI
- **[Tailwind CSS v3](https://tailwindcss.com/docs)** - Utility-first CSS framework
- **[NativeWind](https://www.nativewind.dev/)** - Tailwind CSS for React Native
- **[gluestack](https://www.nativewind.dev/)** - Cross-Platform Copy-paste UI components library
- **[React Native Web](https://necolas.github.io/react-native-web/)** - RN components for web

### Development Tools
- **[pnpm](https://pnpm.io/motivation)** - Fast, disk space efficient package manager
- **[Expo Router](https://docs.expo.dev/router/introduction/)** - File-based routing for React Native
- **[EAS Build](https://docs.expo.dev/build/introduction/)** - Cloud build service for React Native

### Deployment


## 🔗 Links

---

**Built with Turborepo • Next.js • Expo • NativeWind • gluestack**
