import compression from 'compression';
import responseTime from 'response-time';
import { Application, Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';

// Simple in-memory cache for demonstration
interface CacheEntry {
	data: any;
	timestamp: number;
	ttl: number;
}

class SimpleCache {
	private cache = new Map<string, CacheEntry>();
	private maxSize = 1000;

	set(key: string, data: any, ttlSeconds: number = 300): void {
		// Remove oldest entries if cache is full
		if (this.cache.size >= this.maxSize) {
			const oldestKey = this.cache.keys().next().value;
			this.cache.delete(oldestKey);
		}

		this.cache.set(key, {
			data,
			timestamp: Date.now(),
			ttl: ttlSeconds * 1000,
		});
	}

	get(key: string): any | null {
		const entry = this.cache.get(key);

		if (!entry) {
			return null;
		}

		// Check if entry has expired
		if (Date.now() - entry.timestamp > entry.ttl) {
			this.cache.delete(key);
			return null;
		}

		return entry.data;
	}

	has(key: string): boolean {
		return this.get(key) !== null;
	}

	delete(key: string): void {
		this.cache.delete(key);
	}

	clear(): void {
		this.cache.clear();
	}

	getStats(): { size: number; maxSize: number } {
		return {
			size: this.cache.size,
			maxSize: this.maxSize,
		};
	}
}

// Export cache instance
export const cache = new SimpleCache();

// Cache middleware factory
export const cacheMiddleware = (ttlSeconds: number = 300, keyGenerator?: (req: Request) => string) => {
	return (req: Request, res: Response, next: NextFunction): void => {
		// Only cache GET requests
		if (req.method !== 'GET') {
			return next();
		}

		// Generate cache key
		const defaultKey = `${req.method}:${req.originalUrl}:${JSON.stringify(req.query)}`;
		const cacheKey = keyGenerator ? keyGenerator(req) : defaultKey;

		// Try to get from cache
		const cachedData = cache.get(cacheKey);
		if (cachedData) {
			logger.debug('Cache hit', { cacheKey, url: req.originalUrl });
			if (!res.headersSent) {
				res.setHeader('X-Cache', 'HIT');
			}
			return res.json(cachedData);
		}

		// Intercept res.json to cache the response
		const originalJson = res.json;
		res.json = function (data: any) {
			// Only cache successful responses
			if (res.statusCode >= 200 && res.statusCode < 300) {
				cache.set(cacheKey, data, ttlSeconds);
				logger.debug('Response cached', { cacheKey, url: req.originalUrl, ttl: ttlSeconds });
			}

			if (!res.headersSent) {
				res.setHeader('X-Cache', 'MISS');
			}
			return originalJson.call(this, data);
		};

		next();
	};
};

// Performance monitoring middleware
export const performanceMonitoring = (req: Request, res: Response, next: NextFunction): void => {
	const start = process.hrtime.bigint();

	// Intercept the end method to set headers before response finishes
	const originalEnd = res.end;
	res.end = function (...args: any[]) {
		const end = process.hrtime.bigint();
		const duration = Number(end - start) / 1000000; // Convert to milliseconds

		// Set performance header before response ends
		if (!res.headersSent) {
			res.setHeader('X-Response-Time', `${duration.toFixed(2)}ms`);
		}

		// Log slow requests
		if (duration > 1000) {
			// > 1 second
			logger.warn('Slow request detected', {
				method: req.method,
				url: req.originalUrl,
				duration: `${duration.toFixed(2)}ms`,
				statusCode: res.statusCode,
				userAgent: req.get('User-Agent'),
				ip: req.ip,
			});
		}

		return originalEnd.apply(this, args);
	};

	next();
};

// ETag middleware for conditional requests
export const etagMiddleware = (req: Request, res: Response, next: NextFunction): void => {
	const originalSend = res.send;

	res.send = function (data: any) {
		if (req.method === 'GET' && res.statusCode === 200) {
			// Generate simple ETag based on content hash
			const etag = `"${Buffer.from(JSON.stringify(data)).toString('base64')}"`;
			res.setHeader('ETag', etag);

			// Check if client has matching ETag
			const clientETag = req.headers['if-none-match'];
			if (clientETag === etag) {
				return res.status(304).end();
			}
		}

		return originalSend.call(this, data);
	};

	next();
};

// Setup performance middleware
export const setupPerformance = (app: Application): void => {
	// Compression middleware - should be one of the first middleware
	app.use(
		compression({
			filter: (req: Request, res: Response) => {
				// Don't compress responses with this request header
				if (req.headers['x-no-compression']) {
					return false;
				}
				// Use compression filter function
				return compression.filter(req, res);
			},
			level: 6, // Compression level (0-9)
			threshold: 1024, // Only compress responses larger than 1KB
		})
	);

	// Response time tracking
	app.use(
		responseTime((req: Request, res: Response, time: number) => {
			logger.http(`${req.method} ${req.url} - ${time.toFixed(2)}ms`, {
				method: req.method,
				url: req.url,
				responseTime: time,
				statusCode: res.statusCode,
			});
		})
	);

	// Performance monitoring
	app.use(performanceMonitoring);

	// ETag support for conditional requests
	app.use(etagMiddleware);

	// Cache control headers for static content
	app.use('/api-docs', (req: Request, res: Response, next: NextFunction) => {
		res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour
		next();
	});
};

// Cache invalidation helpers
export const invalidateCache = (pattern: string): void => {
	// In a real application, you'd use Redis pattern matching
	// For now, we'll clear specific patterns
	if (pattern === 'users*') {
		// Clear all user-related cache entries
		logger.info('Invalidating user cache');
		// In this simple implementation, we'd need to track keys
		cache.clear(); // For simplicity, clear all
	}
};

// Cache warming function
export const warmCache = async (): Promise<void> => {
	try {
		logger.info('Starting cache warm-up');

		// Add logic to pre-populate cache with frequently accessed data
		// For example, popular user data, system settings, etc.

		logger.info('Cache warm-up completed');
	} catch (error) {
		logger.error('Cache warm-up failed', error as Error);
	}
};
