import { Router } from 'express';
import * as controllers from './reservation.controller';
import { authenticateUser, authorizeUser } from './../../middlewares/authmiddleware';

const router = Router();

router.post('/reservations', authenticateUser, authorizeUser(['createReservations']), controllers.createReservation);
router.get('/reservations', authenticateUser, authorizeUser(['getReservations']), controllers.getReservations);
router.get('/reservations/:id', authenticateUser, controllers.getReservation);
router.put('/reservations/:id', authenticateUser, controllers.updateReservation);
router.put('/reservations/:id/return', authenticateUser, controllers.returnReservation);

export default router;