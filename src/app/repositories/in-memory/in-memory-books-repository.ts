import type { addBookToShelf, BooksRepository } from "../books-repository";

export class InMemoryBooksRepository implements BooksRepository {
  addBookToShelf(data: addBookToShelf): Promise<void> {
    const userBooks = this.store.get(data.userId) ?? [];
    if (!userBooks.some((book) => book.id === data.id)) {
      userBooks.push({
        ...data,
        status: data.status ?? "WANT_TO_READ",
        currentPage: data.currentPage ?? 0,
        totalPages: data.totalPages ?? 0,
      });
    }
    this.store.set(data.userId, userBooks);
    return Promise.resolve();
  }
  removeBookFromShelf(data: { userId: string; id: string }): Promise<void> {
    const { userId, id } = data;
    const userBooks = this.store.get(userId);
    if (userBooks) {
      const remainingBooks = userBooks.filter((book) => book.id !== id);
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
    id: string;
    readingStatus: "WANT_TO_READ" | "READING" | "COMPLETED";
    currentPage: number;
  }): Promise<void> {
    const { userId, id, readingStatus, currentPage } = data;
    const userBooks = this.store.get(userId);

    if (userBooks) {
      const bookIndex = userBooks.findIndex((book) => book.id === id);
      if (bookIndex !== -1) {
        const book = userBooks[bookIndex];
        if (book) {
          book.status = readingStatus;
          book.currentPage = currentPage;
          this.store.set(userId, userBooks);
        }
      }
    }
    return Promise.resolve();
  }

  async editBookCurrentPage(data: {
    userId: string;
    id: string;
    currentPage: number;
  }): Promise<void> {
    const { userId, id, currentPage } = data;
    const userBooks = this.store.get(userId);

    if (userBooks) {
      const bookIndex = userBooks.findIndex((book) => book.id === id);
      if (bookIndex !== -1) {
        const book = userBooks[bookIndex];
        if (book) {
          book.currentPage = currentPage;
          this.store.set(userId, userBooks);
        }
      }
    }
    return Promise.resolve();
  }

  private store = new Map<string, addBookToShelf[]>();
}
