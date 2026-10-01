import { z } from "zod";

export const showBookShelfSuccessResponseSchema = z.object({
  books: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      subtitle: z.string().optional(),
      authors: z.array(z.string()),
      coverUrl: z.string().url().optional(),
      description: z.string().optional(),
      publisher: z.string().optional(),
      language: z.string().optional(),
      publishedDate: z.string().optional(),
      publishedYear: z.number().int().optional(),
      categories: z.array(z.string()).optional(),
      isbn: z.string().optional(),
      infoLink: z.string().url().optional(),
      pageCount: z.number().int().nonnegative().optional(),
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
