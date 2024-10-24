import { Request, Response } from 'express';
import * as reservationActions from './reservation.actions';
import { Schema } from 'mongoose';

interface AuthRequest extends Request {
  user?: {
    userId: Schema.Types.ObjectId;
    userName: string;
    permissions: string[];
  };
}

export async function createReservation(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const userName = req.user!.userName;
    const bookId = req.body.bookID;
    const reservation = await reservationActions.createReservationAction({userId, userName, bookId});
    res.status(201).json({ message: "Reservation created successfully", reservation });
  } catch (error) {
    res.status(500).json({ message: "Error creating reservation", error });
  }
}

export async function getReservations(req: AuthRequest, res: Response) {
  try {
    const reservations = await reservationActions.getReservationsAction(req.query);
    res.status(200).json({ message: "Reservations retrieved successfully", reservations });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving reservations", error });
  }
}

export async function getReservation(req: AuthRequest, res: Response) {
  try {
    const reservationId = req.params.id;
    const reservation = await reservationActions.getReservationAction(reservationId);
    if (reservation) {
      if (reservation.userId !== req.user!.userId && !req.user!.permissions.includes('readReservations')) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      res.status(200).json({ message: "Reservation retrieved successfully", reservation });
    } else {
      res.status(404).json({ message: "Reservation not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error retrieving reservation", error });
  }
}

export async function updateReservation(req: AuthRequest, res: Response) {
  try {
    const reservationId = req.params.id;
    const updatedReservation = await reservationActions.updateReservationAction(reservationId, req.body);
    if (updatedReservation) {
      if (updatedReservation.userId !== req.user!.userId && !req.user!.permissions.includes('updateReservations')) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
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
    const returnedReservation = await reservationActions.returnReservationAction(reservationId);
    if (returnedReservation) {
      if (returnedReservation.userId !== req.user!.userId && !req.user!.permissions.includes('deleteReservations')) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      res.status(200).json({ message: "Book returned successfully", reservation: returnedReservation });
    } else {
      res.status(404).json({ message: "Reservation not found or already returned" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error returning book", error });
  }
}