---
name: frontend-designer
description: Use when designing UI/UX for features - creates component hierarchies, specifications, and design tokens before implementation
allowed-tools: Read, Glob, Grep
---

# Frontend Designer

Design cross-platform UI components and user flows.

> **Shared rules apply:** See README for screens, error states, responsive design, and i18n requirements.

## Design Process

1. Requirements → 2. User Flow → 3. Component Breakdown → 4. Layout Spec → 5. Responsive Rules → 6. Accessibility → 7. Translation Keys

## UI Quality Bar

| Requirement           | Description                                                            |
| --------------------- | ---------------------------------------------------------------------- |
| **Consistent Rhythm** | Every card `p-4`, every section `mt-6`, every list row `py-3`          |
| **Type Hierarchy**    | One big headline + smaller supporting line; don't spam bold            |
| **Micro-Structure**   | Dividers, subtle borders (`border border-outline-100`), muted captions |
| **Realistic Content** | Show 6-10 items in lists, plausible names/dates/status                 |
| **States Everywhere** | Skeletons and empty states on ALL lists                                |
| **Polished Details**  | Consistent radii, subtle shadows, proper touch targets                 |

## Output Format

Design documents must include these sections:

### 1. User Flow

Steps, edge cases (loading, error, empty states).

### 2. Component Hierarchy

Tree of components in `packages/ui/src/screens/private/`. Include error/empty states from `@app/components`.

### 3. Layout Specification

Container width, padding, spacing, typography classes.

### 4. Responsive Behavior (CRITICAL)

- Small phone (<380px): reduced padding, smaller fonts
- Large phone (380-768px): standard layout
- Tablet/Desktop (≥768px): max-width centered, multi-column

### 5. Accessibility

Focus management, screen reader labels, contrast, touch targets.

### 6. Translation Keys

Table of all text with English + Spanish values. Location: `packages/i18n/src/locales/{en,es}/`.

## Design Tokens

**Border Radius:** `rounded-xl` (12px) small elements, `rounded-2xl` (16px) cards/buttons, `rounded-3xl` (24px) modals

**Spacing:** `2` (8px tight), `3` (12px compact), `4` (16px standard), `6` (24px spacious), `8` (32px large)

**Typography:**

| Role           | Tailwind Class               |
| -------------- | ---------------------------- |
| Hero Headline  | `text-3xl font-bold`         |
| Page Title     | `text-2xl font-bold`         |
| Section Title  | `text-lg font-semibold`      |
| Body           | `text-base`                  |
| Caption/Helper | `text-sm text-content-muted` |

**Colors:** `primary-*`, `secondary-*`, `surface`, `surface-canvas`, `content`, `content-muted`, `outline-100/200`, `success-*`, `error-*`

## Available Components (from @app/components)

Layout: VStack, HStack, Box, Center, Divider | Typography: Heading, Text | Forms: Input, InputField, Button, Select, Checkbox, Switch | Feedback: Toast, Alert, Spinner | Overlays: Modal, Actionsheet, Popover | Data: Avatar, Badge, Card | States: NetworkError, GeneralError, EmptyState, EmptyList

## Key Visual Patterns

**Hero Header:** `<VStack className="px-4 pt-8 pb-6">` + Heading + subtitle

**Card:** `<Box className="bg-surface rounded-2xl p-4 border border-outline-100">`

**List Row:** Pressable + HStack + Avatar + VStack (title/subtitle) + ChevronRight + Divider

**Buttons:** Primary (`bg-primary-600 rounded-2xl`), Secondary (`variant="outline"`), Tertiary (`variant="link"`)

## Cross-Platform

| Pattern    | Web              | Mobile                     |
| ---------- | ---------------- | -------------------------- |
| Navigation | App Router pages | Expo Router screens        |
| Modals     | Dialog component | ActionSheet / Modal        |
| Scroll     | Native scroll    | ScrollView / FlatList      |
| Touch      | Click handlers   | Pressable/TouchableOpacity |

## Checklist

- [ ] User flows documented with loading/error/empty states
- [ ] Component hierarchy in `packages/ui/src/screens/`
- [ ] Layout specs with design tokens (no magic values)
- [ ] Responsive breakpoints for all screen sizes
- [ ] Accessibility requirements listed
- [ ] Translation keys with English + Spanish text
- [ ] Platform-specific callbacks documented (signOut)
