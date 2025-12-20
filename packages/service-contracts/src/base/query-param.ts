import { sortStringSchema } from "@app/utils";
import { z } from "zod";

export const BaseQueryParams = z.object({
  limit: z
    .preprocess(
      (val: unknown) => Number.parseInt(val as string, 10),
      z.number().min(5).max(200, { message: "Limit must be between 5 and 200" })
    )
    .optional()
    .default(20),
  skip: z
    .preprocess((val: unknown) => Number.parseInt(val as string, 10), z.number().min(0))
    .optional()
    .default(0),
  sort: sortStringSchema.optional(),
});

export type TBaseQueryParams = z.infer<typeof BaseQueryParams>;
