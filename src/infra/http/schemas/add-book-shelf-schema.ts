import { z } from "zod";

export const addBookShelfSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author_name: z
    .array(z.string())
    .min(1, "At least one author name is required"),
  cover_i: z
    .number()
    .int()
    .nonnegative("Cover ID must be a non-negative integer"),
});

export const addBookShelfSuccessResponseSchema = z.object({
  message: z.string(),
});

export const addBookShelfErrorResponseSchema = z.object({
  error: z.string(),
});

export type AddBookShelfBodySchema = z.infer<typeof addBookShelfSchema>;
