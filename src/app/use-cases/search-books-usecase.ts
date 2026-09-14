export interface ISearchBooksUseCaseRequest {
  query: string;
}

export interface ISearchBooksUseCaseResponse {
  docs: Array<{
    title: string;
    author_name?: string[];
    publish_year?: number[];
    cover_i?: number;
  }>;
}

export interface OpenLibraryClient {
  searchBooks(query: string): Promise<ISearchBooksUseCaseResponse>;
}

export function searchBooksUseCase(openLibraryClient: OpenLibraryClient) {
  return async function searchBooks({
    query,
  }: ISearchBooksUseCaseRequest): Promise<ISearchBooksUseCaseResponse> {
    return openLibraryClient.searchBooks(query);
  };
}
