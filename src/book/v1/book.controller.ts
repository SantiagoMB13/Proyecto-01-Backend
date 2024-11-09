import * as CreateBookAction from './create.book.action';
import * as ReadBookAction from './read.book.action';
import * as UpdateBookAction from './update.book.action';
import * as DeleteBookAction from './delete.book.action';

export async function softDeleteBook(bookId: string) {
  return await DeleteBookAction.softDeleteBookAction(bookId);
}

export async function createBook(bookData: any) {
  return await CreateBookAction.createBookAction(bookData);
}

export async function getBooks(queries: any, includeInactive: boolean) {
  return await ReadBookAction.getBooksAction(queries, includeInactive);
}

export async function getBook(bookId: string, includeInactive: boolean) {
  return await ReadBookAction.getBookAction(bookId, includeInactive);
}

export async function updateBook(bookId: string, updateData: any, userPermissions: string[]) {
  const hasUpdatePermission = userPermissions.includes('updateBooks');
  const isLimitedUpdate = Object.keys(updateData).every(key => 
    ['isAvailable', 'reservationHistory'].includes(key)
  );

  if (!hasUpdatePermission && !isLimitedUpdate) {
    throw new Error('Insufficient permissions');
  }

  return await UpdateBookAction.updateBookAction(bookId, updateData);
}