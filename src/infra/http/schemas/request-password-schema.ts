import { z } from "zod";

export const requestPasswordSchema = z.object({
  email: z.email(),
});

export const requestPasswordSuccessResponseSchema = z.object({
  message: z.string(),
});

export const requestPasswordErrorResponseSchema = z.object({
  message: z.string(),
});

export type RequestPasswordBodySchema = z.infer<typeof requestPasswordSchema>;
