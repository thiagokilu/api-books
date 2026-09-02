// relations.ts
import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  usersTable: {
    library: r.many.userLibraryTable(),
    tokens: r.many.tokensTable(),
  },
  booksTable: {
    library: r.many.userLibraryTable(),
  },
  userLibraryTable: {
    user: r.one.usersTable({
      from: r.userLibraryTable.userId,
      to: r.usersTable.id,
    }),
    book: r.one.booksTable({
      from: r.userLibraryTable.bookId,
      to: r.booksTable.id,
    }),
  },
  tokensTable: {
    user: r.one.usersTable({
      from: r.tokensTable.userId,
      to: r.usersTable.id,
    }),
  },
}));
