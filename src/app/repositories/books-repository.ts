export interface addBookToShelf {
  userId: string;
  title: string;
  author_name: string[];
  cover_i: number;
}

export interface BooksRepository {
  addBookToShelf(data: addBookToShelf): Promise<void>;
  removeBookFromShelf(data: { userId: string; cover_i: number }): Promise<void>;
}
