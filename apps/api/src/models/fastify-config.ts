import * as z from "zod";

export const routeOptions = z.object({
  rootPath: z.string(),
  versionPrefix: z.string(),
});

export type RouteOptions = z.infer<typeof routeOptions>;
