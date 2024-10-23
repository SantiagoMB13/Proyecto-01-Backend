import { Reservation, IReservation } from './reservation.model';
import { User } from '../../user/v1/user.model';
import { Book } from '../../book/v1/book.model';
import { FilterQuery } from 'mongoose';
import mongoose from 'mongoose';

export async function createReservationAction(reservationData: Partial<IReservation>): Promise<IReservation> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Verificar que el libro esté disponible y activo
    const book = await Book.findOne({
      _id: reservationData.bookId,
      isActive: true,
      isAvailable: true
    }).session(session);

    if (!book) {
      throw new Error('Book not found or not available');
    }

    // Verificar que el usuario exista y esté activo
    const user = await User.findOne({
      _id: reservationData.userId,
      isActive: true
    }).session(session);

    if (!user) {
      throw new Error('User not found or inactive');
    }

    // Crear la nueva reservación
    const newReservation = new Reservation({
      userId: user._id,
      userName: user.name,
      bookId: book._id,
      bookName: book.title,
      reservationDate: new Date()
    });

    // Guardar la reservación
    const savedReservation = await newReservation.save({ session });

    // Actualizar el libro
    book.isAvailable = false;
    book.reservationHistory.push(savedReservation.toObject());
    await book.save({ session });

    // Actualizar el usuario
    user.reservationHistory.push(savedReservation.toObject());
    await user.save({ session });

    await session.commitTransaction();
    return savedReservation;

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export async function getReservationAction(reservationId: string): Promise<IReservation | null> {
  return await Reservation.findById(reservationId);
}

export async function getReservationsAction(filter: Partial<IReservation> = {}): Promise<IReservation[]> {
  return await Reservation.find(filter as FilterQuery<IReservation>);
}

export async function updateReservationAction(
  reservationId: string, 
  updateData: Partial<IReservation>
): Promise<IReservation | null> {
  return await Reservation.findByIdAndUpdate(
    reservationId,
    { $set: updateData },
    { new: true }
  );
}

export async function returnReservationAction(reservationId: string): Promise<IReservation | null> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Encontrar la reservación activa
    const reservation = await Reservation.findOne({
      _id: reservationId,
      returnDate: null
    }).session(session);

    if (!reservation) {
      throw new Error('Active reservation not found');
    }

    const returnDate = new Date();

    // Actualizar la reservación
    reservation.returnDate = returnDate;
    await reservation.save({ session });

    // Actualizar el libro
    const book = await Book.findById(reservation.bookId).session(session);
    if (!book) {
      throw new Error('Associated book not found');
    }

    book.isAvailable = true;
    book.reservationHistory = book.reservationHistory.map(entry =>
      entry._id === reservationId
        ? { ...entry.toObject(), returnDate }
        : entry
    );
    await book.save({ session });

    // Actualizar el usuario
    const user = await User.findById(reservation.userId).session(session);
    if (!user) {
      throw new Error('Associated user not found');
    }

    user.reservationHistory = user.reservationHistory.map(entry =>
      entry._id === reservationId
        ? { ...entry.toObject(), returnDate }
        : entry
    );
    await user.save({ session });

    await session.commitTransaction();
    return reservation;

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}