import { Book, IBook } from './book.model';
import { FilterQuery } from 'mongoose';

export async function getBookAction(
  bookId: string, 
  includeInactive: boolean = false
): Promise<IBook | null> {
  const query: FilterQuery<IBook> = { _id: bookId };
  if (!includeInactive) {
    query.isActive = true;
  }

  return await Book.findOne(query);
}

export async function getBooksAction(
  filter: Partial<IBook> = {}, 
  includeInactive: boolean = false
): Promise<IBook[]> {
  const query: FilterQuery<IBook> = { ...filter } as FilterQuery<IBook>;
  if (!includeInactive) {
    query.isActive = true;
  }

  return await Book.find(query);
}