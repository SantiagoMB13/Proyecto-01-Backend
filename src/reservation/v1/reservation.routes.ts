import { Router, Request, Response } from 'express';
import * as controller from './reservation.controller';
import { authenticateUser } from './../../middlewares/authmiddleware';
import { Schema } from 'mongoose';

// INIT ROUTES
const reservationRoutes = Router();

// DECLARE ENDPOINT FUNCTIONS
async function CreateReservation(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const bodyUserId = req.body.userId;

    if (bodyUserId && !await controller.checkPermissions(req.user!, bodyUserId, 'createReservations')) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    const reservation = await controller.createReservation(userId, bodyUserId, req.body.bookId);
    if (reservation instanceof Error) {
        return res.status(400).json({ message: reservation.message });
    }
    res.status(201).json({ 
      message: "Reservation created successfully", 
      reservation 
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ 
      message: "Error creating reservation", 
      error 
    });
  }
}

async function GetReservations(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const includeInactive = req.query.includeInactive === 'true';
    const queries = { ...req.query };
    delete queries.includeInactive;

    if (!req.query.userId) {
      if (!req.user!.permissions.includes('readReservations')) {
        queries.userId = userId.toString();
      }
    } else if (!await controller.checkPermissions(req.user!, new Schema.Types.ObjectId(req.query.userId as string), 'readReservations')) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    const reservations = await controller.getReservations(queries, includeInactive);
    res.status(200).json({ 
      message: "Reservations retrieved successfully", 
      reservations 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error retrieving reservations", 
      error 
    });
  }
}

async function GetReservation(req: AuthRequest, res: Response) {
  try {
    const reservationId = req.params.id;
    const includeInactive = req.query.includeInactive === 'true';
    
    const reservation = await controller.getReservation(reservationId, includeInactive);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    if (!await controller.checkPermissions(req.user!, reservation.userId, 'readReservations')) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    res.status(200).json({ 
      message: "Reservation retrieved successfully", 
      reservation 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error retrieving reservation", 
      error 
    });
  }
}

async function UpdateReservation(req: AuthRequest, res: Response) {
  try {
    const reservationId = req.params.id;
    const includeInactive = req.query.includeInactive === 'true';
    
    const existingReservation = await controller.getReservation(reservationId, includeInactive);
    if (!existingReservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    if (!await controller.checkPermissions(req.user!, existingReservation.userId, 'updateReservations')) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    const updatedReservation = await controller.updateReservation(reservationId, req.body, includeInactive);
    if (updatedReservation instanceof Error) {
        return res.status(400).json({ message: updatedReservation.message });
    }
    res.status(200).json({ 
      message: "Reservation updated successfully", 
      reservation: updatedReservation 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error updating reservation", 
      error 
    });
  }
}

async function ReturnReservation(req: AuthRequest, res: Response) {
  try {
    const reservationId = req.params.id;
    const includeInactive = req.query.includeInactive === 'true';
    
    const existingReservation = await controller.getReservation(reservationId, includeInactive);
    if (!existingReservation) {
      return res.status(404).json({ message: "Reservation not found or already returned" });
    }

    if (!await controller.checkPermissions(req.user!, existingReservation.userId, 'deleteReservations')) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    const returnedReservation = await controller.returnReservation(reservationId, includeInactive);
    if (returnedReservation instanceof Error) {
        return res.status(400).json({ message: returnedReservation.message });
    }
    res.status(200).json({ 
      message: "Book returned successfully", 
      reservation: returnedReservation 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error returning book", 
      error 
    });
  }
}

async function DeleteReservation(req: AuthRequest, res: Response) {
  try {
    const reservationId = req.params.id;
    
    const existingReservation = await controller.getReservation(reservationId, true);
    if (!existingReservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    if (!await controller.checkPermissions(req.user!, existingReservation.userId, 'updateReservations')) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    const deletedReservation = await controller.softDeleteReservation(reservationId);
    if (deletedReservation instanceof Error) {
        return res.status(400).json({ message: deletedReservation.message });
    }
    res.status(200).json({ 
      message: "Reservation deleted successfully", 
      reservation: deletedReservation 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error deleting reservation", 
      error 
    });
  }
}

// Define interface for authenticated requests
interface AuthRequest extends Request {
  user?: {
    userId: Schema.Types.ObjectId;
    permissions: string[];
  };
}

// DECLARE ENDPOINTS
reservationRoutes.post('/reservations', authenticateUser, CreateReservation);
reservationRoutes.get('/reservations', authenticateUser, GetReservations);
reservationRoutes.get('/reservations/:id', authenticateUser, GetReservation);
reservationRoutes.put('/reservations/:id', authenticateUser, UpdateReservation);
reservationRoutes.put('/reservations/:id/return', authenticateUser, ReturnReservation);
reservationRoutes.delete('/reservations/:id', authenticateUser, DeleteReservation);

export default reservationRoutes;