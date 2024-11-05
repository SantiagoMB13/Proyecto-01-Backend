import { User, IUser } from './user.model';

// Helper function to filter and clean reservation history
function cleanReservationHistory(user: any) {
  if (user.reservationHistory) {
    // Filter out inactive reservations and remove isActive field from active ones
    const cleanedHistory = user.reservationHistory
      .filter((reservation: any) => reservation.isActive !== false)
      .map((reservation: any) => {
        const { _id, isActive, ...reservationWithoutIsActive } = reservation;
        return reservationWithoutIsActive;
      });
    
    return cleanedHistory;
  }
  return [];
}



export async function softDeleteUserAction(userId: string): Promise<IUser | null> {
  return await User.findOneAndUpdate(
    { _id: userId, isActive: true },
    { $set: { isActive: false } },
    { new: true }
  );
}