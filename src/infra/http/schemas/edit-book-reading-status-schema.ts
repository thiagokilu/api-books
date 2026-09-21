import { z } from "zod";

export const editBookReadingStatusBodySchema = z.object({
  cover_i: z
    .number()
    .int()
    .nonnegative("Cover ID must be a non-negative integer"),
  readingStatus: z.enum(["WANT_TO_READ", "READING", "COMPLETED"]),
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
