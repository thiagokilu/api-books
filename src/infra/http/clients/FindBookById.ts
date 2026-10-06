

export function FindBookById() {
  return {
    async findBookById(id: string) {
      const params = new URLSearchParams();

      // Opcional, mas recomendado
      if (process.env.GOOGLE_BOOKS_API_KEY) {
        params.set("key", process.env.GOOGLE_BOOKS_API_KEY);
      }

      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes/${id}?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error("Failed to find book on Google Books");
      }

      return response.json();
    },
  };
}
