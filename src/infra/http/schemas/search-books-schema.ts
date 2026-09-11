import { z } from "zod";

export const searchBooksSchema = z.object({
  query: z.string().min(1),
});

export const searchBooksSuccessResponseSchema = z.object({
  docs: z.array(
    z.object({
      title: z.string(),
      author_name: z.array(z.string()).optional(),
      publish_year: z.array(z.number()).optional(),
    }),
  ),
});

export const searchBooksErrorResponseSchema = z.object({
  message: z.string(),
});

export type SearchBooksQuerySchema = z.infer<typeof searchBooksSchema>;
