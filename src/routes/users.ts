import { Router } from 'express';
import { userController } from '../controllers/userController';
import { validate, userSchemas } from '../utils/validation';

const router = Router();

// GET /users - Get all users
router.get('/', userController.getAllUsers);

// GET /users/:id - Get user by ID
router.get('/:id', validate(userSchemas.params, 'params'), userController.getUserById);

// POST /users - Create new user
router.post('/', validate(userSchemas.create), userController.createUser);

// PUT /users/:id - Update user
router.put('/:id', validate(userSchemas.params, 'params'), validate(userSchemas.update), userController.updateUser);

// DELETE /users/:id - Delete user
router.delete('/:id', validate(userSchemas.params, 'params'), userController.deleteUser);

export { router as userRoutes };
