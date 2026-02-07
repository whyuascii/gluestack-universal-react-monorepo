/**
 * Forms Module
 *
 * TanStack Form integration with Zod validation.
 * Use schemas from @app/core-contract for validation.
 *
 * @example
 * ```typescript
 * import { loginSchema } from "@app/core-contract";
 * import { useAppForm, AppFormField } from "@app/ui/forms";
 *
 * function LoginForm() {
 *   const form = useAppForm({
 *     schema: loginSchema,
 *     defaultValues: { email: "", password: "" },
 *     onSubmit: async (data) => {
 *       await authClient.signIn.email(data);
 *     },
 *   });
 *
 *   return (
 *     <VStack>
 *       <form.Field name="email">
 *         {(field) => (
 *           <AppFormField field={field} label="Email" keyboardType="email-address" />
 *         )}
 *       </form.Field>
 *       <form.Field name="password">
 *         {(field) => (
 *           <AppFormField field={field} label="Password" secureTextEntry />
 *         )}
 *       </form.Field>
 *       <form.Subscribe selector={(state) => state.isSubmitting}>
 *         {(isSubmitting) => (
 *           <PrimaryButton onPress={form.handleSubmit} isLoading={isSubmitting}>
 *             Sign In
 *           </PrimaryButton>
 *         )}
 *       </form.Subscribe>
 *     </VStack>
 *   );
 * }
 * ```
 */

export { useAppForm } from "./useAppForm";
export { AppFormField } from "./AppFormField";
export type { UseAppFormOptions, AppFormFieldProps } from "./types";
