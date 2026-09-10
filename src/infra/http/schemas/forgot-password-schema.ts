import { z } from "zod";

export const forgotPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters long"),
});

export const forgotPasswordSuccessResponseSchema = z.object({
  message: z.string(),
});

export const forgotPasswordErrorResponseSchema = z.object({
  message: z.string(),
});

export type ForgotPasswordBodySchema = z.infer<typeof forgotPasswordSchema>;
