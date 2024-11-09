import { Schema } from 'mongoose';
import * as CreateReservationActions from './create.reservation.action';
import * as ReadReservationActions from './read.reservation.action';
import * as UpdateReservationActions from './update.reservation.action';
import * as DeleteReservationActions from './delete.reservation.action';

interface User {
  userId: Schema.Types.ObjectId;
  permissions: string[];
}

export async function createReservation(userId: Schema.Types.ObjectId, bodyUserId: Schema.Types.ObjectId | undefined, bookId: Schema.Types.ObjectId) {
  try {
    const finalUserId = bodyUserId || userId;
    return await CreateReservationActions.createReservationAction({ userId: finalUserId, bookId });
  } catch (error) {
    return error;
  }
}

export async function getReservations(queries: any, includeInactive: boolean) {
    return await ReadReservationActions.getReservationsAction(queries, includeInactive);
}

export async function getReservation(reservationId: string, includeInactive: boolean) {
    return await ReadReservationActions.getReservationAction(reservationId, includeInactive);
}

export async function updateReservation(reservationId: string, updateData: any, includeInactive: boolean) {
  try {
    return await UpdateReservationActions.updateReservationAction(reservationId, updateData, includeInactive);
  } catch (error) {
    return error;
  }
}

export async function returnReservation(reservationId: string, includeInactive: boolean) {
  try {
    return await UpdateReservationActions.returnReservationAction(reservationId, includeInactive);
  } catch (error) {
    return error;
  }
}

export async function softDeleteReservation(reservationId: string) {
  try {
    return await DeleteReservationActions.softDeleteReservationAction(reservationId);
  } catch (error) {
    return error;
  }
}