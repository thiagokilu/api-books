import { searchBooksUseCase } from "../search-books-usecase";
import { makeOpenLibraryClient } from "../../../infra/http/clients/SearchBooksQuery";

export function makeSearchBooksUseCase() {
  const openLibraryClient = makeOpenLibraryClient();

  return searchBooksUseCase(openLibraryClient);
}
