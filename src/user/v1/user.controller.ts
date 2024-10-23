import { Request, Response } from 'express';
import * as userActions from './user.actions';
import { Schema } from 'mongoose';

interface AuthRequest extends Request {
  params: any;
  user?: {
    userId: Schema.Types.ObjectId;
    permissions: string[];
  };
}

export async function softDeleteUser(req: AuthRequest, res: Response) {
  try {
    const userId = req.params.id;
    
    if (userId !== req.user!.userId && !req.user!.permissions.includes('deleteUsers')) {
      return res.status(403).json({ message: "You don't have permission to delete this user" });
    }

    const deletedUser = await userActions.softDeleteUserAction(userId);
    if (deletedUser) {
      res.status(200).json({ message: "User deleted successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
}

export async function registerUser(req: Request, res: Response) {
  try {
    const user = await userActions.createUserAction(req.body);
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    if ((error as any).code === 11000) {
      res.status(400).json({ message: "Email already exists" });
    } else {
      res.status(500).json({ message: "Error creating user", error });
    }
  }
}

export async function loginUser(req: Request, res: Response) {
  try {
    const includeInactiveInput = req.query.includeInactive === 'true';
    const { email, password } = req.body;
    const result = await userActions.loginUserAction(email, password, includeInactiveInput);
    if (result) {
      const { token, user } = result;
      res.status(200).json({ message: "Login successful", token, user });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging in", error });
  }
}

export async function updateUser(req: AuthRequest, res: Response) {
  try {
    const userId = req.params.id;
    if (userId !== req.user!.userId && !req.user!.permissions.includes('updateUsers')) {
      return res.status(403).json({ message: "You don't have permission to modify this user" });
    }
    const updatedUser = await userActions.updateUserAction(userId, req.body);
    if (updatedUser) {
      res.status(200).json({ message: "User updated successfully", user: updatedUser });
    } else {
      res.status(404).json({ message: "User not found or inactive" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
}

export async function getUsers(req: Request, res: Response) {
  try {
    const includeInactiveInput = req.query.includeInactive === 'true';
    const { includeInactive, ...queries } = req.query;
    const users = await userActions.getUsersAction(queries as any, includeInactiveInput);
    res.status(200).json({ message: "Users retrieved successfully", users });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving users", error });
  }
}