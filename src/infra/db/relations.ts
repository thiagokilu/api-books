// relations.ts
import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  usersTable: {
    library: r.many.userLibraryTable(),
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
}));
