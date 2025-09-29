import swaggerJsdoc from 'swagger-jsdoc';
import { CONFIG } from './index';

const swaggerDefinition = {
	openapi: '3.0.0',
	info: {
		title: 'Express Learning API',
		version: '1.0.0',
		description: 'A comprehensive Express.js API with TypeScript, authentication, and best practices',
		contact: {
			name: 'API Support',
			email: 'support@example.com',
		},
		license: {
			name: 'MIT',
			url: 'https://opensource.org/licenses/MIT',
		},
	},
	servers: [
		{
			url: `http://localhost:${CONFIG.PORT}${CONFIG.API_PREFIX}`,
			description: 'Development server',
		},
		{
			url: `https://your-production-domain.com${CONFIG.API_PREFIX}`,
			description: 'Production server',
		},
	],
	components: {
		securitySchemes: {
			bearerAuth: {
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT',
				description: 'Enter your Bearer token in the format **Bearer &lt;token&gt;**',
			},
		},
		schemas: {
			ApiResponse: {
				type: 'object',
				properties: {
					success: {
						type: 'boolean',
						description: 'Indicates if the request was successful',
					},
					message: {
						type: 'string',
						description: 'Human-readable message describing the result',
					},
					data: {
						type: 'object',
						description: 'The response payload',
					},
					timestamp: {
						type: 'string',
						format: 'date-time',
						description: 'ISO timestamp of the response',
					},
				},
				required: ['success', 'message', 'timestamp'],
			},
			User: {
				type: 'object',
				properties: {
					id: {
						type: 'integer',
						description: 'Unique user identifier',
						example: 1,
					},
					name: {
						type: 'string',
						description: 'User full name',
						example: 'John Doe',
					},
					email: {
						type: 'string',
						format: 'email',
						description: 'User email address',
						example: 'john.doe@example.com',
					},
					role: {
						type: 'string',
						enum: ['USER', 'ADMIN', 'MODERATOR'],
						description: 'User role',
						example: 'USER',
					},
					isActive: {
						type: 'boolean',
						description: 'Whether the user account is active',
						example: true,
					},
					createdAt: {
						type: 'string',
						format: 'date-time',
						description: 'User creation timestamp',
					},
					updatedAt: {
						type: 'string',
						format: 'date-time',
						description: 'User last update timestamp',
					},
				},
				required: ['id', 'name', 'email', 'role', 'isActive', 'createdAt', 'updatedAt'],
			},
			CreateUserRequest: {
				type: 'object',
				properties: {
					name: {
						type: 'string',
						minLength: 2,
						maxLength: 50,
						description: 'User full name',
						example: 'John Doe',
					},
					email: {
						type: 'string',
						format: 'email',
						description: 'User email address',
						example: 'john.doe@example.com',
					},
				},
				required: ['name', 'email'],
			},
			UpdateUserRequest: {
				type: 'object',
				properties: {
					name: {
						type: 'string',
						minLength: 2,
						maxLength: 50,
						description: 'User full name',
						example: 'John Doe',
					},
					email: {
						type: 'string',
						format: 'email',
						description: 'User email address',
						example: 'john.doe@example.com',
					},
				},
				minProperties: 1,
			},
			RegisterRequest: {
				type: 'object',
				properties: {
					name: {
						type: 'string',
						minLength: 2,
						maxLength: 50,
						description: 'User full name',
						example: 'John Doe',
					},
					email: {
						type: 'string',
						format: 'email',
						description: 'User email address',
						example: 'john.doe@example.com',
					},
					password: {
						type: 'string',
						minLength: 8,
						maxLength: 128,
						description: 'Password (must contain at least one lowercase, uppercase, and number)',
						example: 'SecurePass123',
					},
				},
				required: ['name', 'email', 'password'],
			},
			LoginRequest: {
				type: 'object',
				properties: {
					email: {
						type: 'string',
						format: 'email',
						description: 'User email address',
						example: 'john.doe@example.com',
					},
					password: {
						type: 'string',
						description: 'User password',
						example: 'SecurePass123',
					},
				},
				required: ['email', 'password'],
			},
			AuthResponse: {
				type: 'object',
				properties: {
					user: {
						$ref: '#/components/schemas/User',
					},
					token: {
						type: 'string',
						description: 'JWT access token',
						example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
					},
					expiresIn: {
						type: 'string',
						description: 'Token expiration time',
						example: '7d',
					},
				},
				required: ['user', 'token', 'expiresIn'],
			},
			Error: {
				type: 'object',
				properties: {
					success: {
						type: 'boolean',
						example: false,
					},
					message: {
						type: 'string',
						description: 'Error message',
						example: 'An error occurred',
					},
					errors: {
						type: 'array',
						items: {
							type: 'string',
						},
						description: 'Array of detailed error messages',
					},
					timestamp: {
						type: 'string',
						format: 'date-time',
						description: 'Error timestamp',
					},
				},
				required: ['success', 'message', 'timestamp'],
			},
		},
		responses: {
			UnauthorizedError: {
				description: 'Access token is missing or invalid',
				content: {
					'application/json': {
						schema: {
							$ref: '#/components/schemas/Error',
						},
						example: {
							success: false,
							message: 'Access token is required',
							timestamp: '2023-12-01T10:00:00.000Z',
						},
					},
				},
			},
			ForbiddenError: {
				description: 'Insufficient permissions',
				content: {
					'application/json': {
						schema: {
							$ref: '#/components/schemas/Error',
						},
						example: {
							success: false,
							message: 'Insufficient permissions',
							timestamp: '2023-12-01T10:00:00.000Z',
						},
					},
				},
			},
			NotFoundError: {
				description: 'Resource not found',
				content: {
					'application/json': {
						schema: {
							$ref: '#/components/schemas/Error',
						},
						example: {
							success: false,
							message: 'User not found',
							timestamp: '2023-12-01T10:00:00.000Z',
						},
					},
				},
			},
			ValidationError: {
				description: 'Request validation failed',
				content: {
					'application/json': {
						schema: {
							$ref: '#/components/schemas/Error',
						},
						example: {
							success: false,
							message: 'Validation error',
							errors: ['Name is required', 'Email must be valid'],
							timestamp: '2023-12-01T10:00:00.000Z',
						},
					},
				},
			},
			RateLimitError: {
				description: 'Too many requests',
				content: {
					'application/json': {
						schema: {
							$ref: '#/components/schemas/Error',
						},
						example: {
							success: false,
							message: 'Too many requests from this IP, please try again later.',
							retryAfter: 15,
							timestamp: '2023-12-01T10:00:00.000Z',
						},
					},
				},
			},
		},
	},
	security: [
		{
			bearerAuth: [],
		},
	],
	tags: [
		{
			name: 'Health',
			description: 'Health check and monitoring endpoints',
		},
		{
			name: 'Authentication',
			description: 'User authentication and authorization',
		},
		{
			name: 'Users',
			description: 'User management operations',
		},
	],
};

const options = {
	definition: swaggerDefinition,
	apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
