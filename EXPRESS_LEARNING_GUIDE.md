# 📚 Express.js Learning Guide for TypeScript Developers

> A comprehensive guide to understanding Express.js architecture, patterns, and concepts through our project

## 🎯 Table of Contents

1. [Express.js Fundamentals](#expressjs-fundamentals)
2. [Project Architecture](#project-architecture)
3. [Middleware Deep Dive](#middleware-deep-dive)
4. [Controllers Pattern](#controllers-pattern)
5. [Routes & Routing](#routes--routing)
6. [Error Handling](#error-handling)
7. [Request Validation](#request-validation)
8. [Security](#security)
9. [Configuration Management](#configuration-management)
10. [Best Practices](#best-practices)

---

## 🚀 Express.js Fundamentals

### What is Express.js?

Express.js is a minimal and flexible **web application framework** for Node.js. Think of it as:

- **HTTP Server**: Handles incoming requests and sends responses
- **Middleware System**: Processes requests through a pipeline
- **Routing Engine**: Maps URLs to specific handlers
- **Template Engine**: (Optional) Renders dynamic content

### Core Concepts

```typescript
// Basic Express App Structure
import express from 'express';

const app = express(); // Create Express application instance

// Middleware (runs for every request)
app.use(express.json());

// Routes (handle specific endpoints)
app.get('/users', (req, res) => {
	res.json({ users: [] });
});

// Start server
app.listen(3000, () => {
	console.log('Server running on port 3000');
});
```

### Request-Response Cycle

```
Client Request → Middleware Stack → Route Handler → Response
     ↓              ↓                   ↓            ↓
   Browser      Security, Logging   Business Logic  JSON/HTML
```

---

## 🏗️ Project Architecture

Our project follows the **MVC-inspired pattern** with clear separation of concerns:

```
src/
├── config/          # Environment & app configuration
├── controllers/     # Business logic & request handlers
├── lib/            # Shared utilities & database client
├── middleware/      # Custom middleware functions
├── routes/         # Route definitions & URL mapping
├── services/       # Database operations & business logic
├── types/          # TypeScript interfaces & types
├── utils/          # Helper functions & utilities
└── index.ts        # Application entry point

prisma/             # Database configuration & migrations
├── dev.db          # SQLite database file
├── migrations/     # Version-controlled schema changes
├── schema.prisma   # Database schema definition
└── seed.ts         # Database seeding script
```

### Why This Structure?

| Directory      | Purpose                       | Benefits                     |
| -------------- | ----------------------------- | ---------------------------- |
| `config/`      | Centralized settings          | Easy environment management  |
| `controllers/` | HTTP request handlers         | Thin, focused controllers    |
| `lib/`         | Shared utilities & clients    | Reusable infrastructure      |
| `middleware/`  | Request processing            | Modular, chainable functions |
| `routes/`      | URL mapping                   | Clear API structure          |
| `services/`    | Business logic & database ops | Testable, reusable logic     |
| `types/`       | Type definitions              | Type safety & documentation  |
| `utils/`       | Helper functions              | DRY principle, reusability   |
| `prisma/`      | Database schema & migrations  | Version-controlled data      |

---

## 🔧 Middleware Deep Dive

### What is Middleware?

Middleware functions are **functions that execute during the request-response cycle**. They have access to:

- `req` (request object)
- `res` (response object)
- `next` (next middleware function)

```typescript
// Middleware Function Signature
type Middleware = (req: Request, res: Response, next: NextFunction) => void;
```

### Types of Middleware

#### 1. **Application-Level Middleware**

Runs for every request:

```typescript
// From src/index.ts
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
```

#### 2. **Security Middleware**

Protects your application:

```typescript
// From src/middleware/security.ts
export const setupSecurity = (app: Express): void => {
	// Helmet adds security headers
	app.use(
		helmet({
			crossOriginEmbedderPolicy: !isDevelopment,
			contentSecurityPolicy: {
				directives: {
					defaultSrc: ["'self'"],
					styleSrc: ["'self'", "'unsafe-inline'"],
					// ... more security rules
				},
			},
		})
	);

	// CORS enables cross-origin requests
	app.use(
		cors({
			origin: isDevelopment ? true : [], // Allow all origins in dev
			credentials: true,
			methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
		})
	);
};
```

#### 3. **Logging Middleware**

Tracks requests:

```typescript
// From src/middleware/logging.ts
export const setupLogging = (app: Express): void => {
	if (isDevelopment) {
		app.use(morgan('dev')); // Colored, concise output
	} else {
		app.use(morgan('combined')); // Apache combined log format
	}
};
```

#### 4. **Route-Level Middleware**

Runs for specific routes:

```typescript
// From src/routes/users.ts
router.post(
	'/',
	validate(userSchemas.create), // ← Route-level middleware
	userController.createUser // ← Route handler
);
```

#### 5. **Error Handling Middleware**

Catches and processes errors:

```typescript
// From src/middleware/errorHandler.ts
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
	}

	res.status(statusCode).json(errorResponse);
};
```

### Middleware Execution Order

```typescript
// Order matters! Middleware executes in the order it's defined:

app.use(setupSecurity); // 1. Security first
app.use(setupLogging); // 2. Log requests
app.use(express.json()); // 3. Parse request body
app.use('/api/v1', routes); // 4. Handle routes
app.use(notFoundHandler); // 5. Handle 404s
app.use(errorHandler); // 6. Handle errors (MUST be last)
```

---

## 🎮 Controllers Pattern

### What are Controllers?

Controllers contain the **business logic** for handling requests. They:

- Process request data
- Interact with databases/APIs
- Format responses
- Handle errors

### Example: User Controller

```typescript
// From src/controllers/userController.ts
export const userController = {
	// GET /api/v1/users
	getAllUsers: (_req: Request, res: Response): void => {
		const response: ApiResponse<User[]> = {
			success: true,
			message: 'Users retrieved successfully',
			data: users, // Mock data
			timestamp: new Date().toISOString(),
		};
		res.status(200).json(response);
	},

	// GET /api/v1/users/:id
	getUserById: (req: Request, res: Response, next: NextFunction): void => {
		const id = parseInt(req.params.id);

		// Validation (could be middleware)
		if (isNaN(id)) {
			return next(new AppError('Invalid user ID', 400));
		}

		const user = users.find((u) => u.id === id);

		if (!user) {
			return next(new AppError('User not found', 404));
		}

		const response: ApiResponse<User> = {
			success: true,
			message: 'User retrieved successfully',
			data: user,
			timestamp: new Date().toISOString(),
		};
		res.status(200).json(response);
	},
};
```

### Controller Best Practices

1. **Keep Controllers Thin**: Move complex logic to services
2. **Consistent Response Format**: Use standardized API responses
3. **Proper Error Handling**: Use `next()` to pass errors to error middleware
4. **TypeScript Types**: Define interfaces for request/response data

```typescript
// Good: Consistent response format
interface ApiResponse<T = any> {
	success: boolean;
	message: string;
	data?: T;
	timestamp: string;
}

// Good: Use next() for errors
if (!user) {
	return next(new AppError('User not found', 404));
}

// Good: Type request parameters
interface CreateUserRequest {
	name: string;
	email: string;
}
```

---

## 🛣️ Routes & Routing

### What is Routing?

Routing determines **how an application responds to client requests** for specific endpoints (URL + HTTP method).

### Route Structure

```typescript
app.METHOD(PATH, HANDLER);
```

- **METHOD**: HTTP method (get, post, put, delete, etc.)
- **PATH**: URL path
- **HANDLER**: Function that handles the request

### Example: Basic Routes

```typescript
// HTTP Method + Path + Handler
app.get('/users', getAllUsers); // GET request
app.post('/users', createUser); // POST request
app.put('/users/:id', updateUser); // PUT request with parameter
app.delete('/users/:id', deleteUser); // DELETE request
```

### Route Parameters

```typescript
// URL: /users/123
app.get('/users/:id', (req, res) => {
	const userId = req.params.id; // "123"
	// ...
});

// URL: /users/123/posts/456
app.get('/users/:userId/posts/:postId', (req, res) => {
	const { userId, postId } = req.params; // { userId: "123", postId: "456" }
	// ...
});
```

### Query Parameters

```typescript
// URL: /users?page=2&limit=10
app.get('/users', (req, res) => {
	const { page, limit } = req.query; // { page: "2", limit: "10" }
	// ...
});
```

### Modular Routing

Instead of putting all routes in one file, we organize them:

```typescript
// src/routes/index.ts - Main router
import { Router } from 'express';
import { healthRoutes } from './health';
import { userRoutes } from './users';

const router = Router();

// Mount sub-routers
router.use('/health', healthRoutes); // /api/v1/health/*
router.use('/users', userRoutes); // /api/v1/users/*

export { router as apiRoutes };
```

```typescript
// src/routes/users.ts - User-specific routes
import { Router } from 'express';
import { userController } from '../controllers/userController';

const router = Router();

// These become /api/v1/users/*
router.get('/', userController.getAllUsers); // GET /api/v1/users
router.get('/:id', userController.getUserById); // GET /api/v1/users/:id
router.post('/', userController.createUser); // POST /api/v1/users
router.put('/:id', userController.updateUser); // PUT /api/v1/users/:id
router.delete('/:id', userController.deleteUser); // DELETE /api/v1/users/:id
```

### Route Middleware

Add middleware to specific routes:

```typescript
// Single middleware
router.get('/:id', validate(userSchemas.params, 'params'), userController.getUserById);

// Multiple middleware
router.put(
	'/:id',
	validate(userSchemas.params, 'params'), // Validate URL parameter
	validate(userSchemas.update), // Validate request body
	userController.updateUser // Handle request
);
```

---

## ⚠️ Error Handling

### Express Error Handling

Express has built-in error handling, but we enhance it with:

1. **Custom Error Classes**
2. **Centralized Error Middleware**
3. **Consistent Error Responses**

### Custom Error Class

```typescript
// From src/middleware/errorHandler.ts
export class AppError extends Error {
	public statusCode: number;
	public isOperational: boolean;

	constructor(message: string, statusCode: number = 500) {
		super(message);
		this.statusCode = statusCode;
		this.isOperational = true; // Distinguish from programming errors

		Error.captureStackTrace(this, this.constructor);
	}
}
```

### Using Custom Errors

```typescript
// In controllers
if (!user) {
	return next(new AppError('User not found', 404));
}

if (existingUser) {
	return next(new AppError('User with this email already exists', 409));
}
```

### Error Middleware

```typescript
// Error middleware MUST have 4 parameters
export const errorHandler = (
	err: AppError | Error,
	req: Request,
	res: Response,
	_next: NextFunction // Even if unused, must be present
): void => {
	// Determine status code
	const statusCode = err instanceof AppError ? err.statusCode : 500;

	// Create error response
	const errorResponse: ErrorResponse = {
		success: false,
		message: err.message || 'Internal server error',
		timestamp: new Date().toISOString(),
	};

	// Add debugging info in development
	if (isDevelopment) {
		errorResponse.stack = err.stack;
		errorResponse.error = err.constructor.name;
	}

	// Log error
	console.error(`[ERROR] ${statusCode} - ${err.message}`, {
		url: req.url,
		method: req.method,
		ip: req.ip,
		stack: err.stack,
	});

	res.status(statusCode).json(errorResponse);
};
```

### Error Handling Flow

```
Controller → next(error) → Error Middleware → Response
     ↓            ↓              ↓              ↓
  Throws     Passes error   Formats error    JSON response
  AppError   to middleware   & logs it        to client
```

---

## ✅ Request Validation

### Why Validate Requests?

- **Security**: Prevent malicious input
- **Data Integrity**: Ensure correct data types
- **User Experience**: Provide clear error messages
- **API Reliability**: Prevent crashes from bad data

### Validation with Joi

```typescript
// From src/utils/validation.ts
import Joi from 'joi';

export const userSchemas = {
	create: Joi.object({
		name: Joi.string().min(2).max(50).required().messages({
			'string.min': 'Name must be at least 2 characters long',
			'string.max': 'Name cannot exceed 50 characters',
			'any.required': 'Name is required',
		}),
		email: Joi.string().email().required().messages({
			'string.email': 'Please provide a valid email address',
			'any.required': 'Email is required',
		}),
	}),

	params: Joi.object({
		id: Joi.number().integer().positive().required().messages({
			'number.base': 'User ID must be a number',
			'number.integer': 'User ID must be an integer',
			'number.positive': 'User ID must be positive',
		}),
	}),
};
```

### Validation Middleware Factory

```typescript
export const validate = (schema: Joi.ObjectSchema, property: 'body' | 'params' | 'query' = 'body') => {
	return (req: Request, _res: Response, next: NextFunction): void => {
		const { error } = schema.validate(req[property], { abortEarly: false });

		if (error) {
			const errorMessage = error.details.map((detail) => detail.message).join(', ');
			return next(new AppError(errorMessage, 400));
		}

		next(); // Validation passed, continue to next middleware
	};
};
```

### Using Validation in Routes

```typescript
// Validate request body
router.post('/', validate(userSchemas.create), userController.createUser);

// Validate URL parameters
router.get('/:id', validate(userSchemas.params, 'params'), userController.getUserById);

// Validate both
router.put(
	'/:id',
	validate(userSchemas.params, 'params'), // Check URL parameter
	validate(userSchemas.update), // Check request body
	userController.updateUser
);
```

### Validation Flow

```
Request → Validation Middleware → Controller
   ↓            ↓                     ↓
JSON body   Check against schema   Process valid data
   ↓            ↓                     ↓
Parameters  Return 400 if invalid   Return success response
```

---

## 🔒 Security

### Security Layers in Express

#### 1. **Helmet - Security Headers**

```typescript
// From src/middleware/security.ts
app.use(
	helmet({
		crossOriginEmbedderPolicy: !isDevelopment,
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'"], // Only load resources from same origin
				styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles
				scriptSrc: ["'self'"], // Only scripts from same origin
				imgSrc: ["'self'", 'data:', 'https:'], // Images from same origin, data URLs, HTTPS
			},
		},
	})
);
```

**What Helmet Does:**

- Sets `X-Frame-Options` (prevents clickjacking)
- Sets `X-Content-Type-Options` (prevents MIME sniffing)
- Sets `Strict-Transport-Security` (enforces HTTPS)
- Sets `Content-Security-Policy` (prevents XSS)

#### 2. **CORS - Cross-Origin Resource Sharing**

```typescript
app.use(
	cors({
		origin: isDevelopment ? true : [], // In production, specify allowed origins
		credentials: true, // Allow cookies
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	})
);
```

**CORS Configuration:**

- `origin`: Which domains can access your API
- `credentials`: Whether to allow cookies/auth headers
- `methods`: Which HTTP methods are allowed
- `allowedHeaders`: Which headers clients can send

#### 3. **Input Validation & Sanitization**

```typescript
// Validate all inputs
router.post('/', validate(userSchemas.create), userController.createUser);

// Limit request body size
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

#### 4. **Error Handling Security**

```typescript
// Don't expose sensitive information in production
if (isDevelopment) {
	errorResponse.stack = err.stack; // Only show stack traces in development
	errorResponse.error = err.constructor.name;
}
```

### Security Best Practices

1. **Environment Variables**: Never hardcode secrets
2. **Input Validation**: Validate all user input
3. **Rate Limiting**: Prevent abuse (not implemented yet)
4. **Authentication**: Verify user identity (not implemented yet)
5. **Authorization**: Control access to resources (not implemented yet)
6. **HTTPS**: Encrypt data in transit (production)
7. **Logging**: Monitor for suspicious activity

---

## ⚙️ Configuration Management

### Environment-Based Configuration

```typescript
// From src/config/index.ts
import { config } from 'dotenv';

// Load environment variables from .env file
config();

export const CONFIG = {
	PORT: process.env.PORT || 3000,
	NODE_ENV: process.env.NODE_ENV || 'development',
	API_PREFIX: process.env.API_PREFIX || '/api/v1',
} as const;

export const isDevelopment = CONFIG.NODE_ENV === 'development';
export const isProduction = CONFIG.NODE_ENV === 'production';
```

### Environment Variables

Create a `.env` file:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development
API_PREFIX=/api/v1

# Database (for future use)
DATABASE_URL=mongodb://localhost:27017/express-api

# JWT (for future authentication)
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h
```

### Using Configuration

```typescript
// Instead of hardcoding
app.listen(3000);

// Use configuration
app.listen(CONFIG.PORT, () => {
	console.log(`🚀 Server running on port ${CONFIG.PORT}`);
});
```

### Benefits

1. **Environment Separation**: Different settings for dev/prod
2. **Security**: Keep secrets out of code
3. **Flexibility**: Change settings without code changes
4. **Team Collaboration**: Each developer can have custom settings

---

## 🎯 Best Practices

### 1. **Project Structure**

```
✅ DO: Organize by feature/responsibility
src/
├── controllers/    # Business logic
├── routes/        # URL mapping
├── middleware/    # Request processing
├── services/      # External integrations
├── models/        # Data structures
└── utils/         # Helper functions

❌ DON'T: Put everything in one file
src/
└── app.ts  (2000+ lines)
```

### 2. **Error Handling**

```typescript
// ✅ DO: Use next() to pass errors
if (!user) {
	return next(new AppError('User not found', 404));
}

// ❌ DON'T: Throw errors directly in async functions without catching
throw new Error('Something went wrong'); // This can crash your app
```

### 3. **Middleware Order**

```typescript
// ✅ DO: Order middleware logically
app.use(helmet()); // Security first
app.use(morgan('combined')); // Logging
app.use(express.json()); // Body parsing
app.use('/api', routes); // Routes
app.use(notFoundHandler); // 404 handler
app.use(errorHandler); // Error handler (LAST)

// ❌ DON'T: Put error handler before routes
app.use(errorHandler); // This won't catch route errors
app.use('/api', routes);
```

### 4. **Response Consistency**

```typescript
// ✅ DO: Use consistent response format
interface ApiResponse<T = any> {
	success: boolean;
	message: string;
	data?: T;
	timestamp: string;
}

// ❌ DON'T: Return different response formats
res.json({ users: [] }); // Inconsistent
res.json({ success: true, data: [] }); // Also inconsistent
```

### 5. **TypeScript Usage**

```typescript
// ✅ DO: Type everything
interface CreateUserRequest {
	name: string;
	email: string;
}

const createUser = (req: Request<{}, {}, CreateUserRequest>, res: Response) => {
	// req.body is now typed
};

// ❌ DON'T: Use 'any' everywhere
const createUser = (req: any, res: any) => {
	// No type safety
};
```

### 6. **Validation**

```typescript
// ✅ DO: Validate at the route level
router.post('/', validate(userSchema), createUser);

// ❌ DON'T: Validate in controllers (mixing concerns)
const createUser = (req, res) => {
	if (!req.body.name) {
		return res.status(400).json({ error: 'Name required' });
	}
	// Business logic mixed with validation
};
```

### 7. **Security**

```typescript
// ✅ DO: Sanitize inputs, use HTTPS, validate everything
app.use(helmet());
app.use(cors({ origin: ['https://yourdomain.com'] }));

// ❌ DON'T: Trust user input, expose sensitive data
app.use(cors({ origin: '*' })); // Too permissive
console.log(process.env.JWT_SECRET); // Exposing secrets
```

---

## 🗄️ Database Integration

### From Mock Data to Real Database

Our API has evolved from using in-memory arrays to a real SQLite database with Prisma ORM:

**Before** (Mock Data):

```typescript
let users: User[] = [{ id: 1, name: 'John Doe', email: 'john@example.com' }];

// Data lost on restart ❌
const newUser = { id: Date.now(), ...userData };
users.push(newUser);
```

**After** (Database):

```typescript
// Data persists ✅
const newUser = await prisma.user.create({
	data: userData,
});
```

### Key Database Concepts

#### **Prisma ORM Benefits**

- **Type Safety**: Auto-generated TypeScript types
- **Database Migrations**: Version-controlled schema changes
- **Query Builder**: Intuitive database operations
- **Error Handling**: Database-specific error management

#### **Service Layer Pattern**

```typescript
// Service handles database operations
export class UserService {
	async createUser(userData: CreateUserData): Promise<User> {
		return await prisma.user.create({ data: userData });
	}
}

// Controller stays thin and focused
export const userController = {
	createUser: async (req, res, next) => {
		try {
			const user = await userService.createUser(req.body);
			res.status(201).json({ success: true, data: user });
		} catch (error) {
			next(error);
		}
	},
};
```

#### **Database Commands**

```bash
# Development workflow
npm run db:seed          # Add sample data
npm run db:reset         # Reset and reseed
npx prisma studio        # Visual database browser
npx prisma migrate dev   # Create new migration
```

### What You Gained

1. **🔄 Data Persistence**: Survives server restarts
2. **🔒 Data Integrity**: Unique constraints, validation
3. **📈 Scalability**: Handle large datasets efficiently
4. **🧪 Type Safety**: Compile-time database checks
5. **👥 Collaboration**: Version-controlled schema

> 📚 **Deep Dive**: See `DATABASE_LEARNING_GUIDE.md` for comprehensive database concepts

---

## 🚀 Next Steps

Now that you understand the fundamentals, here's what you can add to expand your Express.js knowledge:

### Immediate Next Steps

1. **Database Relations**: Add Posts, Comments models
2. **Authentication**: JWT tokens, sessions
3. **Testing**: Unit tests with Jest
4. **API Documentation**: Swagger/OpenAPI

### Advanced Topics

1. **Rate Limiting**: Prevent API abuse
2. **Caching**: Redis for performance
3. **File Uploads**: Handle multipart forms
4. **WebSockets**: Real-time communication
5. **Microservices**: Service architecture
6. **Deployment**: Docker, AWS, Heroku

### Learning Resources

- [Express.js Official Docs](https://expressjs.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 🎉 Congratulations!

You now understand:

- ✅ Express.js fundamentals and request-response cycle
- ✅ Middleware architecture and execution flow
- ✅ MVC-inspired project structure
- ✅ Controllers and business logic separation
- ✅ Routing and URL mapping
- ✅ Error handling patterns
- ✅ Request validation with Joi
- ✅ Security best practices
- ✅ Configuration management
- ✅ TypeScript integration

You've built a production-ready Express.js API foundation! 🚀
