import { z } from "zod";

export const showPublicBookShelfParamsSchema = z.object({
  username: z.string().min(1),
});

export const showPublicBookShelfSuccessResponseSchema = z.object({
  user: z.object({
    name: z.string(),
    username: z.string(),
    bio: z.string().nullable(),
  }),
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

export const showPublicBookShelfNotFoundResponseSchema = z.object({
  error: z.string(),
});
