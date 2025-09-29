import helmet from 'helmet';
import cors from 'cors';
import { Express } from 'express';
import { isDevelopment, CONFIG } from '../config';
import { generalLimiter, speedLimiter } from './rateLimiting';

export const setupSecurity = (app: Express): void => {
	// Apply general rate limiting first
	app.use(generalLimiter);

	// Apply speed limiting for resource-intensive operations
	app.use(speedLimiter);

	// Enhanced Helmet for security headers
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
			hsts: {
				maxAge: 31536000, // 1 year
				includeSubDomains: true,
				preload: true,
			},
		})
	);

	// Enhanced CORS configuration
	app.use(
		cors({
			origin:
				CONFIG.CORS_ORIGIN === '*'
					? true // Allow all origins in development
					: CONFIG.CORS_ORIGIN.split(',').map((origin) => origin.trim()), // Specific origins in production
			credentials: true,
			methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
			allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
			maxAge: 86400, // Cache preflight response for 24 hours
		})
	);

	// Additional security headers
	app.use((_req, res, next) => {
		// Prevent MIME type sniffing
		res.setHeader('X-Content-Type-Options', 'nosniff');

		// Prevent clickjacking
		res.setHeader('X-Frame-Options', 'DENY');

		// Enable XSS filtering
		res.setHeader('X-XSS-Protection', '1; mode=block');

		// Referrer policy
		res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

		// Feature policy
		res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

		next();
	});
};
