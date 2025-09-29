import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { CONFIG } from '../config';

// General API rate limiting
export const generalLimiter = rateLimit({
  windowMs: CONFIG.RATE_LIMIT_WINDOW_MS, // 15 minutes
  max: CONFIG.RATE_LIMIT_MAX_REQUESTS, // 100 requests per window
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(CONFIG.RATE_LIMIT_WINDOW_MS / 1000 / 60), // minutes
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path.includes('/health');
  },
});

// Strict rate limiting for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    retryAfter: 15, // minutes
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Rate limiting for user creation/modification
export const userModificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 user modifications per hour
  message: {
    success: false,
    message: 'Too many user modification requests, please try again later.',
    retryAfter: 60, // minutes
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Speed limiting for resource-intensive operations
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Allow 50 requests per window at full speed
  delayMs: (hits) => hits * 100, // Add 100ms delay per request after delayAfter
  maxDelayMs: 5000, // Maximum delay of 5 seconds
});

// Strict rate limiting for password reset/change operations
export const passwordOperationsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password operations per hour
  message: {
    success: false,
    message: 'Too many password change attempts, please try again later.',
    retryAfter: 60, // minutes
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});
