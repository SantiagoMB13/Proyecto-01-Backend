import { User, IUser } from './user.model';
import jwt from 'jsonwebtoken';
import { FilterQuery } from 'mongoose';

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

export async function loginUserAction(
    email: string, 
    password: string, 
    includeInactive: boolean = false
  ): Promise<{ user: Partial<IUser>, token: string } | null> {
    const query: FilterQuery<IUser> = { email };
    if (!includeInactive) {
      query.isActive = true;
    }
  
    const user = await User.findOne(query);
    if (!user) return null;
  
    const isMatch = password === user.password;
    if (!isMatch) return null;
  
    const token = jwt.sign(
      { userId: user._id, permissions: user.permissions }, 
      process.env.JWT_SECRET!, 
      { expiresIn: '1h' }
    );
  
    const userObject = user.toObject();
    const { password: _, isActive, permissions, ...userWithoutSensitiveData } = userObject;
    userWithoutSensitiveData.reservationHistory = cleanReservationHistory(userObject);
  
    return {
      user: userWithoutSensitiveData,
      token
    };
  }

  export async function getUsersAction(
    filter: Partial<IUser> = {}, 
    includeInactive: boolean = false
  ): Promise<Partial<IUser>[]> {
    const query: FilterQuery<IUser> = { ...filter } as FilterQuery<IUser>;
    if (!includeInactive) {
      query.isActive = true;
    }
  
    const users = await User.find(query);
    return users.map(user => {
      const userObject = user.toObject();
      const { password, isActive, permissions, ...userWithoutSensitiveData } = userObject;
      userWithoutSensitiveData.reservationHistory = cleanReservationHistory(userObject);
      return userWithoutSensitiveData;
    });
  }