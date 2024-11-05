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
        const { _id, isActive, ...reservationWithoutIsActive } = reservation;
        return reservationWithoutIsActive;
      });
  }
  
  return bookWithoutIsActive;
}

export async function softDeleteBookAction(bookId: string): Promise<IBook | null> {
  return await Book.findOneAndUpdate(
    { _id: bookId, isActive: true },
    { $set: { isActive: false } },
    { new: true }
  );
}