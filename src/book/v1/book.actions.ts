import { Book, IBook } from './book.model';
import { FilterQuery } from 'mongoose';

export async function createBookAction(bookData: Partial<IBook>): Promise<Partial<IBook>> {
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

  await newBook.save();
  const bookObject = newBook.toObject();
  const { isActive, ...bookWithoutIsActive } = bookObject;
  return bookWithoutIsActive;
}

export async function getBookAction(
  bookId: string, 
  includeInactive: boolean = false
): Promise<Partial<IBook> | null> {
  const query: FilterQuery<IBook> = { _id: bookId };
  if (!includeInactive) {
    query.isActive = true;
  }

  const book = await Book.findOne(query);
  if (!book) return null;

  const bookObject = book.toObject();
  const { isActive, ...bookWithoutIsActive } = bookObject;
  return bookWithoutIsActive;
}

export async function getBooksAction(
  filter: Partial<IBook> = {}, 
  includeInactive: boolean = false
): Promise<Partial<IBook>[]> {
  const query: FilterQuery<IBook> = { ...filter } as FilterQuery<IBook>;
  if (!includeInactive) {
    query.isActive = true;
  }

  const books = await Book.find(query);
  return books.map(book => {
    const bookObject = book.toObject();
    const { isActive, ...bookWithoutIsActive } = bookObject;
    return bookWithoutIsActive;
  });
}

export async function updateBookAction(
  bookId: string, 
  updateData: Partial<IBook>
): Promise<Partial<IBook> | null> {
  const book = await Book.findOneAndUpdate(
    { _id: bookId, isActive: true },
    { $set: updateData },
    { new: true }
  );

  if (!book) return null;

  const bookObject = book.toObject();
  const { isActive, ...bookWithoutIsActive } = bookObject;
  return bookWithoutIsActive;
}

export async function softDeleteBookAction(bookId: string): Promise<IBook | null> {
  return await Book.findOneAndUpdate(
    { _id: bookId, isActive: true },
    { $set: { isActive: false } },
    { new: true }
  );
}