import { useId, useMemo } from "react";

/**
 * Hook for generating accessible form field IDs.
 *
 * Returns stable IDs for linking form labels, inputs, and error messages.
 * Uses React 18's useId for SSR-safe ID generation.
 *
 * @param name - Optional field name for more descriptive IDs
 *
 * @example
 * ```tsx
 * function EmailField({ error }: { error?: string }) {
 *   const { fieldId, labelId, errorId, getFieldProps } = useFormFieldId("email");
 *
 *   return (
 *     <FormControl>
 *       <Label nativeID={labelId}>Email</Label>
 *       <Input
 *         {...getFieldProps(!!error)}
 *         placeholder="Enter email"
 *       />
 *       {error && (
 *         <ErrorText nativeID={errorId} role="alert">
 *           {error}
 *         </ErrorText>
 *       )}
 *     </FormControl>
 *   );
 * }
 * ```
 */
export function useFormFieldId(name?: string) {
  const baseId = useId();
  const prefix = name ? `field-${name}` : "field";

  return useMemo(() => {
    const fieldId = `${prefix}-${baseId}`;
    const labelId = `${fieldId}-label`;
    const errorId = `${fieldId}-error`;
    const hintId = `${fieldId}-hint`;

    return {
      /** ID for the input element */
      fieldId,
      /** ID for the label element */
      labelId,
      /** ID for the error message element */
      errorId,
      /** ID for the hint/description element */
      hintId,

      /**
       * Get props to spread on the input element for proper accessibility linking.
       *
       * @param hasError - Whether the field has a validation error
       * @param hasHint - Whether the field has a hint/description
       */
      getFieldProps: (hasError = false, hasHint = false) => {
        const describedBy = [hasError && errorId, hasHint && hintId].filter(Boolean).join(" ");

        return {
          nativeID: fieldId,
          "aria-invalid": hasError,
          "aria-describedby": describedBy || undefined,
        };
      },

      /**
       * Get props for the label element
       */
      getLabelProps: () => ({
        nativeID: labelId,
      }),

      /**
       * Get props for the error message element
       */
      getErrorProps: () => ({
        nativeID: errorId,
        role: "alert" as const,
        "aria-live": "assertive" as const,
      }),

      /**
       * Get props for the hint/description element
       */
      getHintProps: () => ({
        nativeID: hintId,
      }),
    };
  }, [baseId, prefix]);
}
