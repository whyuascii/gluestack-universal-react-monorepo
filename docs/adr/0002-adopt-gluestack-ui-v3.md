# 0002 - Adopt Gluestack UI v3 for Cross-Platform Components

- **Status**: Accepted
- **Date**: 2024-12-09
- **Decision Makers**: Frontend Team
- **Supersedes**: N/A
- **Superseded by**: N/A

## Context

The monorepo needed a UI component library that would:

- Work seamlessly across web (Next.js) and mobile (React Native/Expo)
- Support styling with Tailwind CSS via NativeWind
- Provide accessible, production-ready components
- Minimize platform-specific code
- Enable maximum code sharing between web and mobile apps

## Decision

We will use **Gluestack UI v3** as our primary UI component library, integrated with **NativeWind** for styling.

The implementation will:

- House components in a shared package (`packages/components`)
- Use NativeWind (Tailwind CSS for React Native) for styling
- Centralize theme configuration in `packages/tailwind-config`
- Implement both gluestack primitives and custom components
- Use the `@gluestack/ui-next-adapter` for Next.js compatibility

## Rationale

This decision was made because:

1. **True Cross-Platform**: Gluestack UI components work identically on web and React Native
2. **Tailwind Integration**: NativeWind allows using Tailwind classes on both platforms
3. **Type Safety**: Full TypeScript support with excellent type inference
4. **Accessibility**: Components built with accessibility in mind (ARIA, keyboard navigation)
5. **Customizable**: Highly composable and customizable components
6. **Modern Stack**: Aligns with our React 19 and modern tooling approach
7. **Code Sharing**: Enables sharing 80%+ of UI code between web and mobile

## Consequences

### Positive

- Single component library for both platforms reduces maintenance
- Consistent design system across web and mobile
- Tailwind's utility-first approach speeds up development
- Shared theme configuration ensures visual consistency
- Reduces bundle size compared to separate component libraries

### Negative

- Gluestack v3 is relatively new with a smaller ecosystem
- Some components may need platform-specific adjustments
- Learning curve for developers new to NativeWind
- Documentation is still evolving

### Neutral

- Components must be tested on both web and mobile
- Theme changes require restart of dev servers
- Some React Native limitations apply to web (e.g., no CSS grid)

## Alternatives Considered

### Alternative 1: React Native Paper + Separate Web Components

**Pros:**

- Mature React Native component library
- Material Design out of the box
- Well-documented

**Cons:**

- Would need separate component library for web
- No code sharing for components
- Different design system for each platform

**Why not chosen:** Lack of code sharing defeated the purpose of a monorepo.

### Alternative 2: Tamagui

**Pros:**

- Excellent performance optimizations
- Strong Tailwind-like styling
- Cross-platform support

**Cons:**

- Complex setup and configuration
- Steeper learning curve
- Less compatible with standard React Native components

**Why not chosen:** Complexity outweighed benefits for our use case.

### Alternative 3: Custom Component Library

**Pros:**

- Complete control over implementation
- Exactly matches our needs
- No third-party dependencies

**Cons:**

- Massive development time investment
- Reinventing the wheel
- Accessibility would need manual implementation
- Ongoing maintenance burden

**Why not chosen:** Not feasible given timeline and resources.

## Implementation Notes

- Install `@gluestack-ui/core`, `@gluestack-ui/utils` as peer dependencies
- Use `@gluestack/ui-next-adapter` in Next.js config
- Configure NativeWind in both web and mobile apps
- Export all components from `packages/components/src/index.ts`
- Create custom components following gluestack patterns
- Test all components on iOS, Android, and web before merging

## References

- [Gluestack UI Documentation](https://ui.gluestack.io/)
- [NativeWind Documentation](https://www.nativewind.dev/)
- [Components Package](../packages/components.md)
- [Cross-Platform Architecture](../architecture/cross-platform.md)

## Revision History

| Date       | Author | Changes       |
| ---------- | ------ | ------------- |
| 2024-12-09 | Claude | Initial draft |
