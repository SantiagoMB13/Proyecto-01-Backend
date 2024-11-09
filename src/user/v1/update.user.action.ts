import { User, IUser } from './user.model';

export async function updateUserAction(
    userId: string, 
    updateData: Partial<IUser>
): Promise<IUser | null> {
    return await User.findOneAndUpdate(
      { _id: userId, isActive: true },
      { $set: updateData },
      { new: true }
    );
}