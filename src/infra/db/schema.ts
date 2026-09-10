// schema.ts
import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// USERS
export const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
  username: varchar({ length: 255 }).notNull().unique(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  bio: text(),
  emailVerified: boolean("email_verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// BOOKS
export const booksTable = pgTable("books", {
  id: uuid().primaryKey().defaultRandom(),
  externalId: varchar("external_id", { length: 255 }).notNull().unique(),
  title: varchar({ length: 500 }).notNull(),
  author: varchar({ length: 500 }),
  coverUrl: varchar("cover_url", { length: 1000 }),
  description: text(),
  totalPages: integer("total_pages"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// USER_LIBRARY (estante)
export const userLibraryTable = pgTable(
  "user_library",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    bookId: uuid("book_id")
      .notNull()
      .references(() => booksTable.id, { onDelete: "cascade" }),
    status: varchar({ length: 50 }).notNull(), // WANT_TO_READ | READING | COMPLETED
    currentPage: integer("current_page").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex("user_book_unique").on(table.userId, table.bookId)],
);

// TOKENS (confirmação de email / reset de senha)
export const tokensTable = pgTable("tokens", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  token: varchar({ length: 255 }).notNull().unique(),
  type: varchar({ length: 50 }).notNull(), // EMAIL_CONFIRMATION | PASSWORD_RESET
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const passwordResetTokensTable = pgTable("password_reset_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
