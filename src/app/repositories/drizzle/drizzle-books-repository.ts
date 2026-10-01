import { and, eq } from "drizzle-orm/sql/expressions/index";
import { db } from "../../../index";
import { booksTable, userLibraryTable } from "../../../infra/db/schema";
import type { addBookToShelf, BooksRepository } from "../books-repository";

export class DrizzleBooksRepository implements BooksRepository {
  async addBookToShelf(data: addBookToShelf): Promise<void> {
    const externalId = data.id;

    await db
      .insert(booksTable)
      .values({
        externalId,
        title: data.title,
        author: data.authors.join(", "),
        totalPages: data.totalPages,
        coverUrl: data.coverUrl,
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

  async removeBookFromShelf(data: {
    userId: string;
    id: string;
  }): Promise<void> {
    const externalId = data.id;

    const book = await db.query.booksTable.findFirst({
      where: { externalId },
      columns: { id: true },
    });

    if (!book) {
      throw new Error("Book not found");
    }

    await db
      .delete(userLibraryTable)
      .where(
        and(
          eq(userLibraryTable.userId, data.userId),
          eq(userLibraryTable.bookId, book.id),
        ),
      );
  }

  async showBooksFromShelf(data: {
    userId: string;
  }): Promise<addBookToShelf[]> {
    const userBooks = await db.query.userLibraryTable.findMany({
      where: { userId: data.userId },
      with: {
        book: true,
      },
    });

    if (!userBooks) {
      return [];
    }

    return userBooks
      .filter((userBook) => userBook.book)
      .map((userBook) => ({
        userId: data.userId,
        id: userBook.book!.externalId,
        title: userBook.book!.title,
        authors: userBook.book!.author ? userBook.book!.author.split(", ") : [],
        ...(userBook.book!.coverUrl
          ? { coverUrl: userBook.book!.coverUrl }
          : {}),
        status: userBook.status as "WANT_TO_READ" | "READING" | "COMPLETED",
        currentPage: userBook.currentPage,
        totalPages: userBook.book!.totalPages,
      }));
  }

  async editReadingStatus(data: {
    userId: string;
    id: string;
    readingStatus: string;
  }): Promise<void> {
    const externalId = data.id;

    const book = await db.query.booksTable.findFirst({
      where: { externalId },
      columns: { id: true },
    });

    if (!book) {
      throw new Error("Book not found");
    }

    await db
      .update(userLibraryTable)
      .set({ status: data.readingStatus })
      .where(
        and(
          eq(userLibraryTable.userId, data.userId),
          eq(userLibraryTable.bookId, book.id),
        ),
      );
  }

  async editBookCurrentPage(data: {
    userId: string;
    id: string;
    currentPage: number;
  }): Promise<void> {
    const externalId = data.id;

    const book = await db.query.booksTable.findFirst({
      where: { externalId },
      columns: { id: true },
    });

    if (!book) {
      throw new Error("Book not found");
    }

    await db
      .update(userLibraryTable)
      .set({ currentPage: data.currentPage })
      .where(
        and(
          eq(userLibraryTable.userId, data.userId),
          eq(userLibraryTable.bookId, book.id),
        ),
      );
  }
}
