import type { VariantProps } from "@gluestack-ui/utils/nativewind-utils";
import React from "react";
import { boxStyle } from "./styles";

type IBoxProps = React.ComponentPropsWithoutRef<"div"> &
  VariantProps<typeof boxStyle> & {
    className?: string;
    style?: React.CSSProperties | React.CSSProperties[];
  };

// Flatten React Native style arrays for web compatibility
function flattenStyle(
  style: React.CSSProperties | React.CSSProperties[] | undefined
): React.CSSProperties | undefined {
  if (!style) return undefined;
  if (Array.isArray(style)) {
    return style.reduce<React.CSSProperties>((acc, s) => ({ ...acc, ...s }), {});
  }
  return style;
}

const Box = React.forwardRef<HTMLDivElement, IBoxProps>(function Box(
  { className, style, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={boxStyle({ class: className })}
      style={flattenStyle(style)}
      {...props}
    />
  );
});

Box.displayName = "Box";
export { Box };
