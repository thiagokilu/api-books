import Redis from "ioredis";
import { env } from "./env.js";

const REDIS_URL = env.REDIS_URL;

if (!REDIS_URL) {
  throw new Error("REDIS_URL is not defined in the environment variables.");
}

export const rateLimitRedis = new Redis(REDIS_URL, {
  connectTimeout: 10_000,
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
});
