import { findBookByIdUseCase } from "../find-book-by-id-usecase";
import { FindBookById } from "../../../infra/http/clients/FindBookById";

export function makeFindBookByIdUseCase() {
  const googleBooksClient = FindBookById();

  return findBookByIdUseCase(googleBooksClient);
}
