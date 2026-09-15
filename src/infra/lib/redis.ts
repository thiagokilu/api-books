import { createClient } from "redis";
import "dotenv/config";

const REDIS_URL = String(process.env.REDIS_URL);
export const redis = createClient({
  url: REDIS_URL,
});

if (!REDIS_URL) {
  throw new Error("REDIS_URL is not defined in the environment variables.");
}

//evita quebra a aplicação
if (!redis) {
  console.warn(
    "Redis client is not initialized. Redis operations will be skipped.",
  );
}

redis.on("error", (err) => {
  console.error("Redis error:", err);
});

await redis.connect();
