import { z } from "zod";

export const getUserProfileSuccessResponseSchema = z.object({
  message: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    username: z.string(),
    bio: z.string().nullable(),
    profileImageUrl: z.string().url().nullable(),
    emailVerified: z.boolean(),
  }),
});

export const getUserProfileErrorResponseSchema = z.object({
  error: z.string(),
});

export type ProfileSuccessResponse = z.infer<
  typeof getUserProfileSuccessResponseSchema
>;
export type ProfileErrorResponse = z.infer<
  typeof getUserProfileErrorResponseSchema
>;
