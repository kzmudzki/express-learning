import { config } from 'dotenv';

// Load environment variables
config();

export const CONFIG = {
	// Server Configuration
	PORT: Number(process.env.PORT) || 3000,
	NODE_ENV: process.env.NODE_ENV || 'development',
	API_PREFIX: process.env.API_PREFIX || '/api/v1',
	
	// Database Configuration
	DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
	
	// Security Configuration
	JWT_SECRET: process.env.JWT_SECRET || 'your-fallback-secret-for-dev-only',
	JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
	
	// Rate Limiting
	RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
	RATE_LIMIT_MAX_REQUESTS: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
	
	// Caching
	REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
	CACHE_TTL: Number(process.env.CACHE_TTL) || 300, // 5 minutes
	
	// Logging
	LOG_LEVEL: process.env.LOG_LEVEL || 'info',
	
	// CORS Configuration
	CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
} as const;

export const isDevelopment = CONFIG.NODE_ENV === 'development';
export const isProduction = CONFIG.NODE_ENV === 'production';
export const isTest = CONFIG.NODE_ENV === 'test';

// Validation for production environment
if (isProduction) {
	const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
	const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
	
	if (missingVars.length > 0) {
		throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
	}
	
	if (CONFIG.JWT_SECRET === 'your-fallback-secret-for-dev-only') {
		throw new Error('JWT_SECRET must be set in production');
	}
}
