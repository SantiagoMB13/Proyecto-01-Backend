import { Book, IBook } from './book.model';

export async function softDeleteBookAction(bookId: string): Promise<IBook | null> {
  return await Book.findOneAndUpdate(
    { _id: bookId, isActive: true },
    { $set: { isActive: false } },
    { new: true }
  );
}