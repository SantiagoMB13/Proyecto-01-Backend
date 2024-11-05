import { Reservation, IReservation } from './reservation.model';
import { FilterQuery } from 'mongoose';

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