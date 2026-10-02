import { z } from "zod";

export const editBookReadingStatusBodySchema = z.object({
  id: z.string().min(1, "Book ID is required"),
  readingStatus: z.enum(["WANT_TO_READ", "READING", "COMPLETED"]),
  currentPage: z.number().int().nonnegative(),
});

export const editBookReadingStatusSuccessResponseSchema = z.object({
  message: z.string(),
});

export const editBookReadingStatusErrorResponseSchema = z.object({
  error: z.string(),
});

export type EditBookReadingStatusBodySchema = z.infer<
  typeof editBookReadingStatusBodySchema
>;
