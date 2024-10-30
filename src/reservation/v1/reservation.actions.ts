import { Reservation, IReservation } from './reservation.model';
import { User } from '../../user/v1/user.model';
import { Book } from '../../book/v1/book.model';
import { FilterQuery } from 'mongoose';
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

export async function getReservationAction(
  reservationId: string, 
  includeInactive: boolean = false
): Promise<Omit<IReservation, 'isActive'> | null> {
  const query: FilterQuery<IReservation> = { _id: reservationId };
  
  if (!includeInactive) {
    query.isActive = true;
  }
  const reservation = await Reservation.findOne(query);
  if (!reservation) {
    return null;
  }

  const reservationObject = reservation.toObject();
  const { isActive, ...reservationWithoutIsActive } = reservationObject;
  return reservationWithoutIsActive as Omit<IReservation, 'isActive'>;
}

export async function getReservationsAction(
  filter: Partial<IReservation> = {}, 
  includeInactive: boolean = false
): Promise<Omit<IReservation, 'isActive'>[]> {
  const query: FilterQuery<IReservation> = { ...filter } as FilterQuery<IReservation>;  
  if (!includeInactive) {
    query.isActive = true;
  }

  const reservations = await Reservation.find(query);
  const outputreservations = reservations.map(reservation => {
    const reservationObject = reservation.toObject();
    const { isActive, ...reservationWithoutIsActive } = reservationObject;
    return reservationWithoutIsActive;
  });

  return outputreservations as Omit<IReservation, 'isActive'>[];
}

export async function updateReservationAction(
  reservationId: string, 
  updateData: Partial<IReservation>,
  includeInactive: boolean = false
): Promise<Omit<IReservation, 'isActive'> | null> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const query: FilterQuery<IReservation> = { _id: reservationId };
    
    if (!includeInactive) {
      query.isActive = true;
    }

    // Encontrar y actualizar la reservación
    const updatedReservation = await Reservation.findOneAndUpdate(
      query,
      { $set: updateData },
      { new: true, session }
    );

    if (!updatedReservation) {
      throw new Error(includeInactive ? 'Reservation not found' : 'Active reservation not found');
    }

    // Actualizar el historial en el libro
    const book = await Book.findById(updatedReservation.bookId).session(session);
    if (!book) {
      throw new Error('Associated book not found');
    }

    book.reservationHistory = book.reservationHistory.map((entry: any) =>
      entry._id.toString() === reservationId
        ? updatedReservation.toObject()
        : entry
    );
    await book.save({ session });

    // Actualizar el historial en el usuario
    const user = await User.findById(updatedReservation.userId).session(session);
    if (!user) {
      throw new Error('Associated user not found');
    }

    user.reservationHistory = user.reservationHistory.map((entry: any) =>
      entry._id.toString() === reservationId
        ? updatedReservation.toObject()
        : entry
    );
    await user.save({ session });

    await session.commitTransaction();
    const reservationObject = updatedReservation.toObject();
    const { isActive, ...reservationWithoutIsActive } = reservationObject;
    return reservationWithoutIsActive as Omit<IReservation, 'isActive'>;

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export async function returnReservationAction(
  reservationId: string,
  includeInactive: boolean = false
): Promise<Omit<IReservation, 'isActive'> | null> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const query: FilterQuery<IReservation> = {
      _id: reservationId,
      returnDate: null
    };
    
    if (!includeInactive) {
      query.isActive = true;
    }

    // Encontrar la reservación
    const reservation = await Reservation.findOne(query).session(session);

    if (!reservation) {
      return null;
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
    book.reservationHistory = book.reservationHistory.map((entry: any) =>
      entry._id.toString() === reservationId
        ? { ...entry.toObject(), returnDate }
        : entry
    );
    await book.save({ session });

    // Actualizar el usuario
    const user = await User.findById(reservation.userId).session(session);
    if (!user) {
      throw new Error('Associated user not found');
    }

    user.reservationHistory = user.reservationHistory.map((entry: any) =>
      entry._id.toString() === reservationId
        ? { ...entry.toObject(), returnDate }
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