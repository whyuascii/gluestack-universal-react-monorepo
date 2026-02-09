Create a new cross-platform screen using the screen-builder skill workflow.

Screen name: $ARGUMENTS

Follow these steps in order:

1. Create the shared screen component in `packages/ui/src/screens/private/<name>/`
2. Create query/mutation hooks in `packages/ui/src/hooks/` if the screen needs API data
3. Add translation keys to `packages/i18n/src/locales/en/` AND `packages/i18n/src/locales/es/`
4. Create web route wrapper in `apps/web/src/app/(private)/<name>/page.tsx`
5. Create mobile route wrapper in `apps/mobile/src/app/(private)/<name>.tsx`
6. Export from barrel files: screen `index.ts` → `private/index.ts`
7. Run `pnpm typecheck` to verify

Use the `screen-builder` skill for detailed patterns. Use `@app/components` for UI primitives and design tokens from `packages/tailwind-config/DESIGN-SYSTEM.md`.
