import { z } from "zod";

export const findBookByIdSchema = z.object({
  id: z.string().min(1),
});

export const findBookByIdSuccessResponseSchema = z.object({
  message: z.string(),
  book: z.object({
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
});

export const findBookByIdErrorResponseSchema = z.object({
  message: z.string(),
});

export type FindBookByIdQuerySchema = z.infer<typeof findBookByIdSchema>;
