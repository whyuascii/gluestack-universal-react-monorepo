import { z } from "zod";

export const GetUserResponse = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().nullable(),
  tenantId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type TGetUserResponse = z.infer<typeof GetUserResponse>;
