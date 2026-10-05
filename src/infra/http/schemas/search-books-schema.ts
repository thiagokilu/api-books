import { z } from "zod";

export const searchBooksSchema = z.object({
  query: z.string().min(1),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(40).default(20),
});

export const searchBooksSuccessResponseSchema = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
  books: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      subtitle: z.string().optional(),
      authors: z.array(z.string()),
      publisher: z.string().optional(),
      publishedDate: z.string().optional(),
      publishedYear: z.number().optional(),
      description: z.string().optional(),
      pageCount: z.number().optional(),
      categories: z.array(z.string()),
      language: z.string().optional(),
      coverUrl: z.string().optional(),
      isbn: z.string().optional(),
      infoLink: z.string().optional(),
    }),
  ),
});

export const searchBooksErrorResponseSchema = z.object({
  message: z.string(),
});

export type SearchBooksQuerySchema = z.infer<typeof searchBooksSchema>;
