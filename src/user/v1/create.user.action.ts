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

export async function createUserAction(userData: Partial<IUser>): Promise<Partial<IUser>> {
    const newUser = new User({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      permissions: userData.permissions || [],
      isActive: true,
      reservationHistory: []
    });
  
    await newUser.save();
    const userObject = newUser.toObject();
    const { password, isActive, permissions, ...userWithoutSensitiveData } = userObject;
    userWithoutSensitiveData.reservationHistory = cleanReservationHistory(userObject);
    return userWithoutSensitiveData;
  }