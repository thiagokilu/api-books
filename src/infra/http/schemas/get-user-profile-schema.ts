import { z } from "zod";

export const getUserProfileSchema = z.object({
  id: z.string(),
});

export type GetUserProfileSchema = z.infer<typeof getUserProfileSchema>;
