import { Reservation, IReservation } from './reservation.model';
import { User } from '../../user/v1/user.model';
import { Book } from '../../book/v1/book.model';
import mongoose from 'mongoose';

export async function softDeleteReservationAction(reservationId: string): Promise<Omit<IReservation, 'isActive'> | null> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Encontrar y actualizar la reservación activa
    const reservation = await Reservation.findOneAndUpdate(
      { _id: reservationId, isActive: true },
      { $set: { isActive: false } },
      { new: true, session }
    );

    if (!reservation) {
      throw new Error('Active reservation not found');
    }

    // Actualizar el historial en el libro
    const book = await Book.findById(reservation.bookId).session(session);
    if (!book) {
      throw new Error('Associated book not found');
    }

    book.reservationHistory = book.reservationHistory.map((entry: any) =>
      entry._id.toString() === reservationId
        ? { ...entry.toObject(), isActive: false }
        : entry
    );
    await book.save({ session });

    // Actualizar el historial en el usuario
    const user = await User.findById(reservation.userId).session(session);
    if (!user) {
      throw new Error('Associated user not found');
    }

    user.reservationHistory = user.reservationHistory.map((entry: any) =>
      entry._id.toString() === reservationId
        ? { ...entry.toObject(), isActive: false }
        : entry
    );
    await user.save({ session });

    await session.commitTransaction();
    const reservationObject = reservation.toObject();
    const { isActive, ...reservationWithoutIsActive } = reservationObject;
    return reservationWithoutIsActive as Omit<IReservation, 'isActive'>;

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}