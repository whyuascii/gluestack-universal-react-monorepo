/**
 * Typography Component
 *
 * Semantic text component with predefined styles for consistent typography.
 * Uses the typography scale from @app/tailwind-config.
 *
 * @example
 * ```tsx
 * <Typography variant="display-lg">Welcome</Typography>
 * <Typography variant="h1">Page Title</Typography>
 * <Typography variant="body-md">Body text content...</Typography>
 * <Typography variant="caption" color="muted">Small helper text</Typography>
 * ```
 */

import React from "react";
import { Text, type TextProps, Platform } from "react-native";

/**
 * Typography variants with semantic naming
 */
export type TypographyVariant =
  // Display - Large hero text, marketing
  | "display-2xl"
  | "display-xl"
  | "display-lg"
  | "display-md"
  | "display-sm"
  // Headings - Section titles, page headers
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  // Body - Main content text
  | "body-xl"
  | "body-lg"
  | "body-md"
  | "body-sm"
  | "body-xs"
  // Special purpose
  | "lead" // Intro paragraphs
  | "caption" // Image captions, fine print
  | "overline" // Category labels, eyebrows
  | "label" // Form labels, UI labels
  | "code" // Inline code
  | "blockquote"; // Quotations

/**
 * Semantic color options
 */
export type TypographyColor =
  | "default" // Normal text
  | "emphasis" // High contrast
  | "muted" // De-emphasized
  | "inverse" // On dark backgrounds
  | "primary" // Brand color
  | "success"
  | "warning"
  | "error"
  | "info"
  | "inherit"; // Inherit from parent

/**
 * Text alignment options
 */
export type TypographyAlign = "left" | "center" | "right" | "justify";

/**
 * Text weight options
 */
export type TypographyWeight = "normal" | "medium" | "semibold" | "bold" | "extrabold";

export interface TypographyProps extends Omit<TextProps, "style"> {
  /** Typography variant */
  variant?: TypographyVariant;
  /** Semantic color */
  color?: TypographyColor;
  /** Text alignment */
  align?: TypographyAlign;
  /** Font weight override */
  weight?: TypographyWeight;
  /** Text content */
  children: React.ReactNode;
  /** Additional className */
  className?: string;
  /** Whether to truncate with ellipsis */
  truncate?: boolean;
  /** Maximum number of lines (native only) */
  numberOfLines?: number;
  /** HTML element for web (semantic HTML) */
  as?: "p" | "span" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "label" | "code" | "blockquote";
}

/**
 * Variant to class mapping using semantic font sizes
 */
const variantClasses: Record<TypographyVariant, string> = {
  // Display variants
  "display-2xl": "text-display-2xl font-bold tracking-tightest",
  "display-xl": "text-display-xl font-bold tracking-tightest",
  "display-lg": "text-display-lg font-bold tracking-tighter",
  "display-md": "text-display-md font-bold tracking-tight",
  "display-sm": "text-display-sm font-semibold tracking-tight",

  // Heading variants
  h1: "text-heading-xl font-bold",
  h2: "text-heading-lg font-bold",
  h3: "text-heading-md font-semibold",
  h4: "text-heading-sm font-semibold",
  h5: "text-body-lg font-semibold",
  h6: "text-body-md font-semibold",

  // Body variants
  "body-xl": "text-body-xl font-normal",
  "body-lg": "text-body-lg font-normal",
  "body-md": "text-body-md font-normal",
  "body-sm": "text-body-sm font-normal",
  "body-xs": "text-body-xs font-normal",

  // Special purpose variants
  lead: "text-body-xl font-normal leading-relaxed",
  caption: "text-caption font-normal",
  overline: "text-overline font-medium uppercase tracking-widest",
  label: "text-label font-medium",
  code: "font-mono text-body-sm bg-surface-sunken px-1.5 py-0.5 rounded",
  blockquote: "text-body-lg italic border-l-4 border-primary-300 pl-4",
};

/**
 * Color to class mapping using semantic content tokens
 */
