import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../types';
import { isDevelopment } from '../config';

export class AppError extends Error {
	public statusCode: number;
	public isOperational: boolean;

	constructor(message: string, statusCode: number = 500) {
		super(message);
		this.statusCode = statusCode;
		this.isOperational = true;

		Error.captureStackTrace(this, this.constructor);
	}
}

export const errorHandler = (err: AppError | Error, req: Request, res: Response, _next: NextFunction): void => {
	const statusCode = err instanceof AppError ? err.statusCode : 500;

	const errorResponse: ErrorResponse = {
		success: false,
		message: err.message || 'Internal server error',
		timestamp: new Date().toISOString(),
	};

	// Add stack trace in development
	if (isDevelopment) {
		errorResponse.stack = err.stack;
		errorResponse.error = err.constructor.name;
	}

	console.error(`[ERROR] ${statusCode} - ${err.message}`, {
		url: req.url,
		method: req.method,
		ip: req.ip,
		stack: err.stack,
	});

	res.status(statusCode).json(errorResponse);
};

export const notFoundHandler = (req: Request, res: Response): void => {
	const errorResponse: ErrorResponse = {
		success: false,
		message: `Route ${req.originalUrl} not found`,
		timestamp: new Date().toISOString(),
	};

	res.status(404).json(errorResponse);
};
