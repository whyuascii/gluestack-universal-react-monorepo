/**
 * useAppForm Hook
 *
 * TanStack Form wrapper with Zod validation integration.
 * Uses schemas from @app/core-contract for single source of truth.
 *
 * @example
 * ```typescript
 * import { loginSchema } from "@app/core-contract";
 *
 * const form = useAppForm({
 *   schema: loginSchema,
 *   defaultValues: { email: "", password: "" },
 *   onSubmit: async (data) => {
 *     await authClient.signIn.email(data);
 *   },
 * });
 * ```
 */

import { useForm } from "@tanstack/react-form";
import type { z } from "zod";
import type { UseAppFormOptions } from "./types";

export function useAppForm<TSchema extends z.ZodType>({
  schema,
  defaultValues,
  onSubmit,
  onValidateAsync,
}: UseAppFormOptions<TSchema>) {
  type FormData = z.infer<TSchema>;

  const form = useForm({
    defaultValues: defaultValues as FormData,
    validators: {
      onChange: ({ value }: { value: FormData }) => {
        const result = schema.safeParse(value);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          for (const issue of result.error.issues) {
            const path = issue.path.join(".");
            if (!fieldErrors[path]) {
              fieldErrors[path] = issue.message;
            }
          }
          return fieldErrors;
        }
        return undefined;
      },
      onSubmitAsync: onValidateAsync
        ? async ({ value }: { value: FormData }) => {
            const errors = await onValidateAsync(value);
            if (errors && Object.keys(errors).length > 0) {
              return errors;
            }
            return undefined;
          }
        : undefined,
    },
    onSubmit: async ({ value }: { value: FormData }) => {
      await onSubmit(value);
    },
  });

  return form;
}
