import { Book, IBook } from './book.model';

export async function createBookAction(bookData: Partial<IBook>): Promise<IBook> {
  const newBook = new Book({
    title: bookData.title,
    author: bookData.author,
    genre: bookData.genre,
    publishDate: bookData.publishDate,
    publisher: bookData.publisher,
    isAvailable: true,
    isActive: true,
    reservationHistory: []
  });

  return await newBook.save();
}