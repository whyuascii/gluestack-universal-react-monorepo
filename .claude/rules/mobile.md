# Mobile Development Rules

Applies to: `apps/mobile/**`

- Mobile routes are thin wrappers — screen logic lives in `packages/ui/src/screens/`
- MUST pass `signOut` from `@app/auth/client/native` to any shared screen with sign-out
- Web and mobile auth clients are separate Better Auth instances — never share state
- Wrap screens in `<SafeAreaView className="flex-1">`
- Use `KeyboardAvoidingView` for forms: `behavior={Platform.OS === "ios" ? "padding" : "height"}`
- NativeWind classes work but no `hover:` or `cursor-*` prefixes
- Use `Platform.OS` not `typeof window` for platform detection
- Test on: iPhone SE (375px), iPhone 15 (393px), iPad (768px+)
