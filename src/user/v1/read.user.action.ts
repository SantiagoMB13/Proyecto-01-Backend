import { User, IUser } from './user.model';
import { FilterQuery } from 'mongoose';

export async function loginUserAction(
    email: string, 
    password: string, 
    includeInactive: boolean = false
): Promise<IUser | null> {
    const query: FilterQuery<IUser> = { email };
    if (!includeInactive) {
      query.isActive = true;
    }
  
    return await User.findOne(query);
}

export async function getUsersAction(
    filter: Partial<IUser> = {}, 
    includeInactive: boolean = false
): Promise<IUser[]> {
    const query: FilterQuery<IUser> = { ...filter } as FilterQuery<IUser>;
    if (!includeInactive) {
      query.isActive = true;
    }
  
    return await User.find(query);
}