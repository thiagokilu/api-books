import { searchBooksUseCase } from "../search-books-usecase";
import { makeGoogleBooksClient } from "../../../infra/http/clients/SearchBooksQuery";

export function makeSearchBooksUseCase() {
  const googleBooksClient = makeGoogleBooksClient();

  return searchBooksUseCase(googleBooksClient);
}