const colorClasses: Record<TypographyColor, string> = {
  default: "text-content",
  emphasis: "text-content-emphasis",
  muted: "text-content-muted",
  inverse: "text-content-inverse",
  primary: "text-primary-500",
  success: "text-success-text",
  warning: "text-warning-text",
  error: "text-error-text",
  info: "text-info-text",
  inherit: "",
};

/**
 * Alignment classes
 */
const alignClasses: Record<TypographyAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
  justify: "text-justify",
};

/**
 * Weight classes (for overriding variant defaults)
 */
const weightClasses: Record<TypographyWeight, string> = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
  extrabold: "font-extrabold",
};

/**
 * Default semantic HTML elements for each variant (web only)
 */
const variantToElement: Partial<Record<TypographyVariant, TypographyProps["as"]>> = {
  "display-2xl": "h1",
  "display-xl": "h1",
  "display-lg": "h1",
  "display-md": "h2",
  "display-sm": "h2",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  label: "label",
  code: "code",
  blockquote: "blockquote",
};

export const Typography: React.FC<TypographyProps> = ({
  variant = "body-md",
  color = "default",
  align,
  weight,
  children,
  className = "",
  truncate = false,
  numberOfLines,
  as,
  ...props
}) => {
  // Build class string
  const classes = [
    variantClasses[variant],
    colorClasses[color],
    align ? alignClasses[align] : "",
    weight ? weightClasses[weight] : "",
    truncate ? "truncate" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Determine the semantic element for web
  const element = as || variantToElement[variant] || "span";

  // Accessibility role for headings
  const accessibilityRole =
    variant.startsWith("h") || variant.startsWith("display") ? "header" : undefined;

  // On web, use semantic HTML elements
  if (Platform.OS === "web") {
    // For web, we'll still use Text but with role attribute
    // In a real implementation, you might use a custom web component
    return (
      <Text
        className={classes}
        numberOfLines={truncate ? 1 : numberOfLines}
        accessibilityRole={accessibilityRole}
        {...props}
      >
        {children}
      </Text>
    );
  }

  return (
    <Text
      className={classes}
      numberOfLines={truncate ? 1 : numberOfLines}
      accessibilityRole={accessibilityRole}
      {...props}
    >
      {children}
    </Text>
  );
};

/**
 * Convenience components for common typography patterns
 */

export const DisplayText: React.FC<
  Omit<TypographyProps, "variant"> & { size?: "2xl" | "xl" | "lg" | "md" | "sm" }
> = ({ size = "lg", ...props }) => <Typography variant={`display-${size}`} {...props} />;

export const HeadingText: React.FC<
  Omit<TypographyProps, "variant"> & { level?: 1 | 2 | 3 | 4 | 5 | 6 }
> = ({ level = 1, ...props }) => (
  <Typography variant={`h${level}` as TypographyVariant} {...props} />
);

export const BodyText: React.FC<
  Omit<TypographyProps, "variant"> & { size?: "xl" | "lg" | "md" | "sm" | "xs" }
> = ({ size = "md", ...props }) => <Typography variant={`body-${size}`} {...props} />;

export const Caption: React.FC<Omit<TypographyProps, "variant">> = (props) => (
  <Typography variant="caption" color="muted" {...props} />
);

export const Label: React.FC<Omit<TypographyProps, "variant">> = (props) => (
  <Typography variant="label" {...props} />
);

export const Lead: React.FC<Omit<TypographyProps, "variant">> = (props) => (
  <Typography variant="lead" {...props} />
);

export const Overline: React.FC<Omit<TypographyProps, "variant">> = (props) => (
  <Typography variant="overline" color="muted" {...props} />
);

export const Code: React.FC<Omit<TypographyProps, "variant">> = (props) => (
  <Typography variant="code" {...props} />
);

export const Blockquote: React.FC<Omit<TypographyProps, "variant">> = (props) => (
  <Typography variant="blockquote" {...props} />
);

export default Typography;
