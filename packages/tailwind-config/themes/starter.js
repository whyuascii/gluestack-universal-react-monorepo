/**
 * Starter Theme Configuration
 *
 * A flexible, hierarchy-driven design system that prioritizes:
 * - PURPOSE over percentages (no rigid 60-30-10)
 * - HIERARCHY through contrast, not just color ratios
 * - CONTEXT-DRIVEN decisions based on content and user needs
 * - BRAND EXPRESSION without formula constraints
 *
 * Color Philosophy:
 * ─────────────────
 * Instead of "60% dominant, 30% secondary, 10% accent", we use:
 *
 * SURFACES (where content lives):
 *   canvas    → App background, largest areas
 *   surface   → Cards, panels, content containers
 *   elevated  → Modals, dropdowns, floating elements
 *   overlay   → Backdrops, scrims
 *
 * CONTENT (what users read/see):
 *   muted     → De-emphasized text, placeholders
 *   default   → Body text, standard content
 *   emphasis  → Headings, important info
 *   inverse   → Text on dark/colored backgrounds
 *
 * ACTIONS (what users interact with):
 *   subtle    → Ghost buttons, low-priority actions
 *   default   → Standard buttons, links
 *   strong    → Primary CTAs, important actions
 *
 * STATES (feedback and status):
 *   success, warning, error, info → Functional, not decorative
 *
 * BRAND (identity and expression):
 *   primary, secondary, accent → Flexible usage based on context
 */

// ─────────────────────────────────────────────────────────────────
// BRAND COLORS
// Update these to customize for your app. Everything else derives.
// ─────────────────────────────────────────────────────────────────
const brand = {
  // Primary - Your main brand color. Use for key actions and brand moments.
  primary: {
    base: "#F97066", // Warm coral
    light: "#FFE8E6",
    dark: "#B83A32",
  },
  // Secondary - Supporting brand color. Use for secondary actions and accents.
  secondary: {
    base: "#7DD3A8", // Soft sage
    light: "#DCFCE9",
    dark: "#166534",
  },
  // Accent - Highlights and special moments. Use sparingly for impact.
  accent: {
    base: "#F59E0B", // Golden amber
    light: "#FEF3C7",
    dark: "#92400E",
  },
  // Neutrals - Grays with personality
  neutral: {
    lightest: "#FAFAF9",
    light: "#F5F5F4",
    medium: "#A8A29E",
    dark: "#44403C",
    darkest: "#1C1917",
  },
};

// ─────────────────────────────────────────────────────────────────
// SEMANTIC SURFACES
// Where content lives. Not about percentages—about hierarchy.
// ─────────────────────────────────────────────────────────────────
const surfaces = {
  canvas: brand.neutral.lightest, // App background
  surface: "#FFFFFF", // Cards, panels
  elevated: "#FFFFFF", // Modals, popovers
  sunken: brand.neutral.light, // Inset areas, wells
  overlay: "rgba(28, 25, 23, 0.5)", // Backdrop scrims
  inverse: brand.neutral.darkest, // Dark surfaces
};

// ─────────────────────────────────────────────────────────────────
// SEMANTIC CONTENT
// What users read. Hierarchy through contrast, not color ratios.
// ─────────────────────────────────────────────────────────────────
const content = {
  muted: brand.neutral.medium, // Placeholders, captions
  default: brand.neutral.dark, // Body text
  emphasis: brand.neutral.darkest, // Headings, important
  inverse: "#FFFFFF", // On dark backgrounds
  link: brand.primary.base, // Interactive text
  linkHover: brand.primary.dark,
};

// ─────────────────────────────────────────────────────────────────
// FUNCTIONAL STATES
// Feedback colors. Use based on meaning, not decoration.
// ─────────────────────────────────────────────────────────────────
const states = {
  success: {
    bg: "#F0FDF4",
    bgStrong: "#22C55E",
    border: "#86EFAC",
    text: "#166534",
    icon: "#22C55E",
  },
  warning: {
    bg: "#FFFBEB",
    bgStrong: "#F59E0B",
    border: "#FCD34D",
    text: "#92400E",
    icon: "#F59E0B",
  },
  error: {
    bg: "#FEF2F2",
    bgStrong: "#EF4444",
    border: "#FCA5A5",
    text: "#991B1B",
    icon: "#EF4444",
  },
  info: {
    bg: "#EFF6FF",
    bgStrong: "#3B82F6",
    border: "#93C5FD",
    text: "#1E40AF",
    icon: "#3B82F6",
  },
};

// ─────────────────────────────────────────────────────────────────
// DARK MODE COLORS
// Carefully crafted for optimal contrast and reduced eye strain
// ─────────────────────────────────────────────────────────────────
const darkSurfaces = {
  canvas: "#0C0A09", // Deep warm black
  surface: "#1C1917", // Card background
  elevated: "#292524", // Modals, popovers
  sunken: "#0C0A09", // Inset areas
  overlay: "rgba(0, 0, 0, 0.7)", // Backdrop
  inverse: "#FAFAF9", // Light surfaces on dark
};

const darkContent = {
  muted: "#78716C", // De-emphasized
  default: "#D6D3D1", // Body text
  emphasis: "#FAFAF9", // Headings
  inverse: "#1C1917", // On light backgrounds
  link: "#FEB8B0", // Lighter for dark bg
  linkHover: "#F99B91",
};

const darkStates = {
  success: {
    bg: "#052E16",
    bgStrong: "#22C55E",
    border: "#166534",
    text: "#86EFAC",
    icon: "#4ADE80",
  },
  warning: {
    bg: "#451A03",
    bgStrong: "#F59E0B",
    border: "#92400E",
    text: "#FCD34D",
    icon: "#FBBF24",
  },
  error: {
    bg: "#450A0A",
    bgStrong: "#EF4444",
    border: "#991B1B",
    text: "#FCA5A5",
    icon: "#F87171",
  },
  info: {
    bg: "#172554",
    bgStrong: "#3B82F6",
    border: "#1E40AF",
    text: "#93C5FD",
    icon: "#60A5FA",
  },
};

// ─────────────────────────────────────────────────────────────────
// EXPORTED THEME
// ─────────────────────────────────────────────────────────────────
module.exports = {
  colors: {
    // ═══════════════════════════════════════════════════════════
    // BRAND PALETTE (flexible usage based on context)
    // ═══════════════════════════════════════════════════════════
    primary: {
      0: "#FFFFFF",
      50: "#FFF5F4",
      100: "#FFE8E6",
      200: "#FFCFC9",
      300: "#FEB8B0",
      400: "#F99B91",
      500: brand.primary.base,
      600: "#E85A50",
      700: "#D64940",
      800: brand.primary.dark,
      900: "#952E28",
      950: "#5C1B18",
    },

    secondary: {
      0: "#FFFFFF",
      50: "#F0FDF6",
      100: "#DCFCE9",
      200: "#BBF7D4",
      300: "#86EFB8",
      400: brand.secondary.base,
      500: "#4ADE80",
      600: "#22C55E",
      700: "#16A34A",
      800: brand.secondary.dark,
      900: "#14532D",
      950: "#052E16",
    },

    accent: {
      50: "#FFFBEB",
      100: "#FEF3C7",
      200: "#FDE68A",
      300: "#FCD34D",
      400: "#FBBF24",
      500: brand.accent.base,
      600: "#D97706",
      700: "#B45309",
      800: brand.accent.dark,
      900: "#78350F",
    },

    // ═══════════════════════════════════════════════════════════
    // SEMANTIC SURFACES (use these for layout hierarchy)
    // ═══════════════════════════════════════════════════════════
    surface: {
      canvas: surfaces.canvas,
      DEFAULT: surfaces.surface,
      elevated: surfaces.elevated,
      sunken: surfaces.sunken,
      overlay: surfaces.overlay,
      inverse: surfaces.inverse,
    },

    // ═══════════════════════════════════════════════════════════
    // SEMANTIC CONTENT (use these for text and icons)
    // ═══════════════════════════════════════════════════════════
    content: {
      muted: content.muted,
      DEFAULT: content.default,
      emphasis: content.emphasis,
      inverse: content.inverse,
      link: content.link,
      "link-hover": content.linkHover,
    },

    // ═══════════════════════════════════════════════════════════
    // FUNCTIONAL STATES (use for feedback, not decoration)
    // ═══════════════════════════════════════════════════════════
    success: {
      0: "#FFFFFF",
      50: states.success.bg,
      100: "#DCFCE7",
      200: "#BBF7D0",
      300: states.success.border,
      400: "#4ADE80",
      500: states.success.bgStrong,
      600: "#16A34A",
      700: "#15803D",
      800: states.success.text,
      900: "#14532D",
      950: "#052E16",
      bg: states.success.bg,
      border: states.success.border,
      text: states.success.text,
      icon: states.success.icon,
    },

    warning: {
      0: "#FFFFFF",
      50: states.warning.bg,
      100: "#FEF3C7",
      200: "#FDE68A",
      300: states.warning.border,
      400: "#FBBF24",
      500: states.warning.bgStrong,
      600: "#D97706",
      700: "#B45309",
      800: states.warning.text,
      900: "#78350F",
      950: "#451A03",
      bg: states.warning.bg,
      border: states.warning.border,
      text: states.warning.text,
      icon: states.warning.icon,
    },

    error: {
      0: "#FFFFFF",
      50: states.error.bg,
      100: "#FEE2E2",
      200: "#FECACA",
      300: states.error.border,
      400: "#F87171",
      500: states.error.bgStrong,
      600: "#DC2626",
      700: "#B91C1C",
      800: states.error.text,
      900: "#7F1D1D",
      950: "#450A0A",
      bg: states.error.bg,
      border: states.error.border,
      text: states.error.text,
      icon: states.error.icon,
    },

    info: {
      0: "#FFFFFF",
      50: states.info.bg,
      100: "#DBEAFE",
      200: "#BFDBFE",
      300: states.info.border,
      400: "#60A5FA",
      500: states.info.bgStrong,
      600: "#2563EB",
      700: "#1D4ED8",
      800: states.info.text,
      900: "#1E3A8A",
      950: "#172554",
      bg: states.info.bg,
      border: states.info.border,
      text: states.info.text,
      icon: states.info.icon,
    },

    // ═══════════════════════════════════════════════════════════
    // GLUESTACK COMPATIBILITY (existing patterns still work)
    // ═══════════════════════════════════════════════════════════
    tertiary: {
      0: "#FFFFFF",
      50: "#F0F9FF",
      100: "#E0F2FE",
      200: "#BAE6FD",
      300: "#7DD3FC",
      400: "#38BDF8",
      500: "#0EA5E9",
      600: "#0284C7",
      700: "#0369A1",
      800: "#075985",
      900: "#0C4A6E",
      950: "#082F49",
    },

    typography: {
      0: "#FFFFFF",
      50: brand.neutral.lightest,
      100: brand.neutral.light,
      200: "#E7E5E4",
      300: "#D6D3D1",
      400: brand.neutral.medium,
      500: "#78716C",
      600: "#57534E",
      700: brand.neutral.dark,
      800: "#292524",
      900: brand.neutral.darkest,
      950: "#0C0A09",
      white: "#FFFFFF",
      gray: brand.neutral.medium,
      black: brand.neutral.darkest,
    },

    outline: {
      0: "#FFFFFF",
      50: brand.neutral.lightest,
      100: brand.neutral.light,
      200: "#E7E5E4",
      300: "#D6D3D1",
      400: brand.neutral.medium,
      500: "#78716C",
      600: "#57534E",
      700: brand.neutral.dark,
      800: "#292524",
      900: brand.neutral.darkest,
      950: "#0C0A09",
    },

    background: {
      0: "#FFFFFF",
      50: brand.neutral.lightest,
      100: brand.neutral.light,
      200: "#E7E5E4",
      300: "#D6D3D1",
      400: brand.neutral.medium,
      500: "#78716C",
      600: "#57534E",
      700: brand.neutral.dark,
      800: "#292524",
      900: brand.neutral.darkest,
      950: "#0C0A09",
      // Semantic shortcuts
      error: states.error.bg,
      warning: states.warning.bg,
      success: states.success.bg,
      info: states.info.bg,
      muted: brand.neutral.light,
      light: brand.neutral.lightest,
      dark: brand.neutral.darkest,
    },

    indicator: {
      primary: brand.primary.base,
      info: states.info.bgStrong,
      error: states.error.bgStrong,
      success: states.success.bgStrong,
      warning: states.warning.bgStrong,
    },

    // ═══════════════════════════════════════════════════════════
    // DARK MODE SEMANTIC TOKENS
    // Use with dark: prefix (e.g., dark:bg-dark-surface)
    // ═══════════════════════════════════════════════════════════
    dark: {
      // Surfaces
      canvas: darkSurfaces.canvas,
      surface: darkSurfaces.surface,
      elevated: darkSurfaces.elevated,
      sunken: darkSurfaces.sunken,
      overlay: darkSurfaces.overlay,
      inverse: darkSurfaces.inverse,

      // Content
      muted: darkContent.muted,
      content: darkContent.default,
      emphasis: darkContent.emphasis,
      "content-inverse": darkContent.inverse,
      link: darkContent.link,
      "link-hover": darkContent.linkHover,

      // Primary adjusted for dark
      primary: {
        50: "#3D1513",
        100: "#5C1B18",
        200: "#7A2520",
        300: "#952E28",
        400: brand.primary.dark,
        500: brand.primary.base,
        600: "#F99B91",
        700: "#FEB8B0",
        800: "#FFCFC9",
        900: "#FFE8E6",
      },

      // States for dark mode
      success: {
        bg: darkStates.success.bg,
        border: darkStates.success.border,
        text: darkStates.success.text,
        icon: darkStates.success.icon,
      },
      warning: {
        bg: darkStates.warning.bg,
        border: darkStates.warning.border,
        text: darkStates.warning.text,
        icon: darkStates.warning.icon,
      },
      error: {
        bg: darkStates.error.bg,
        border: darkStates.error.border,
        text: darkStates.error.text,
        icon: darkStates.error.icon,
      },
      info: {
        bg: darkStates.info.bg,
        border: darkStates.info.border,
        text: darkStates.info.text,
        icon: darkStates.info.icon,
      },
    },

    // ═══════════════════════════════════════════════════════════
    // INTERACTIVE STATES (for buttons, inputs, links)
    // ═══════════════════════════════════════════════════════════
    interactive: {
      // Focus ring colors
      focus: brand.primary.light,
      "focus-visible": brand.primary.base,
      "focus-error": states.error.border,

      // Hover states
      hover: "rgba(0, 0, 0, 0.04)",
      "hover-dark": "rgba(255, 255, 255, 0.08)",

      // Active/pressed states
      active: "rgba(0, 0, 0, 0.08)",
      "active-dark": "rgba(255, 255, 255, 0.12)",

      // Disabled states
      disabled: brand.neutral.light,
      "disabled-text": brand.neutral.medium,
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // TYPOGRAPHY
  // ═══════════════════════════════════════════════════════════════
  fontFamily: {
    heading: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
    body: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
    mono: ["ui-monospace", "SFMono-Regular", "monospace"],
    sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
    display: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
    jakarta: ["var(--font-plus-jakarta-sans)"],
    roboto: ["var(--font-roboto)"],
    code: ["var(--font-source-code-pro)"],
    inter: ["var(--font-inter)"],
    "space-mono": ["var(--font-space-mono)"],
  },

  fontWeight: {
    extrablack: "950",
  },

  fontSize: {
    "2xs": ["10px", { lineHeight: "14px" }],
    xs: ["12px", { lineHeight: "16px" }],
    sm: ["14px", { lineHeight: "20px" }],
    base: ["16px", { lineHeight: "24px" }],
    lg: ["18px", { lineHeight: "28px" }],
    xl: ["20px", { lineHeight: "28px" }],
    "2xl": ["24px", { lineHeight: "32px" }],
    "3xl": ["30px", { lineHeight: "36px" }],
    "4xl": ["36px", { lineHeight: "40px" }],
    "5xl": ["48px", { lineHeight: "1" }],
    "6xl": ["60px", { lineHeight: "1" }],
    "7xl": ["72px", { lineHeight: "1" }],
    // Semantic sizes for typography component
    "display-2xl": ["72px", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
    "display-xl": ["60px", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
    "display-lg": ["48px", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
    "display-md": ["36px", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
    "display-sm": ["30px", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
    "heading-xl": ["24px", { lineHeight: "1.3" }],
    "heading-lg": ["20px", { lineHeight: "1.4" }],
    "heading-md": ["18px", { lineHeight: "1.4" }],
    "heading-sm": ["16px", { lineHeight: "1.5" }],
    "body-xl": ["20px", { lineHeight: "1.6" }],
    "body-lg": ["18px", { lineHeight: "1.6" }],
    "body-md": ["16px", { lineHeight: "1.6" }],
    "body-sm": ["14px", { lineHeight: "1.6" }],
    "body-xs": ["12px", { lineHeight: "1.6" }],
    caption: ["12px", { lineHeight: "1.4" }],
    overline: ["11px", { lineHeight: "1.4", letterSpacing: "0.1em" }],
    label: ["14px", { lineHeight: "1.4", letterSpacing: "0.01em" }],
  },

  // ═══════════════════════════════════════════════════════════════
  // LETTER SPACING
  // ═══════════════════════════════════════════════════════════════
  letterSpacing: {
    tightest: "-0.05em",
    tighter: "-0.025em",
    tight: "-0.01em",
    normal: "0",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.1em",
    caps: "0.15em", // For all-caps text
  },

  // ═══════════════════════════════════════════════════════════════
  // LINE HEIGHT
  // ═══════════════════════════════════════════════════════════════
  lineHeight: {
    none: "1",
    tight: "1.1",
    snug: "1.25",
    normal: "1.5",
    relaxed: "1.625",
    loose: "2",
    // Semantic line heights
    heading: "1.2",
    body: "1.6",
    caption: "1.4",
  },

  // ═══════════════════════════════════════════════════════════════
  // BORDERS & SPACING
  // ═══════════════════════════════════════════════════════════════
  borderRadius: {
    xl: "16px",
    "2xl": "24px",
    "3xl": "32px",
    "4xl": "2rem",
    "5xl": "3rem",
  },

  spacing: {},

  // ═══════════════════════════════════════════════════════════════
  // TRANSITIONS (for smooth interactions)
  // ═══════════════════════════════════════════════════════════════
  transitionTimingFunction: {
    // Natural motion curves
    "ease-smooth": "cubic-bezier(0.4, 0, 0.2, 1)", // Default smooth
    "ease-bounce": "cubic-bezier(0.34, 1.56, 0.64, 1)", // Playful bounce
    "ease-elastic": "cubic-bezier(0.68, -0.55, 0.265, 1.55)", // Elastic snap
    "ease-out-expo": "cubic-bezier(0.19, 1, 0.22, 1)", // Dramatic exit
    "ease-in-expo": "cubic-bezier(0.95, 0.05, 0.795, 0.035)", // Dramatic entry
    "ease-spring": "cubic-bezier(0.175, 0.885, 0.32, 1.275)", // Spring-like
  },

  transitionDuration: {
    0: "0ms",
    50: "50ms",
    75: "75ms",
    100: "100ms",
    150: "150ms",
    200: "200ms",
    250: "250ms",
    300: "300ms",
    400: "400ms",
    500: "500ms",
    600: "600ms",
    700: "700ms",
    800: "800ms",
    1000: "1000ms",
    // Semantic durations
    instant: "50ms",
    fast: "150ms",
    normal: "250ms",
    slow: "400ms",
    slower: "600ms",
  },

  // ═══════════════════════════════════════════════════════════════
  // MOTION (keyframes and animations)
  // ═══════════════════════════════════════════════════════════════
  keyframes: {
    // Floating/ambient animations
    float: {
      "0%": { transform: "translateY(0px) rotate(0deg)" },
      "50%": { transform: "translateY(-10px) rotate(5deg)" },
      "100%": { transform: "translateY(0px) rotate(0deg)" },
    },
    // Fade animations
    "fade-in": {
      "0%": { opacity: "0" },
      "100%": { opacity: "1" },
    },
    "fade-out": {
      "0%": { opacity: "1" },
      "100%": { opacity: "0" },
    },
    // Slide animations
    "slide-up": {
      "0%": { transform: "translateY(10px)", opacity: "0" },
      "100%": { transform: "translateY(0)", opacity: "1" },
    },
    "slide-down": {
      "0%": { transform: "translateY(-10px)", opacity: "0" },
      "100%": { transform: "translateY(0)", opacity: "1" },
    },
    "slide-left": {
      "0%": { transform: "translateX(10px)", opacity: "0" },
      "100%": { transform: "translateX(0)", opacity: "1" },
    },
    "slide-right": {
      "0%": { transform: "translateX(-10px)", opacity: "0" },
      "100%": { transform: "translateX(0)", opacity: "1" },
    },
    // Scale animations
    "scale-in": {
      "0%": { transform: "scale(0.95)", opacity: "0" },
      "100%": { transform: "scale(1)", opacity: "1" },
    },
    "scale-out": {
      "0%": { transform: "scale(1)", opacity: "1" },
      "100%": { transform: "scale(0.95)", opacity: "0" },
    },
    "pop-in": {
      "0%": { transform: "scale(0.9)" },
      "50%": { transform: "scale(1.05)" },
      "100%": { transform: "scale(1)" },
    },
    // Bounce animations
    bounce: {
      "0%, 100%": { transform: "translateY(0)" },
      "50%": { transform: "translateY(-25%)" },
    },
    "bounce-subtle": {
      "0%, 100%": { transform: "translateY(0)" },
      "50%": { transform: "translateY(-5px)" },
    },
    // Pulse and glow
    pulse: {
      "0%, 100%": { opacity: "1" },
      "50%": { opacity: "0.5" },
    },
    "pulse-scale": {
      "0%, 100%": { transform: "scale(1)" },
      "50%": { transform: "scale(1.05)" },
    },
    glow: {
      "0%, 100%": { boxShadow: "0 0 5px rgba(249, 112, 102, 0.3)" },
      "50%": { boxShadow: "0 0 20px rgba(249, 112, 102, 0.6)" },
    },
    // Skeleton loading
    shimmer: {
      "0%": { backgroundPosition: "-200% 0" },
      "100%": { backgroundPosition: "200% 0" },
    },
    // Shake for errors
    shake: {
      "0%, 100%": { transform: "translateX(0)" },
      "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-4px)" },
      "20%, 40%, 60%, 80%": { transform: "translateX(4px)" },
    },
    // Spin
    spin: {
      "0%": { transform: "rotate(0deg)" },
      "100%": { transform: "rotate(360deg)" },
    },
    // Ping for notifications
    ping: {
      "75%, 100%": { transform: "scale(2)", opacity: "0" },
    },
    // Wiggle for attention
    wiggle: {
      "0%, 100%": { transform: "rotate(-3deg)" },
      "50%": { transform: "rotate(3deg)" },
    },
  },

  animation: {
    // Floating
    float: "float 6s ease-in-out infinite",
    "float-slow": "float 8s ease-in-out infinite",
    "float-delayed": "float 7s ease-in-out infinite 1s",
    // Fades
    "fade-in": "fade-in 0.3s ease-out forwards",
    "fade-out": "fade-out 0.3s ease-out forwards",
    "fade-in-fast": "fade-in 0.15s ease-out forwards",
    "fade-in-slow": "fade-in 0.5s ease-out forwards",
    // Slides
    "slide-up": "slide-up 0.3s ease-out forwards",
    "slide-down": "slide-down 0.3s ease-out forwards",
    "slide-left": "slide-left 0.3s ease-out forwards",
    "slide-right": "slide-right 0.3s ease-out forwards",
    "slide-up-fast": "slide-up 0.15s ease-out forwards",
    // Scales
    "scale-in": "scale-in 0.2s ease-out forwards",
    "scale-out": "scale-out 0.2s ease-out forwards",
    "pop-in": "pop-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
    // Bounces
    bounce: "bounce 1s ease-in-out infinite",
    "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
    // Pulses
    pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    "pulse-scale": "pulse-scale 2s ease-in-out infinite",
    glow: "glow 2s ease-in-out infinite",
    // Loading
    shimmer: "shimmer 2s linear infinite",
    spin: "spin 1s linear infinite",
    "spin-slow": "spin 3s linear infinite",
    // Feedback
    shake: "shake 0.5s ease-in-out",
    ping: "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite",
    wiggle: "wiggle 1s ease-in-out infinite",
  },

  // ═══════════════════════════════════════════════════════════════
  // SHADOWS (depth hierarchy, not decoration)
  // ═══════════════════════════════════════════════════════════════
  boxShadow: {
    // Elevation hierarchy
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)",
    none: "none",
    // Focus rings (accessibility)
    focus: `0 0 0 3px ${brand.primary.light}`,
    "focus-error": `0 0 0 3px ${states.error.border}`,
    // Gluestack compatibility
    "hard-1": "-2px 2px 8px 0px rgba(0, 0, 0, 0.15)",
    "hard-2": "0px 3px 10px 0px rgba(0, 0, 0, 0.15)",
    "hard-3": "2px 2px 8px 0px rgba(0, 0, 0, 0.15)",
    "hard-4": "0px -3px 10px 0px rgba(0, 0, 0, 0.15)",
    "hard-5": "0px 2px 10px 0px rgba(0, 0, 0, 0.08)",
    "soft-1": "0px 0px 10px rgba(0, 0, 0, 0.08)",
    "soft-2": "0px 0px 20px rgba(0, 0, 0, 0.15)",
    "soft-3": "0px 0px 30px rgba(0, 0, 0, 0.08)",
    "soft-4": "0px 0px 40px rgba(0, 0, 0, 0.08)",
  },
};
