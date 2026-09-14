import { z } from "zod";

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

export const verifyEmailSuccessResponseSchema = z.object({
  message: z.string(),
});

export const verifyEmailErrorResponseSchema = z.object({
  message: z.string(),
});

export type VerifyEmailSchema = z.infer<typeof verifyEmailSchema>;
