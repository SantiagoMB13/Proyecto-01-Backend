import { Reservation, IReservation } from './reservation.model';
import { User } from '../../user/v1/user.model';
import { Book } from '../../book/v1/book.model';
import mongoose from 'mongoose';

export async function createReservationAction(reservationData: Partial<IReservation>): Promise<Omit<IReservation, 'isActive'> | null> {
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
        throw new Error('User not found');
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
      const reservationObject = savedReservation.toObject();
      const { isActive, ...reservationWithoutIsActive } = reservationObject;
      return reservationWithoutIsActive as Omit<IReservation, 'isActive'>;
  
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }