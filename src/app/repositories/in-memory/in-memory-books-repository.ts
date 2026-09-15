import type { addBookToShelf, BooksRepository } from "../books-repository";

export class InMemoryBooksRepository implements BooksRepository {
  addBookToShelf(data: addBookToShelf): Promise<void> {
    const { userId, cover_i } = data;
    const userBooks = this.store.get(userId) ?? new Set<number>();
    userBooks.add(cover_i);
    this.store.set(userId, userBooks);
    return Promise.resolve();
  }
  removeBookFromShelf(data: {
    userId: string;
    cover_i: number;
  }): Promise<void> {
    const { userId, cover_i } = data;
    const userBooks = this.store.get(userId);
    if (userBooks) {
      userBooks.delete(cover_i);
      if (userBooks.size === 0) {
        this.store.delete(userId);
      } else {
        this.store.set(userId, userBooks);
      }
    }
    return Promise.resolve();
  }
  private store = new Map<string, Set<number>>();
}
