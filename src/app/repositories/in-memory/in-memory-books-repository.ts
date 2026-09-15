import type { addBookToShelf, BooksRepository } from "../books-repository";

export class InMemoryBooksRepository implements BooksRepository {
  addBookToShelf(data: addBookToShelf): Promise<void> {
    const userBooks = this.store.get(data.userId) ?? [];
    if (!userBooks.some((book) => book.cover_i === data.cover_i)) {
      userBooks.push({ ...data, status: data.status ?? "WANT_TO_READ" });
    }
    this.store.set(data.userId, userBooks);
    return Promise.resolve();
  }
  removeBookFromShelf(data: {
    userId: string;
    cover_i: number;
  }): Promise<void> {
    const { userId, cover_i } = data;
    const userBooks = this.store.get(userId);
    if (userBooks) {
      const remainingBooks = userBooks.filter(
        (book) => book.cover_i !== cover_i,
      );
      if (remainingBooks.length === 0) {
        this.store.delete(userId);
      } else {
        this.store.set(userId, remainingBooks);
      }
    }
    return Promise.resolve();
  }

  showBooksFromShelf(data: { userId: string }): Promise<addBookToShelf[]> {
    return Promise.resolve(this.store.get(data.userId) ?? []);
  }

  async editReadingStatus(data: {
    userId: string;
    cover_i: number;
    readingStatus: "WANT_TO_READ" | "READING" | "COMPLETED";
  }): Promise<void> {
    const { userId, cover_i, readingStatus } = data;
    const userBooks = this.store.get(userId);

    if (userBooks) {
      const bookIndex = userBooks.findIndex((book) => book.cover_i === cover_i);
      if (bookIndex !== -1) {
        const book = userBooks[bookIndex];
        if (book) {
          book.status = readingStatus;
          this.store.set(userId, userBooks);
        }
      }
    }
    return Promise.resolve();
  }

  private store = new Map<string, addBookToShelf[]>();
}
