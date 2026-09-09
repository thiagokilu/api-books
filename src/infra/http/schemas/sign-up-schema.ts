import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  bio: z.string().optional(),
});

export const signUpSuccessResponseSchema = z.object({}).strict();

export const signUpErrorResponseSchema = z.object({
  message: z.string(),
});

export type SignUpBodySchema = z.infer<typeof signUpSchema>;
