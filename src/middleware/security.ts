import helmet from 'helmet';
import cors from 'cors';
import { Express } from 'express';
import { isDevelopment } from '../config';

export const setupSecurity = (app: Express): void => {
	// Helmet for security headers
	app.use(
		helmet({
			crossOriginEmbedderPolicy: !isDevelopment,
			contentSecurityPolicy: {
				directives: {
					defaultSrc: ["'self'"],
					styleSrc: ["'self'", "'unsafe-inline'"],
					scriptSrc: ["'self'"],
					imgSrc: ["'self'", 'data:', 'https:'],
				},
			},
		})
	);

	// CORS configuration
	app.use(
		cors({
			origin: isDevelopment ? true : [], // In production, specify allowed origins
			credentials: true,
			methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
			allowedHeaders: ['Content-Type', 'Authorization'],
		})
	);
};
