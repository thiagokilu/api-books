import { z } from "zod";

export const editUserProfileSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  bio: z.string().optional(),
});

export const editUserProfileSuccessResponseSchema = z.object({
  message: z.string(),
});

export const editUserProfileErrorResponseSchema = z.object({
  error: z.string(),
});

export type EditUserProfileBodySchema = z.infer<typeof editUserProfileSchema>;
