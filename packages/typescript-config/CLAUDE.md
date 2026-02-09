# packages/typescript-config — Shared TypeScript Configuration

## Key Files

- `base.json` — Base config (ES2022 target, strict mode, CommonJS)
- `nextjs.json` — Next.js preset (extends base)
- `expo.json` — Expo preset (extends base)

## Notes

- All packages extend one of these configs via `"extends": "@app/typescript-config/base.json"`
- Strict null checks enabled
- `skipLibCheck: true` for faster builds
- Declaration maps and source maps enabled
