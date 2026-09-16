export interface addBookToShelf {
  userId: string;
  title: string;
  author_name: string[];
  cover_i: number;
  status?: "WANT_TO_READ" | "READING" | "COMPLETED";
}

export interface BooksRepository {
  addBookToShelf(data: addBookToShelf): Promise<void>;
  removeBookFromShelf(data: { userId: string; cover_i: number }): Promise<void>;
  showBooksFromShelf(data: { userId: string }): Promise<addBookToShelf[]>;
  editReadingStatus(data: {
    userId: string;
    cover_i: number;
    readingStatus: "WANT_TO_READ" | "READING" | "COMPLETED";
  }): Promise<void>;
}
