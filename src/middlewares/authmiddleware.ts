import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Schema } from 'mongoose';

interface AuthRequest extends Request {
  header: any;
  user?: {
    userId: Schema.Types.ObjectId;
    permissions: string[];
  };
}

export const authenticateUser = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: Schema.Types.ObjectId; permissions: string[] };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const authorizeUser = (requiredPermissions: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const hasAllRequiredPermissions = requiredPermissions.every(permission => 
      req.user!.permissions.includes(permission)
    );

    if (!hasAllRequiredPermissions) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  };
};