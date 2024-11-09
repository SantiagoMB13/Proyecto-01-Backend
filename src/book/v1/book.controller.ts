import * as CreateBookAction from './create.book.action';
import * as ReadBookAction from './read.book.action';
import * as UpdateBookAction from './update.book.action';
import * as DeleteBookAction from './delete.book.action';

function filterAndCleanReservations(book: any) {
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

export async function softDeleteBook(bookId: string) {
  const result = await DeleteBookAction.softDeleteBookAction(bookId);
  if (!result) return null;
  return filterAndCleanReservations(result);
}

export async function createBook(bookData: any) {
  const result = await CreateBookAction.createBookAction(bookData);
  return filterAndCleanReservations(result);
}

export async function getBooks(queries: any, includeInactive: boolean) {
  const books = await ReadBookAction.getBooksAction(queries, includeInactive);
  return books.map(book => filterAndCleanReservations(book));
}

export async function getBook(bookId: string, includeInactive: boolean) {
  const book = await ReadBookAction.getBookAction(bookId, includeInactive);
  if (!book) return null;
  return filterAndCleanReservations(book);
}

export async function updateBook(bookId: string, updateData: any, userPermissions: string[]) {
  const hasUpdatePermission = userPermissions.includes('updateBooks');
  const isLimitedUpdate = Object.keys(updateData).every(key => 
    ['isAvailable', 'reservationHistory'].includes(key)
  );

  if (!hasUpdatePermission && !isLimitedUpdate) {
    throw new Error('Insufficient permissions');
  }

  const result = await UpdateBookAction.updateBookAction(bookId, updateData);
  if (!result) return null;
  return filterAndCleanReservations(result);
}