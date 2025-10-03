import { Router, Request, Response, NextFunction } from 'express';
import { userService } from '../services/userService';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Helper functions are commented out as they're not currently used
// const renderWithLayout = (res: Response, template: string, data: any) => {
// 	const content =
//		res.app.get('view engine') === 'ejs'
//			? res.render(template, data, (err, html) => {
//					if (err) throw err;
//					return html;
//			  })
//			: '';
//
//	// For now, render directly without layout
//	res.render(template, data);
// };

// Home page
router.get('/', (_req: Request, res: Response) => {
	res.render('home', {
		title: 'Express.js API - Web Interface',
	});
});

// Authentication page
router.get('/auth', (_req: Request, res: Response) => {
	res.render('auth', {
		title: 'Express.js API',
	});
});

// Dashboard page
router.get('/dashboard', (_req: Request, res: Response) => {
	res.render('dashboard', {
		title: 'Express.js API',
	});
});

// Users list page
router.get('/users', async (_req: Request, res: Response, next: NextFunction) => {
	try {
		const users = await userService.getAllUsers();
		res.render('users', {
			title: 'All Users',
			users,
		});
	} catch (error) {
		next(error);
	}
});

// User detail page
router.get('/users/:id', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const id = parseInt(req.params.id);

		if (isNaN(id)) {
			return next(new AppError('Invalid user ID', 400));
		}

		const user = await userService.getUserById(id);

		if (!user) {
			return next(new AppError('User not found', 404));
		}

		res.render('user-detail', {
			title: `User: ${user.name}`,
			user,
		});
	} catch (error) {
		next(error);
	}
});

// Create user (form submission)
router.post('/users/create', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { name, email } = req.body;

		// Check if email already exists
		const emailExists = await userService.emailExists(email);
		if (emailExists) {
			return next(new AppError('User with this email already exists', 409));
		}

		await userService.createUser({ name, email });
		res.redirect('/web/users');
	} catch (error) {
		next(error);
	}
});

// Update user (form submission)
router.post('/users/:id/update', async (req: Request, res: Response, next: NextFunction) => {
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

		res.redirect(`/web/users/${id}`);
	} catch (error) {
		next(error);
	}
});

// Delete user (form submission)
router.post('/users/:id/delete', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const id = parseInt(req.params.id);

		if (isNaN(id)) {
			return next(new AppError('Invalid user ID', 400));
		}

		const deletedUser = await userService.deleteUser(id);

		if (!deletedUser) {
			return next(new AppError('User not found', 404));
		}

		res.redirect('/web/users');
	} catch (error) {
		next(error);
	}
});

// Seed database with sample users
router.get('/users/seed', async (_req: Request, res: Response, next: NextFunction) => {
	try {
		// Add some sample users if database is empty
		const existingUsers = await userService.getAllUsers();

		if (existingUsers.length === 0) {
			await userService.createUser({ name: 'Alice Johnson', email: 'alice@example.com' });
			await userService.createUser({ name: 'Bob Wilson', email: 'bob@example.com' });
			await userService.createUser({ name: 'Charlie Brown', email: 'charlie@example.com' });
		}

		res.redirect('/web/users');
	} catch (error) {
		next(error);
	}
});

// Health check page
router.get('/health', async (_req: Request, res: Response, next: NextFunction) => {
	try {
		// Simulate calls to health endpoints
		const health = {
			success: true,
			message: 'Service is healthy',
			data: { status: 'OK' },
			timestamp: new Date().toISOString(),
		};

		const detailed = {
			success: true,
			message: 'Detailed service health information',
			data: {
				status: 'OK',
				uptime: process.uptime(),
				memory: process.memoryUsage(),
				environment: process.env.NODE_ENV || 'development',
				nodeVersion: process.version,
				platform: process.platform,
				pid: process.pid,
			},
			timestamp: new Date().toISOString(),
		};

		res.render('health', {
			title: 'System Health Check',
			health,
			detailed,
		});
	} catch (error) {
		next(error);
	}
});

export { router as webRoutes };
