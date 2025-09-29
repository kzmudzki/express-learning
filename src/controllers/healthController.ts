import { Request, Response } from 'express';
import { ApiResponse } from '../types';
import { CONFIG } from '../config';
import { detailedHealthCheck, readinessCheck, livenessCheck } from '../middleware/healthCheck';

export const healthController = {
	// Simple health check
	getHealth: (_req: Request, res: Response): void => {
		const response: ApiResponse = {
			success: true,
			message: 'Service is healthy',
			data: {
				status: 'OK',
				timestamp: new Date().toISOString(),
				uptime: Math.floor(process.uptime()),
				environment: CONFIG.NODE_ENV,
			},
			timestamp: new Date().toISOString(),
		};
		res.status(200).json(response);
	},

	// Detailed health check with service monitoring
	getDetailedHealth: detailedHealthCheck,

	// Kubernetes-style readiness probe
	getReadiness: readinessCheck,

	// Kubernetes-style liveness probe
	getLiveness: livenessCheck,
};
