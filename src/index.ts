import "dotenv/config";
// db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { relations } from "./infra/db/relations";

export const db = drizzle(process.env.DATABASE_URL!, { relations });
