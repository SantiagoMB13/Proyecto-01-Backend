import * as CreateUserActions from './create.user.action';
import * as ReadUserActions from './read.user.action';
import * as UpdateUserActions from './update.user.action';
import * as DeleteUserActions from './delete.user.action';
import jwt from 'jsonwebtoken';

// Helper functions to clean sensitive user data
function cleanReservationHistory(user: any) {
  if (user.reservationHistory) {
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


function cleanUserData(userObject: any) {
  const { password, isActive, permissions, ...userWithoutSensitiveData } = userObject;
  userWithoutSensitiveData.reservationHistory = cleanReservationHistory(userObject);
  return userWithoutSensitiveData;
}

export async function softDeleteUser(userId: string) {
  const deletedUser = await DeleteUserActions.softDeleteUserAction(userId);
  if (!deletedUser) return null;
  return cleanUserData(deletedUser.toObject());
}

export async function registerUser(userData: any) {
  const newUser = await CreateUserActions.createUserAction(userData);
  return cleanUserData(newUser.toObject());
}

export async function loginUser(email: string, password: string, includeInactive: boolean) {
  const user = await ReadUserActions.loginUserAction(email, password, includeInactive);
  if (!user) return null;

  const isMatch = password === user.password;
  if (!isMatch) return null;

  const token = jwt.sign(
    { userId: user._id, permissions: user.permissions }, 
    process.env.JWT_SECRET!, 
    { expiresIn: '1h' }
  );

  return {
    user: cleanUserData(user.toObject()),
    token
  };
}

export async function updateUser(userId: string, userData: any) {
  const updatedUser = await UpdateUserActions.updateUserAction(userId, userData);
  if (!updatedUser) return null;
  return cleanUserData(updatedUser.toObject());
}

export async function getUsers(queries: any, includeInactive: boolean) {
  const users = await ReadUserActions.getUsersAction(queries, includeInactive);
  return users.map(user => cleanUserData(user.toObject()));
}