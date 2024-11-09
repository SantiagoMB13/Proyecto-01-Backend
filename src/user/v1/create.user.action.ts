import { User, IUser } from './user.model';

export async function createUserAction(userData: Partial<IUser>): Promise<IUser> {
    const newUser = new User({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      permissions: userData.permissions || [],
      isActive: true,
      reservationHistory: []
    });
  
    return await newUser.save();
}