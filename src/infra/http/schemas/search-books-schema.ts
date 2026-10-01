import { z } from "zod";

export const searchBooksSchema = z.object({
  query: z.string().min(1),
});

export const searchBooksSuccessResponseSchema = z.object({
  docs: z.array(
    z.object({
      title: z.string(),
      author_name: z.array(z.string()).optional(),
      author_key: z.array(z.string()).optional(),
      publish_year: z.array(z.number()).optional(),
      cover_i: z.number().optional(),
      cover_edition_key: z.string().optional(),
      cover_height: z.number().optional(),
      cover_width: z.number().optional(),
      ebook_access: z.string().optional(),
      edition_count: z.number().optional(),
      first_publish_year: z.number().optional(),
      has_fulltext: z.boolean().optional(),
      key: z.string().optional(),
      language: z.array(z.string()).optional(),
      public_scan_b: z.boolean().optional(),
      series_name: z.array(z.string()).optional(),
      series_position: z.array(z.string()).optional(),
    }),
  ),
});

export const searchBooksErrorResponseSchema = z.object({
  message: z.string(),
});

export type SearchBooksQuerySchema = z.infer<typeof searchBooksSchema>;
