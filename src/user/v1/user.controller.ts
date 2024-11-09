import * as CreateUserActions from './create.user.action';
import * as ReadUserActions from './read.user.action';
import * as UpdateUserActions from './update.user.action';
import * as DeleteUserActions from './delete.user.action';

export async function softDeleteUser(userId: string) {
  return await DeleteUserActions.softDeleteUserAction(userId);
}

export async function registerUser(userData: any) {
  return await CreateUserActions.createUserAction(userData);
}

export async function loginUser(email: string, password: string, includeInactive: boolean) {
  return await ReadUserActions.loginUserAction(email, password, includeInactive);
}

export async function updateUser(userId: string, userData: any) {
  return await UpdateUserActions.updateUserAction(userId, userData);
}

export async function getUsers(queries: any, includeInactive: boolean) {
  return await ReadUserActions.getUsersAction(queries, includeInactive);
}