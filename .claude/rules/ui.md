# UI Development Rules

Applies to: `packages/ui/**`, `packages/components/**`

- ALL screens live in `packages/ui/src/screens/` — never in `apps/web/` or `apps/mobile/`
- Apps only contain thin routing wrappers that import from `@app/ui/screens`
- ALL user-facing text must use `useTranslation()` — no hardcoded strings
- Use `@app/components` primitives — never raw `<div>`, `<span>`, or `<View>`
- Use design system tokens from `packages/tailwind-config/DESIGN-SYSTEM.md` — no magic color/size values
- Every screen must handle: loading state, error state, empty state
- Use `useWindowDimensions` for responsive breakpoints, not CSS media queries alone
- Export screens through the barrel chain: `Screen.tsx` → `index.ts` → `private/index.ts` → `screens/index.ts`
