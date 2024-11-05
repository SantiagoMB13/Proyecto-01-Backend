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

export async function updateUserAction(
    userId: string, 
    updateData: Partial<IUser>
  ): Promise<Partial<IUser> | null> {
    const user = await User.findOneAndUpdate(
      { _id: userId, isActive: true },
      { $set: updateData },
      { new: true }
    );
  
    if (!user) return null;
  
    const userObject = user.toObject();
    const { password, isActive, permissions, ...userWithoutSensitiveData } = userObject;
    userWithoutSensitiveData.reservationHistory = cleanReservationHistory(userObject);
    return userWithoutSensitiveData;
  }