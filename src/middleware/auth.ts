import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { AppError } from './errorHandler';
import { JwtPayload, AuthenticatedUser } from '../types/auth';

// Import UserRole from the generated Prisma client
import { UserRole } from '@prisma/client';

// Extend Express Request interface to include user
declare global {
	namespace Express {
		interface Request {
			user?: AuthenticatedUser;
		}
	}
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const authHeader = req.headers.authorization;
		const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

		if (!token) {
			return next(new AppError('Access token is required', 401));
		}

		// Verify token
		const decoded = authService.verifyToken(token);

		// Get user from database to ensure they still exist and are active
		const user = await authService.getUserById(decoded.userId);
		if (!user) {
			return next(new AppError('User not found or inactive', 401));
		}

		// Attach user to request
		req.user = user;
		next();
	} catch (error) {
		if (error instanceof AppError) {
			return next(error);
		}
		next(new AppError('Invalid token', 401));
	}
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const authHeader = req.headers.authorization;
		const token = authHeader && authHeader.split(' ')[1];

		if (token) {
			const decoded = authService.verifyToken(token);
			const user = await authService.getUserById(decoded.userId);
			if (user) {
				req.user = user;
			}
		}
		next();
	} catch (error) {
		// If optional auth fails, just continue without user
		next();
	}
};

export const requireRole = (...roles: (UserRole | string)[]) => {
	return (req: Request, res: Response, next: NextFunction): void => {
		if (!req.user) {
			return next(new AppError('Authentication required', 401));
		}

		if (!roles.includes(req.user.role)) {
			return next(new AppError('Insufficient permissions', 403));
		}

		next();
	};
};

// Helper functions that avoid module-level enum access
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
	return requireRole('ADMIN' as any)(req, res, next);
};

export const requireAdminOrModerator = (req: Request, res: Response, next: NextFunction): void => {
	return requireRole('ADMIN' as any, 'MODERATOR' as any)(req, res, next);
};

export const requireOwnershipOrAdmin = (getUserId: (req: Request) => number) => {
	return (req: Request, res: Response, next: NextFunction): void => {
		if (!req.user) {
			return next(new AppError('Authentication required', 401));
		}

		const resourceUserId = getUserId(req);
		const isOwner = req.user.id === resourceUserId;
		const isAdmin = req.user.role === 'ADMIN';

		if (!isOwner && !isAdmin) {
			return next(new AppError('Access denied', 403));
		}

		next();
	};
};
