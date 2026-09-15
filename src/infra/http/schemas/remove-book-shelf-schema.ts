import { z } from "zod";

export const removeBookShelfSchema = z.object({
  cover_i: z
    .number()
    .int()
    .nonnegative("Cover ID must be a non-negative integer"),
});

export const removeBookShelfSuccessResponseSchema = z.object({
  message: z.string(),
});

export const removeBookShelfErrorResponseSchema = z.object({
  error: z.string(),
});

export type RemoveBookShelfBodySchema = z.infer<typeof removeBookShelfSchema>;
