import { z } from "zod";

export const successRefreshTokenResponseSchema = z.object({
  token: z.string(),
  refreshToken: z.string(),
});

export const errorRefreshTokenResponseSchema = z.object({
  message: z.string(),
});
