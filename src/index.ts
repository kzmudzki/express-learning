import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { CONFIG, isDevelopment } from './config';
import { setupSecurity } from './middleware/security';
import { setupLogging } from './middleware/logging';
import { setupPerformance } from './middleware/performance';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiRoutes } from './routes';
import { webRoutes } from './routes/web';
import { ApiResponse } from './types';
import { logStartup, logShutdown } from './lib/logger';
import { swaggerSpec } from './config/swagger';

const app = express();

// Set up EJS as template engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Serve static files from public directory
app.use(express.static('public'));

// Performance middleware (should be early in the stack)
setupPerformance(app);

// Security middleware
setupSecurity(app);

// Logging middleware
setupLogging(app);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Documentation
app.use(
	'/api-docs',
	swaggerUi.serve,
	swaggerUi.setup(swaggerSpec, {
		customCss: '.swagger-ui .topbar { display: none }',
		customSiteTitle: 'Express Learning API Documentation',
		swaggerOptions: {
			persistAuthorization: true,
			displayRequestDuration: true,
			tryItOutEnabled: true,
		},
	})
);

// Serve raw OpenAPI spec
app.get('/api-docs.json', (_req, res) => {
	res.setHeader('Content-Type', 'application/json');
	res.send(swaggerSpec);
});

// Root endpoint
app.get('/', (_req, res) => {
	const response: ApiResponse = {
		success: true,
		message: 'Express.js API with TypeScript is running!',
		data: {
			environment: CONFIG.NODE_ENV,
			version: '1.0.0',
			endpoints: {
				health: `${CONFIG.API_PREFIX}/health`,
				users: `${CONFIG.API_PREFIX}/users`,
				auth: `${CONFIG.API_PREFIX}/auth`,
				docs: '/api-docs',
				spec: '/api-docs.json',
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

const server = app.listen(CONFIG.PORT, () => {
	logStartup(CONFIG.PORT, CONFIG.NODE_ENV);
	if (isDevelopment) {
		console.log(`📊 Health check: http://localhost:${CONFIG.PORT}${CONFIG.API_PREFIX}/health`);
		console.log(`📚 API docs: http://localhost:${CONFIG.PORT}/api-docs`);
		console.log(`🔗 API spec: http://localhost:${CONFIG.PORT}/api-docs.json`);
	}
});

// Graceful shutdown handling
const gracefulShutdown = (signal: string) => {
	logShutdown(signal);

	server.close((err) => {
		if (err) {
			console.error('Error during shutdown:', err);
			process.exit(1);
		}

		console.log('🔴 Server closed successfully');
		process.exit(0);
	});

	// Force close after 10 seconds
	setTimeout(() => {
		console.error('🔴 Forcing shutdown after timeout');
		process.exit(1);
	}, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
	console.error('🔴 Uncaught Exception:', err);
	gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
	console.error('🔴 Unhandled Rejection at:', promise, 'reason:', reason);
	gracefulShutdown('unhandledRejection');
});
