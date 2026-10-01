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
        subtitle: data.subtitle,
        author: data.authors.join(", "),
        totalPages: data.totalPages,
        coverUrl: data.coverUrl,
        description: data.description,
        publisher: data.publisher,
        language: data.language,
        publishedDate: data.publishedDate,
        publishedYear: data.publishedYear,
        categories: data.categories,
        isbn: data.isbn,
        infoLink: data.infoLink,
      })
      .onConflictDoUpdate({
        target: booksTable.externalId,
        set: {
          title: data.title,
          subtitle: data.subtitle,
          author: data.authors.join(", "),
          coverUrl: data.coverUrl,
          description: data.description,
          publisher: data.publisher,
          language: data.language,
          publishedDate: data.publishedDate,
          publishedYear: data.publishedYear,
          categories: data.categories,
          isbn: data.isbn,
          infoLink: data.infoLink,
          totalPages: data.totalPages,
        },
      });

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
        ...(userBook.book!.subtitle
          ? { subtitle: userBook.book!.subtitle }
          : {}),
        authors: userBook.book!.author ? userBook.book!.author.split(", ") : [],
        ...(userBook.book!.coverUrl
          ? { coverUrl: userBook.book!.coverUrl }
          : {}),
        ...(userBook.book!.description
          ? { description: userBook.book!.description }
          : {}),
        ...(userBook.book!.publisher
          ? { publisher: userBook.book!.publisher }
          : {}),
        ...(userBook.book!.language
          ? { language: userBook.book!.language }
          : {}),
        ...(userBook.book!.publishedDate
          ? { publishedDate: userBook.book!.publishedDate }
          : {}),
        ...(userBook.book!.publishedYear !== null
          ? { publishedYear: userBook.book!.publishedYear }
          : {}),
        ...(userBook.book!.categories
          ? { categories: userBook.book!.categories }
          : {}),
        ...(userBook.book!.isbn ? { isbn: userBook.book!.isbn } : {}),
        ...(userBook.book!.infoLink
          ? { infoLink: userBook.book!.infoLink }
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
