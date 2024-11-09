import { Router, Request, Response } from 'express';
import { Schema } from 'mongoose';
import * as UserController from './user.controller';
import { authenticateUser } from './../../middlewares/authmiddleware';

// INIT ROUTES
const userRoutes = Router();

// INTERFACES
interface AuthRequest extends Request {
  params: any;
  user?: {
    userId: Schema.Types.ObjectId;
    permissions: string[];
  };
}

// DECLARE ENDPOINT FUNCTIONS
async function registerUserEndpoint(req: Request, res: Response) {
  try {
    const user = await UserController.registerUser(req.body);
    res.status(201).json({ 
      message: "User created successfully", 
      user 
    });
  } catch (error) {
    if ((error as any).code === 11000) {
      res.status(400).json({ message: "Email already exists" });
    } else {
      res.status(500).json({ message: "Error creating user", error });
    }
  }
}

async function loginUserEndpoint(req: Request, res: Response) {
  try {
    const includeInactiveInput = req.query.includeInactive === 'true';
    const { email, password } = req.body;
    const result = await UserController.loginUser(email, password, includeInactiveInput);
    
    if (result) {
      const { token, user } = result;
      res.status(200).json({ 
        message: "Login successful", 
        token, 
        user 
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging in", error });
  }
}

async function getUsersEndpoint(req: Request, res: Response) {
  try {
    const includeInactiveInput = req.query.includeInactive === 'true';
    const { includeInactive, ...queries } = req.query;
    const users = await UserController.getUsers(queries as any, includeInactiveInput);
    res.status(200).json({ 
      message: "Users retrieved successfully", 
      users 
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving users", error });
  }
}

async function updateUserEndpoint(req: AuthRequest, res: Response) {
  try {
    const userId = req.params.id;
    if (userId !== req.user!.userId && !req.user!.permissions.includes('updateUsers')) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    
    const updatedUser = await UserController.updateUser(userId, req.body);
    if (updatedUser) {
      res.status(200).json({ 
        message: "User updated successfully", 
        user: updatedUser 
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
}

async function softDeleteUserEndpoint(req: AuthRequest, res: Response) {
  try {
    const userId = req.params.id;
    if (userId !== req.user!.userId && !req.user!.permissions.includes('deleteUsers')) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    const deletedUser = await UserController.softDeleteUser(userId);
    if (deletedUser) {
      res.status(200).json({ message: "User deleted successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
}

// DECLARE ENDPOINTS
userRoutes.post('/users/register', registerUserEndpoint);
userRoutes.get('/users/login', loginUserEndpoint);
userRoutes.get('/users', getUsersEndpoint);
userRoutes.put('/users/:id', authenticateUser, updateUserEndpoint);
userRoutes.delete('/users/:id', authenticateUser, softDeleteUserEndpoint);

export default userRoutes;