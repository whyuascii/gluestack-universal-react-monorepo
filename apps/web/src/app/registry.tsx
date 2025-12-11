"use client";

import { flush } from "@gluestack-ui/utils/nativewind-utils";
import { useServerInsertedHTML } from "next/navigation";
import React, { useRef, useState } from "react";
import { AppRegistry } from "react-native-web";
import { StyleRegistry, createStyleRegistry } from "styled-jsx";

export default function StyledJsxRegistry({ children }: { children: React.ReactNode }) {
  // Only create stylesheet once with lazy initial state
  // x-ref: https://reactjs.org/docs/hooks-reference.html#lazy-initial-state
  const [jsxStyleRegistry] = useState(() => createStyleRegistry());

  const isServerInserted = useRef(false);

  useServerInsertedHTML(() => {
    // @ts-expect-error - AppRegistry is a runtime value but types are incomplete
    AppRegistry.registerComponent("Main", () => "main");
    // @ts-expect-error - AppRegistry is a runtime value but types are incomplete
    const { getStyleElement } = AppRegistry.getApplication("Main");
    if (!isServerInserted.current) {
      isServerInserted.current = true;
      const styles = [getStyleElement(), jsxStyleRegistry.styles(), flush()].filter(Boolean); // Remove any null/undefined styles

      jsxStyleRegistry.flush();

      // Add unique keys to each style element
      return (
        <>
          {styles.map((style, index) => (
            <React.Fragment key={`style-${index}`}>{style}</React.Fragment>
          ))}
        </>
      );
    }
  });

  return <StyleRegistry registry={jsxStyleRegistry}>{children}</StyleRegistry>;
}
