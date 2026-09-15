import { z } from "zod";

export const showBookShelfSchema = z.object({
  userId: z.uuid("Invalid user ID format"),
});

export const showBookShelfSuccessResponseSchema = z.object({
  books: z.array(
    z.object({
      title: z.string(),
      author_name: z.array(z.string()),
      cover_i: z.number().int().nonnegative(),
    }),
  ),
});

export const showBookShelfErrorResponseSchema = z.object({
  error: z.string(),
});

export type ShowBookShelfParamsSchema = z.infer<typeof showBookShelfSchema>;
