export interface ISearchBooksUseCaseRequest {
  query: string;
}

// Formato bruto retornado pelo Google Books
export interface GoogleBooksVolume {
  id: string;
  volumeInfo: {
    title: string;
    subtitle?: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    pageCount?: number;
    categories?: string[];
    language?: string;
    imageLinks?: {
      smallThumbnail?: string;
      thumbnail?: string;
    };
    industryIdentifiers?: Array<{ type: string; identifier: string }>;
    infoLink?: string;
  };
}

export interface GoogleBooksSearchResponse {
  totalItems: number;
  items?: GoogleBooksVolume[];
}

export interface GoogleBooksClient {
  searchBooks(query: string): Promise<GoogleBooksSearchResponse>;
}

// Formato que a sua API devolve
export interface Book {
  id: string;
  title: string;
  subtitle?: string;
  authors: string[];
  publisher?: string;
  publishedDate?: string;
  publishedYear?: number;
  description?: string;
  pageCount?: number;
  categories: string[];
  language?: string;
  coverUrl?: string;
  isbn?: string;
  infoLink?: string;
}

export interface ISearchBooksUseCaseResponse {
  total: number;
  books: Book[];
}

function mapVolumeToBook(volume: GoogleBooksVolume): Book {
  const info = volume.volumeInfo;
  const year = info.publishedDate
    ? Number.parseInt(info.publishedDate.slice(0, 4), 10)
    : undefined;

  const isbn =
    info.industryIdentifiers?.find((i) => i.type === "ISBN_13")?.identifier ??
    info.industryIdentifiers?.find((i) => i.type === "ISBN_10")?.identifier;

  const book: Book = {
    id: volume.id,
    title: info.title,
    authors: info.authors ?? [],
    categories: info.categories ?? [],
  };

  if (info.subtitle !== undefined) book.subtitle = info.subtitle;
  if (info.publisher !== undefined) book.publisher = info.publisher;
  if (info.publishedDate !== undefined) book.publishedDate = info.publishedDate;
  if (year !== undefined && !Number.isNaN(year)) book.publishedYear = year;
  if (info.description !== undefined) book.description = info.description;
  if (info.pageCount !== undefined) book.pageCount = info.pageCount;
  if (info.language !== undefined) book.language = info.language;
  if (info.imageLinks?.thumbnail !== undefined) {
    book.coverUrl = info.imageLinks.thumbnail.replace("http://", "https://");
  }
  if (isbn !== undefined) book.isbn = isbn;
  if (info.infoLink !== undefined) book.infoLink = info.infoLink;

  return book;
}

export function searchBooksUseCase(googleBooksClient: GoogleBooksClient) {
  return async function searchBooks({
    query,
  }: ISearchBooksUseCaseRequest): Promise<ISearchBooksUseCaseResponse> {
    const data = await googleBooksClient.searchBooks(query);

    return {
      total: data.totalItems,
      books: (data.items ?? []).map(mapVolumeToBook),
    };
  };
}