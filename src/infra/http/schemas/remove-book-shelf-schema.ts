import { z } from "zod";

export const removeBookShelfSchema = z.object({
  id: z.string().min(1, "Book ID is required"),
});

export const removeBookShelfSuccessResponseSchema = z.object({
  message: z.string(),
});

export const removeBookShelfErrorResponseSchema = z.object({
  error: z.string(),
});

export type RemoveBookShelfBodySchema = z.infer<typeof removeBookShelfSchema>;
