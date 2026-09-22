import { z } from "zod";

export const showBookShelfSuccessResponseSchema = z.object({
  books: z.array(
    z.object({
      title: z.string(),
      author_name: z.array(z.string()),
      cover_i: z.number().int().nonnegative(),
      status: z.enum(["WANT_TO_READ", "READING", "COMPLETED"]),
      currentPage: z.number().int().nonnegative().optional(),
      totalPages: z.number().int().nonnegative().optional(),
      readingPercentage: z.number().nonnegative(),
    }),
  ),
});

export const showBookShelfErrorResponseSchema = z.object({
  error: z.string(),
});
