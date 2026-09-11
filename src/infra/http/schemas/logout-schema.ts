import { z } from "zod";

export const logoutSuccessResponseSchema = z.object({
  message: z.string(),
});

export const logoutErrorResponseSchema = z.object({
  message: z.string(),
});
