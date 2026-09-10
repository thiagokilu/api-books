import { z } from "zod";

export const refreshTokenSuccessResponseSchema = z.object({
  accessToken: z.string(),
});

export const refreshTokenErrorResponseSchema = z.object({
  message: z.string(),
});
