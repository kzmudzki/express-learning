import { Request, Response } from 'express';
import { ApiResponse } from '../types';
import { CONFIG } from '../config';

export const healthController = {
	getHealth: (_req: Request, res: Response): void => {
		const response: ApiResponse = {
			success: true,
			message: 'Service is healthy',
			data: {
				status: 'OK',
				timestamp: new Date().toISOString(),
			},
			timestamp: new Date().toISOString(),
		};
		res.status(200).json(response);
	},

	getDetailedHealth: (_req: Request, res: Response): void => {
		const response: ApiResponse = {
			success: true,
			message: 'Detailed service health information',
			data: {
				status: 'OK',
				uptime: process.uptime(),
				memory: process.memoryUsage(),
				environment: CONFIG.NODE_ENV,
				nodeVersion: process.version,
				platform: process.platform,
				arch: process.arch,
				pid: process.pid,
			},
			timestamp: new Date().toISOString(),
		};
		res.status(200).json(response);
	},
};
