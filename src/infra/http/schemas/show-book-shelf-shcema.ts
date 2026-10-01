import { z } from "zod";

export const showBookShelfSuccessResponseSchema = z.object({
  books: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      authors: z.array(z.string()),
      coverUrl: z.string().url().optional(),
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
