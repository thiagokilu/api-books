// db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { relations } from "./infra/db/relations";
import { env } from "./infra/lib/env.js";

export const db = drizzle(env.DATABASE_URL, { relations });
