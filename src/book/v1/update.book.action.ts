import { Book, IBook } from './book.model';

export async function updateBookAction(
  bookId: string, 
  updateData: Partial<IBook>
): Promise<IBook | null> {
  return await Book.findOneAndUpdate(
    { _id: bookId, isActive: true },
    { $set: updateData },
    { new: true }
  );
}