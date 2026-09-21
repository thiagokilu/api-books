// src/env.ts
import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  DATABASE_URL: z
    .string()
    .url({ message: "DATABASE_URL deve ser uma URL válida" }),

  REDIS_URL: z.string().url().optional(),

  RESEND_API_KEY: z.string().optional(),

  SALT_ROUNDS: z.coerce.number().int().positive().default(10),

  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET deve ter pelo menos 32 caracteres"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET deve ter pelo menos 32 caracteres"),

  APP_URL: z
    .string()
    .url({ message: "APP_URL deve ser uma URL válida (ex: https://app.com)" }),

  PORT: z.coerce.number().int().positive().default(3000),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Variáveis de ambiente inválidas ou faltando:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
