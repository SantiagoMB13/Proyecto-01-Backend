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