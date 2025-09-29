import morgan from 'morgan';
import { Express, Request, Response } from 'express';
import { isDevelopment } from '../config';
import { logger, logHttp, logError } from '../lib/logger';

// Custom morgan stream to use our winston logger
const stream = {
	write: (message: string) => {
		logHttp(message.trim());
	},
};

// Custom morgan format for structured logging
const customFormat = isDevelopment
	? ':method :url :status :res[content-length] - :response-time ms'
	: ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms';

export const setupLogging = (app: Express): void => {
	// Morgan HTTP request logging
	app.use(
		morgan(customFormat, {
			stream,
			skip: (req: Request, res: Response) => {
				// Skip logging for health checks in production
				return !isDevelopment && req.path.includes('/health');
			},
		})
	);

	// Request ID middleware for tracing
	app.use((req: Request, res: Response, next) => {
		const requestId = Math.random().toString(36).substring(2, 15);
		req.headers['x-request-id'] = requestId;
		res.setHeader('x-request-id', requestId);

		// Log request details
		logHttp('Incoming request', {
			requestId,
			method: req.method,
			url: req.url,
			userAgent: req.get('User-Agent'),
			ip: req.ip,
			body: req.method !== 'GET' ? req.body : undefined,
		});

		next();
	});

	// Response logging middleware
	app.use((req: Request, res: Response, next) => {
		const start = Date.now();

		res.on('finish', () => {
			const duration = Date.now() - start;
			const requestId = req.headers['x-request-id'];

			const logData = {
				requestId,
				method: req.method,
				url: req.url,
				statusCode: res.statusCode,
				responseTime: `${duration}ms`,
				contentLength: res.get('content-length'),
				userAgent: req.get('User-Agent'),
				ip: req.ip,
			};

			if (res.statusCode >= 400) {
				logError(`HTTP ${res.statusCode} - ${req.method} ${req.url}`, undefined, logData);
			} else {
				logHttp(`HTTP ${res.statusCode} - ${req.method} ${req.url}`, logData);
			}
		});

		next();
	});
};
