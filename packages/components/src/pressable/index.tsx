"use client";
import { createPressable } from "@gluestack-ui/core/pressable/creator";
import { tva } from "@gluestack-ui/utils/nativewind-utils";
import { withStyleContext } from "@gluestack-ui/utils/nativewind-utils";
import type { VariantProps } from "@gluestack-ui/utils/nativewind-utils";
import React from "react";
import {
  Pressable as RNPressable,
  Platform,
  type AccessibilityRole,
  type AccessibilityState,
} from "react-native";

const UIPressable = createPressable({
  Root: withStyleContext(RNPressable),
});

const pressableStyle = tva({
  base: "data-[focus-visible=true]:outline-none data-[focus-visible=true]:ring-indicator-info data-[focus-visible=true]:ring-2 data-[disabled=true]:opacity-40",
});

type IPressableProps = Omit<React.ComponentProps<typeof UIPressable>, "context"> &
  VariantProps<typeof pressableStyle> & {
    accessibilityLabel?: string;
    accessibilityHint?: string;
    accessibilityRole?: AccessibilityRole;
    accessibilityState?: AccessibilityState;
  };

const Pressable = React.forwardRef<React.ComponentRef<typeof UIPressable>, IPressableProps>(
  function Pressable(
    {
      className,
      accessibilityLabel,
      accessibilityHint,
      accessibilityRole = "button",
      accessibilityState,
      disabled,
      onPress,
      ...props
    },
    ref
  ) {
    // Handle keyboard events for web accessibility
    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent) => {
        if (Platform.OS === "web" && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          if (!disabled && onPress) {
            onPress(e as unknown as Parameters<NonNullable<typeof onPress>>[0]);
          }
        }
      },
      [disabled, onPress]
    );

    return (
      <UIPressable
        {...props}
        ref={ref}
        disabled={disabled}
        onPress={onPress}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole={accessibilityRole}
        accessibilityState={{
          disabled: disabled ?? false,
          ...accessibilityState,
        }}
        {...(Platform.OS === "web" && { onKeyDown: handleKeyDown })}
        className={pressableStyle({
          class: className,
        })}
      />
    );
  }
);

Pressable.displayName = "Pressable";
export { Pressable };
