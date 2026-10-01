export interface addBookToShelf {
  userId: string;
  id: string;
  title: string;
  authors: string[];
  coverUrl?: string;
  status?: "WANT_TO_READ" | "READING" | "COMPLETED";
  currentPage?: number;
  totalPages?: number | null;
}

export interface BooksRepository {
  addBookToShelf(data: addBookToShelf): Promise<void>;
  removeBookFromShelf(data: { userId: string; id: string }): Promise<void>;
  showBooksFromShelf(data: { userId: string }): Promise<addBookToShelf[]>;
  editReadingStatus(data: {
    userId: string;
    id: string;
    readingStatus: "WANT_TO_READ" | "READING" | "COMPLETED";
  }): Promise<void>;
  editBookCurrentPage(data: {
    userId: string;
    id: string;
    currentPage: number;
  }): Promise<void>;
}
