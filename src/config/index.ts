import { config } from 'dotenv';

// Load environment variables
config();

export const CONFIG = {
	PORT: process.env.PORT || 3000,
	NODE_ENV: process.env.NODE_ENV || 'development',
	API_PREFIX: process.env.API_PREFIX || '/api/v1',
} as const;

export const isDevelopment = CONFIG.NODE_ENV === 'development';
export const isProduction = CONFIG.NODE_ENV === 'production';
