import { z } from "zod";

export const requestVerificationEmailSchema = z.object({
  email: z.string().email(),
});

export const requestVerificationEmailSuccessResponseSchema = z.object({
  message: z.string(),
});

export const requestVerificationEmailErrorResponseSchema = z.object({
  message: z.string(),
});

export type RequestVerificationEmailSchema = z.infer<
  typeof requestVerificationEmailSchema
>;
