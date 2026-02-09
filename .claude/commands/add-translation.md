Add translation keys for a feature.

Feature/namespace: $ARGUMENTS

Follow these steps:

1. Check if namespace already exists in `packages/i18n/src/locales/en/`
2. Add keys to English file first (source of truth)
3. Add same keys to Spanish (`es/`) with proper translations
4. If new namespace: register in `packages/i18n/src/languages.json` and update both `i18n.web.ts` and `i18n.mobile.ts`
5. Verify keys match across all languages

Use the `i18n-manager` skill for detailed patterns. Preserve `{{placeholders}}` exactly.
