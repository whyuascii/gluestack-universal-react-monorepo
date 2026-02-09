# packages/tailwind-config — Tailwind + NativeWind Theme

Shared Tailwind configuration factory for web and mobile.

## Key Files

- `index.js` — Factory function that creates Tailwind configs with theme merging
- `themes/` — Theme presets (starter, default, sample)
- `DESIGN-SYSTEM.md` — Comprehensive design token reference (semantic colors, typography, spacing)

## Usage

```javascript
// In apps/web/tailwind.config.js or apps/mobile/tailwind.config.js
const { createTailwindConfig } = require("@app/tailwind-config");
module.exports = createTailwindConfig({ theme: "default" });
```

## Rules

- Config is a factory function, not a static export
- Content paths always include `packages/components/src` and `packages/ui/src`
- Gluestack colors use `gs-` prefix (e.g., `gs-primary-500`)
- See `DESIGN-SYSTEM.md` for all semantic tokens before creating new styles
- NativeWind preset is auto-included for React Native compatibility
