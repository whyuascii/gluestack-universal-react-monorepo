import { z } from "zod";

export const GenericSuccessResponse = z.object({
  message: z.string(),
});
export type TGenericSuccessResponse = z.infer<typeof GenericSuccessResponse>;

export const GenericIdParams = z.object({
  id: z.string(),
});

export const GenericNullResponse = z.null();
