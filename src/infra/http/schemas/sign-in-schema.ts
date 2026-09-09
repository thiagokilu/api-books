import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const signInSuccessResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string().email(),

  }),
  token: z.string()
})

export const signInErrorResponseSchema = z.object({
  message: z.string(),
});


export type SignInBodySchema = z.infer<typeof signInSchema>;
