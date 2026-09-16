import { z } from "zod";

export const editBookReadingPageSchema = z.object({
  userId: z.uuid(),
  cover_i: z.number(),
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
