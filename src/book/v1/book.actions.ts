import { Book, IBook } from './book.model';
import { FilterQuery } from 'mongoose';

// Helper function to filter out inactive reservations and clean reservation data
function filterAndCleanReservations(book: any): Partial<IBook> {
  const bookObject = book.toObject();
  const { isActive, ...bookWithoutIsActive } = bookObject;
  
  if (bookWithoutIsActive.reservationHistory) {
    bookWithoutIsActive.reservationHistory = bookWithoutIsActive.reservationHistory
      .filter((reservation: any) => reservation.isActive)
      .map((reservation: any) => {
        const { isActive, ...reservationWithoutIsActive } = reservation;
        return reservationWithoutIsActive;
      });
  }
  
  return bookWithoutIsActive;
}

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
  return filterAndCleanReservations(newBook);
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

  return filterAndCleanReservations(book);
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
  return books.map(book => filterAndCleanReservations(book));
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

  return filterAndCleanReservations(book);
}

export async function softDeleteBookAction(bookId: string): Promise<IBook | null> {
  return await Book.findOneAndUpdate(
    { _id: bookId, isActive: true },
    { $set: { isActive: false } },
    { new: true }
  );
}