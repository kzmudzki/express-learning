import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';
import { AppError } from '../middleware/errorHandler';
import { userService } from '../services/userService';
import { invalidateCache } from '../middleware/performance';
import { Prisma } from '@prisma/client';

export const userController = {
	getAllUsers: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const users = await userService.getAllUsers();

			const response: ApiResponse = {
				success: true,
				message: 'Users retrieved successfully',
				data: users,
				timestamp: new Date().toISOString(),
			};
			res.status(200).json(response);
		} catch (error) {
			next(error);
		}
	},

	getUserById: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const id = parseInt(req.params.id);

			if (isNaN(id)) {
				return next(new AppError('Invalid user ID', 400));
			}

			const user = await userService.getUserById(id);

			if (!user) {
				return next(new AppError('User not found', 404));
			}

			const response: ApiResponse = {
				success: true,
				message: 'User retrieved successfully',
				data: user,
				timestamp: new Date().toISOString(),
			};
			res.status(200).json(response);
		} catch (error) {
			next(error);
		}
	},

	createUser: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const { name, email } = req.body;

			// Check if email already exists
			const emailExists = await userService.emailExists(email);
			if (emailExists) {
				return next(new AppError('User with this email already exists', 409));
			}

			const newUser = await userService.createUser({ name, email });

			// Invalidate users cache after creating new user
			invalidateCache('users*');

			const response: ApiResponse = {
				success: true,
				message: 'User created successfully',
				data: newUser,
				timestamp: new Date().toISOString(),
			};
			res.status(201).json(response);
		} catch (error) {
			// Handle Prisma unique constraint errors
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2002') {
					return next(new AppError('User with this email already exists', 409));
				}
			}
			next(error);
		}
	},

	updateUser: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const id = parseInt(req.params.id);
			const { name, email } = req.body;

			if (isNaN(id)) {
				return next(new AppError('Invalid user ID', 400));
			}

			// Check if email already exists for another user
			if (email) {
				const emailExists = await userService.emailExists(email, id);
				if (emailExists) {
					return next(new AppError('User with this email already exists', 409));
				}
			}

			const updatedUser = await userService.updateUser(id, { name, email });

			if (!updatedUser) {
				return next(new AppError('User not found', 404));
			}

			// Invalidate users cache after updating user
			invalidateCache('users*');

			const response: ApiResponse = {
				success: true,
				message: 'User updated successfully',
				data: updatedUser,
				timestamp: new Date().toISOString(),
			};
			res.status(200).json(response);
		} catch (error) {
			// Handle Prisma unique constraint errors
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2002') {
					return next(new AppError('User with this email already exists', 409));
				}
			}
			next(error);
		}
	},

	deleteUser: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const id = parseInt(req.params.id);

			if (isNaN(id)) {
				return next(new AppError('Invalid user ID', 400));
			}

			const deletedUser = await userService.deleteUser(id);

			if (!deletedUser) {
				return next(new AppError('User not found', 404));
			}

			// Invalidate users cache after deleting user
			invalidateCache('users*');

			const response: ApiResponse = {
				success: true,
				message: 'User deleted successfully',
				data: deletedUser,
				timestamp: new Date().toISOString(),
			};
			res.status(200).json(response);
		} catch (error) {
			next(error);
		}
	},
};
