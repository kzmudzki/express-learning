import morgan from 'morgan';
import { Express } from 'express';
import { isDevelopment } from '../config';

export const setupLogging = (app: Express): void => {
	if (isDevelopment) {
		// Detailed logging in development
		app.use(morgan('dev'));
	} else {
		// Production logging format
		app.use(morgan('combined'));
	}
};
