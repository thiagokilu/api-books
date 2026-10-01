import { z } from "zod";

export const editBookReadingPageSchema = z.object({
  id: z.string().min(1, "Book ID is required"),
  currentPage: z.number().int().nonnegative(),
});

export const editBookReadingPageSuccessResponseSchema = z.object({
  message: z.string(),
});

export const editBookReadingPageErrorResponseSchema = z.object({
  error: z.string(),
});

export type EditBookReadingPageSchema = z.infer<
  typeof editBookReadingPageSchema
>;
