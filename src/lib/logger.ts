import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { CONFIG, isDevelopment, isProduction } from '../config';

// Define custom log levels
const customLevels = {
	levels: {
		error: 0,
		warn: 1,
		info: 2,
		http: 3,
		debug: 4,
	},
	colors: {
		error: 'red',
		warn: 'yellow',
		info: 'green',
		http: 'magenta',
		debug: 'blue',
	},
};

// Add colors to winston
winston.addColors(customLevels.colors);

// Custom format for structured logging
const logFormat = winston.format.combine(
	winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
	winston.format.errors({ stack: true }),
	winston.format.json(),
	winston.format.prettyPrint()
);

// Console format for development
const consoleFormat = winston.format.combine(
	winston.format.timestamp({ format: 'HH:mm:ss' }),
	winston.format.colorize({ all: true }),
	winston.format.printf(
		(info) => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`
	)
);

// Create transports array
const transports: winston.transport[] = [];

// Console transport for development
if (isDevelopment) {
	transports.push(
		new winston.transports.Console({
			level: 'debug',
			format: consoleFormat,
		})
	);
}

// File transports for production
if (isProduction) {
	// Error log file (rotate daily)
	transports.push(
		new DailyRotateFile({
			filename: 'logs/error-%DATE%.log',
			datePattern: 'YYYY-MM-DD',
			level: 'error',
			handleExceptions: true,
			maxFiles: '14d', // Keep logs for 14 days
			maxSize: '20m', // Max file size 20MB
			format: logFormat,
		})
	);

	// Combined log file (rotate daily)
	transports.push(
		new DailyRotateFile({
			filename: 'logs/combined-%DATE%.log',
			datePattern: 'YYYY-MM-DD',
			handleExceptions: true,
			maxFiles: '14d',
			maxSize: '20m',
			format: logFormat,
		})
	);

	// HTTP requests log file
	transports.push(
		new DailyRotateFile({
			filename: 'logs/http-%DATE%.log',
			datePattern: 'YYYY-MM-DD',
			level: 'http',
			maxFiles: '7d', // Keep HTTP logs for 7 days
			maxSize: '10m',
			format: logFormat,
		})
	);
}

// Create the logger
export const logger = winston.createLogger({
	levels: customLevels.levels,
	level: CONFIG.LOG_LEVEL,
	format: logFormat,
	transports,
	exitOnError: false,
});

// Helper functions for different log types
export const logError = (message: string, error?: Error, metadata?: any) => {
	logger.error(message, {
		error: error?.message,
		stack: error?.stack,
		...metadata,
	});
};

export const logWarning = (message: string, metadata?: any) => {
	logger.warn(message, metadata);
};

export const logInfo = (message: string, metadata?: any) => {
	logger.info(message, metadata);
};

export const logHttp = (message: string, metadata?: any) => {
	logger.http(message, metadata);
};

export const logDebug = (message: string, metadata?: any) => {
	logger.debug(message, metadata);
};

// Log application startup
export const logStartup = (port: number, environment: string) => {
	logger.info('🚀 Application started successfully', {
		port,
		environment,
		nodeVersion: process.version,
		timestamp: new Date().toISOString(),
	});
};

// Log application shutdown
export const logShutdown = (signal: string) => {
	logger.info('📴 Application shutting down gracefully', {
		signal,
		timestamp: new Date().toISOString(),
	});
};
