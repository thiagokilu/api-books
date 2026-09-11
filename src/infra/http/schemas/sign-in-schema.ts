import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const signInSuccessResponseSchema = z.object({
  message: z.string(),
  accessToken: z.string(),
});

export const signInErrorResponseSchema = z.object({
  error: z.string(),
});


export type SignInBodySchema = z.infer<typeof signInSchema>;
