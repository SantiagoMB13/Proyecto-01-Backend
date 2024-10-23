import { Router } from 'express';
import * as controllers from './user.controller';
import { authenticateUser } from './../../middlewares/authmiddleware';

const router = Router();

// User routes
router.post('/users/register', controllers.registerUser);
router.get('/users/login', controllers.loginUser);
router.get('/users', controllers.getUsers);
router.put('/users/:id', authenticateUser, controllers.updateUser);
router.delete('/users/:id', authenticateUser, controllers.softDeleteUser);

export default router;