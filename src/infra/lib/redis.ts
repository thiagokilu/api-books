import { createClient } from "redis";
import { env } from "./env.js";

const REDIS_URL = env.REDIS_URL;

if (!REDIS_URL) {
  throw new Error("REDIS_URL is not defined in the environment variables.");
}

export const redis = createClient({
  url: REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      // limita tentativas de reconexão pra não ficar em loop infinito
      if (retries > 5) {
        console.error(
          "Redis: máximo de tentativas de reconexão atingido, desistindo.",
        );
        return new Error("Redis indisponível");
      }
      return Math.min(retries * 100, 3000); // backoff simples
    },
  },
});

redis.on("error", (err) => {
  console.error("Redis error:", err.message);
});

try {
  await redis.connect();
  console.log("Redis conectado com sucesso.");
} catch (err) {
  console.error(
    "Não foi possível conectar ao Redis, seguindo sem cache:",
    (err as Error).message,
  );
}
