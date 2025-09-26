import express from 'express';
import { CONFIG, isDevelopment } from './config';
import { setupSecurity } from './middleware/security';
import { setupLogging } from './middleware/logging';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiRoutes } from './routes';
import { webRoutes } from './routes/web';
import { ApiResponse } from './types';

const app = express();

// Set up EJS as template engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Security middleware
setupSecurity(app);

// Logging middleware
setupLogging(app);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root endpoint
app.get('/', (_req, res) => {
	const response: ApiResponse = {
		success: true,
		message: 'Express.js API with TypeScript is running!',
		data: {
			environment: CONFIG.NODE_ENV,
			version: '1.0.0',
			endpoints: {
				health: '/api/v1/health',
				users: '/api/v1/users',
			},
		},
		timestamp: new Date().toISOString(),
	};
	res.json(response);
});

// Mount API routes
app.use(CONFIG.API_PREFIX, apiRoutes);

// Mount web routes (HTML views)
app.use('/web', webRoutes);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

app.listen(CONFIG.PORT, () => {
	console.log(`🚀 Server is running on http://localhost:${CONFIG.PORT}`);
	console.log(`📝 Environment: ${CONFIG.NODE_ENV}`);
	if (isDevelopment) {
		console.log(`📊 Health check: http://localhost:${CONFIG.PORT}/health`);
	}
});
