import { createClient } from "redis";
import "dotenv/config";

const REDIS_URL = String(process.env.REDIS_URL)
export const redis = createClient({
  url: REDIS_URL,
});

redis.on("error", (err) => {
  console.error("Redis error:", err);
});

await redis.connect();