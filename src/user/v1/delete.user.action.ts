import { User, IUser } from './user.model';

export async function softDeleteUserAction(userId: string): Promise<IUser | null> {
  return await User.findOneAndUpdate(
    { _id: userId, isActive: true },
    { $set: { isActive: false } },
    { new: true }
  );
}