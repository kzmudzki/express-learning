import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { ApiResponse } from '../types';
import { logger } from '../lib/logger';

const prisma = new PrismaClient();

interface HealthStatus {
	status: 'healthy' | 'unhealthy';
	timestamp: string;
	uptime: number;
	environment: string;
	version: string;
	services: {
		database: {
			status: 'connected' | 'disconnected';
			responseTime?: number;
		};
		memory: {
			used: number;
			total: number;
			percentage: number;
		};
		cpu: {
			usage: number;
		};
	};
}

export const detailedHealthCheck = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const startTime = Date.now();

		// Check database connection
		let dbStatus: 'connected' | 'disconnected' = 'disconnected';
		let dbResponseTime: number | undefined;

		try {
			const dbStart = Date.now();
			await prisma.$queryRaw`SELECT 1`;
			dbResponseTime = Date.now() - dbStart;
			dbStatus = 'connected';
		} catch (error) {
			logger.error('Database health check failed', error as Error);
			dbStatus = 'disconnected';
		}

		// Memory usage
		const memoryUsage = process.memoryUsage();
		const totalMemory = memoryUsage.heapTotal;
		const usedMemory = memoryUsage.heapUsed;
		const memoryPercentage = Math.round((usedMemory / totalMemory) * 100);

		// CPU usage (simplified)
		const cpuUsage = process.cpuUsage();
		const cpuPercentage = Math.round(((cpuUsage.user + cpuUsage.system) / 1000000) * 100);

		const healthStatus: HealthStatus = {
			status: dbStatus === 'connected' ? 'healthy' : 'unhealthy',
			timestamp: new Date().toISOString(),
			uptime: Math.floor(process.uptime()),
			environment: process.env.NODE_ENV || 'development',
			version: process.env.npm_package_version || '1.0.0',
			services: {
				database: {
					status: dbStatus,
					responseTime: dbResponseTime,
				},
				memory: {
					used: Math.round(usedMemory / 1024 / 1024), // MB
					total: Math.round(totalMemory / 1024 / 1024), // MB
					percentage: memoryPercentage,
				},
				cpu: {
					usage: cpuPercentage,
				},
			},
		};

		const response: ApiResponse = {
			success: healthStatus.status === 'healthy',
			message: `Service is ${healthStatus.status}`,
			data: healthStatus,
			timestamp: new Date().toISOString(),
		};

		// Log health check if unhealthy
		if (healthStatus.status === 'unhealthy') {
			logger.warn('Health check failed', healthStatus);
		}

		const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
		res.status(statusCode).json(response);
	} catch (error) {
		logger.error('Health check endpoint error', error as Error);
		next(error);
	}
};

export const readinessCheck = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		// Check if the application is ready to serve traffic
		let isReady = true;
		const checks: Record<string, boolean> = {};

		// Database readiness
		try {
			await prisma.$queryRaw`SELECT 1`;
			checks.database = true;
		} catch (error) {
			checks.database = false;
			isReady = false;
		}

		// Additional readiness checks can be added here
		// e.g., external API dependencies, cache connections, etc.

		const response: ApiResponse = {
			success: isReady,
			message: isReady ? 'Service is ready' : 'Service is not ready',
			data: {
				ready: isReady,
				checks,
				timestamp: new Date().toISOString(),
			},
			timestamp: new Date().toISOString(),
		};

		const statusCode = isReady ? 200 : 503;
		res.status(statusCode).json(response);
	} catch (error) {
		logger.error('Readiness check endpoint error', error as Error);
		next(error);
	}
};

export const livenessCheck = (req: Request, res: Response): void => {
	// Simple liveness check - if this endpoint responds, the service is alive
	const response: ApiResponse = {
		success: true,
		message: 'Service is alive',
		data: {
			alive: true,
			timestamp: new Date().toISOString(),
			uptime: Math.floor(process.uptime()),
		},
		timestamp: new Date().toISOString(),
	};

	res.status(200).json(response);
};
