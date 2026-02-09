# packages/eslint-config — Shared ESLint Configuration

## Key Files

- `base.js` — Main config (ESLint flat config format)
- `nextjs.js` — Next.js-specific rules (extends base)
- `expo.js` — Expo/React Native rules (extends base)
- `node.js` — Node.js/API rules (extends base)

## Notes

- Uses **flat config** format (not legacy `.eslintrc`)
- Import order: alphabetized, type imports must be inline style
- `console.log` only warns (allows `console.warn`/`console.error`)
- Relaxed rules for `bottomsheet/` and `table/` directories
- Ignores: node_modules, dist, .next, .expo, drizzle migrations
