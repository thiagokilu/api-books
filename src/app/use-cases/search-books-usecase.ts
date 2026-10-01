export interface ISearchBooksUseCaseRequest {
  query: string;
}

export interface BookDoc {
  title: string;
  author_name?: string[];
  author_key?: string[];
  publish_year?: number[];
  cover_i?: number;
  cover_edition_key?: string;
  cover_height?: number;
  cover_width?: number;
  ebook_access?: string;
  edition_count?: number;
  first_publish_year?: number;
  has_fulltext?: boolean;
  key?: string;
  language?: string[];
  public_scan_b?: boolean;
  series_name?: string[];
  series_position?: string[];
  [key: string]: unknown;
}

export interface ISearchBooksUseCaseResponse {
  docs: BookDoc[];
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
