import { Request, Response } from 'express';
import * as reservationActions from './reservation.actions';
import { Schema } from 'mongoose';

interface AuthRequest extends Request {
  user?: {
    userId: Schema.Types.ObjectId;
    permissions: string[];
  };
}

export async function createReservation(req: AuthRequest, res: Response) {
  try {
    let userId = req.user!.userId;
    if (req.body.userId){
      if(!req.user!.permissions.includes('createReservations') && userId.toString() !== req.user!.userId.toString()){
        return res.status(403).json({ message: "Insufficient permissions" });
      } else {
        userId = req.body.userId;
      }
    }
    const bookId = req.body.bookId;
    const reservation = await reservationActions.createReservationAction({userId, bookId});
    res.status(201).json({ message: "Reservation created successfully", reservation });
  } catch (error) {
    res.status(500).json({ message: "Error creating reservation", error });
  }
}

export async function getReservations(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const includeInactiveInput = req.query.includeInactive === 'true';
    if (!req.query.userId){
      if (!req.user!.permissions.includes('readReservations')) {
        req.query.userId = userId.toString();
      }
    } else {
      if (!req.user!.permissions.includes('readReservations') && userId.toString() !== req.query.userId.toString()) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
    }
    const { includeInactive, ...queries } = req.query;
    const reservations = await reservationActions.getReservationsAction(queries, includeInactiveInput);
    res.status(200).json({ message: "Reservations retrieved successfully", reservations });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving reservations", error });
  }
}

export async function getReservation(req: AuthRequest, res: Response) {
  try {
    const reservationId = req.params.id;
    const includeInactiveInput = req.query.includeInactive === 'true';
    const reservation = await reservationActions.getReservationAction(reservationId, includeInactiveInput);
    if (reservation) {
      if (reservation.userId.toString() !== req.user!.userId.toString() && !req.user!.permissions.includes('readReservations')) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      res.status(200).json({ message: "Reservation retrieved successfully", reservation });
    } else {
      res.status(404).json({ message: "Reservation not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error retrieving reservation", error });
  }
}

export async function updateReservation(req: AuthRequest, res: Response) {
  try {
    const reservationId = req.params.id;
    const includeInactiveInput = req.query.includeInactive === 'true';
    const reservation = await reservationActions.getReservationAction(reservationId);
    if (reservation) {
      if (reservation.userId.toString() !== req.user!.userId.toString() && !req.user!.permissions.includes('updateReservations')) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const updatedReservation = await reservationActions.updateReservationAction(reservationId, req.body, includeInactiveInput);
      res.status(200).json({ message: "Reservation updated successfully", reservation: updatedReservation });
    } else {
      res.status(404).json({ message: "Reservation not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating reservation", error });
  }
}

export async function returnReservation(req: AuthRequest, res: Response) {
  try {
    const reservationId = req.params.id;
    const includeInactiveInput = req.query.includeInactive === 'true';
    const reservation = await reservationActions.getReservationAction(reservationId);
    if (reservation) {
      if (reservation.userId.toString() !== req.user!.userId.toString() && !req.user!.permissions.includes('deleteReservations')) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const returnedReservation = await reservationActions.returnReservationAction(reservationId, includeInactiveInput);
      res.status(200).json({ message: "Book returned successfully", reservation: returnedReservation });
    } else {
      res.status(404).json({ message: "Reservation not found or already returned" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error returning book", error });
  }
}

export async function softDeleteReservation(req: AuthRequest, res: Response) {
  try {
    const reservationId = req.params.id;
    const reservation = await reservationActions.getReservationAction(reservationId);
    if (reservation) {
      if (reservation.userId.toString() !== req.user!.userId.toString() && !req.user!.permissions.includes('updateReservations')) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const deletedReservation = await reservationActions.softDeleteReservationAction(reservationId);
      res.status(200).json({ message: "Reservation updated successfully", reservation: deletedReservation });
    } else {
      res.status(404).json({ message: "Reservation not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating reservation", error });
  }
}