import { z } from "zod";

export const GetHealthResponse = z.object({
    healthy: z.boolean(),
    gitHash: z.string(),
    gitHashShort: z.string(),
    gitBranch: z.string(),
    environment: z.string(),
});
