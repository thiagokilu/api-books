import { db } from "../../../index";
import { booksTable, userLibraryTable } from "../../../infra/db/schema";
import type { addBookToShelf, BooksRepository } from "../books-repository";

export class DrizzleBooksRepository implements BooksRepository {
  async addBookToShelf(data: addBookToShelf): Promise<void> {
    const externalId = String(data.cover_i);

    await db
      .insert(booksTable)
      .values({
        externalId,
        title: data.title,
        author: data.author_name.join(", "),
        coverUrl: `https://covers.openlibrary.org/b/id/${data.cover_i}-M.jpg`,
      })
      .onConflictDoNothing({ target: booksTable.externalId });

    const book = await db.query.booksTable.findFirst({
      where: { externalId },
      columns: { id: true },
    });

    if (!book) {
      throw new Error("Failed to add book");
    }

    await db
      .insert(userLibraryTable)
      .values({
        userId: data.userId,
        bookId: book.id,
        status: "WANT_TO_READ",
      })
      .onConflictDoNothing({
        target: [userLibraryTable.userId, userLibraryTable.bookId],
      });
  }
}
