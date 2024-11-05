import { Book, IBook } from './book.model';

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