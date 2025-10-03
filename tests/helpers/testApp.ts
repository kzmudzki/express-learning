import express from 'express';
import { setupSecurity } from '../../src/middleware/security';
import { errorHandler, notFoundHandler } from '../../src/middleware/errorHandler';
import { apiRoutes } from '../../src/routes';

export function createTestApp() {
	const app = express();

	// Set up middleware (same as main app but without logging to avoid noise in tests)
	setupSecurity(app);

	// Body parsing middleware
	app.use(express.json({ limit: '10mb' }));
	app.use(express.urlencoded({ extended: true, limit: '10mb' }));

	// Mount API routes
	app.use('/api/v1', apiRoutes);

	// Error handlers
	app.use(notFoundHandler);
	app.use(errorHandler);

	return app;
}
