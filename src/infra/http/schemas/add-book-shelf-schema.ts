import { z } from "zod";

const addBookShelfByIdSchema = z.object({
  id: z.string().min(1, "Book ID is required"),
  title: z.string().min(1, "Title is required"),
  authors: z.array(z.string()).min(1, "At least one author name is required"),
  coverUrl: z.string().url().optional(),
  pageCount: z.number().int().positive().optional(),
});

export const addBookShelfSchema = addBookShelfByIdSchema;

export const addBookShelfSuccessResponseSchema = z.object({
  message: z.string(),
});

export const addBookShelfErrorResponseSchema = z.object({
  error: z.string(),
});

export type AddBookShelfBodySchema = z.infer<typeof addBookShelfSchema>;
