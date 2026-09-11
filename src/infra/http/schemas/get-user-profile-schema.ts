import { z } from "zod";

export const getUserProfileSuccessResponseSchema = z.object({
  message: z.string(),
  user: z.object({
    email: z.string(),
    username: z.string(),
  }),
});

export const getUserProfileErrorResponseSchema = z.object({
  error: z.string(),
});

export type ProfileSuccessResponse = z.infer<typeof getUserProfileSuccessResponseSchema>
export type ProfileErrorResponse = z.infer<typeof getUserProfileErrorResponseSchema>
