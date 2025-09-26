# 🛠️ Hands-On Express.js Exercises

> Practical exercises to reinforce your Express.js learning with our project

## 🎯 Exercise Levels

- 🟢 **Beginner**: Basic Express concepts
- 🟡 **Intermediate**: Middleware and validation
- 🔴 **Advanced**: Architecture and patterns

---

## 🟢 Beginner Exercises

### Exercise 1: Add a New Route

**Goal**: Understand basic routing

**Task**: Add a route that returns server information

```typescript
// Add to src/routes/health.ts
router.get('/info', healthController.getServerInfo);
```

**Create the controller method**:

```typescript
// Add to src/controllers/healthController.ts
getServerInfo: (_req: Request, res: Response): void => {
  const response: ApiResponse = {
    success: true,
    message: 'Server information',
    data: {
      name: 'Express Learning API',
      version: '1.0.0',
      author: 'Your Name',
      description: 'Learning Express.js with TypeScript',
      nodeVersion: process.version,
      uptime: `${Math.floor(process.uptime())} seconds`,
    },
    timestamp: new Date().toISOString(),
  };
  res.status(200).json(response);
},
```

**Test**: `curl http://localhost:3000/api/v1/health/info`

### Exercise 2: Route Parameters

**Goal**: Learn URL parameters and query strings

**Task**: Create a greeting route with parameters

```typescript
// Add to src/routes/users.ts
router.get('/greet/:name', userController.greetUser);
```

**Controller**:

```typescript
greetUser: (req: Request, res: Response): void => {
  const { name } = req.params;
  const { formal } = req.query; // ?formal=true

  const greeting = formal === 'true'
    ? `Good day, ${name}`
    : `Hey ${name}!`;

  const response: ApiResponse = {
    success: true,
    message: 'Greeting generated',
    data: { greeting, name, formal: formal === 'true' },
    timestamp: new Date().toISOString(),
  };
  res.json(response);
},
```

**Test**:

- `curl http://localhost:3000/api/v1/users/greet/John`
- `curl http://localhost:3000/api/v1/users/greet/John?formal=true`

### Exercise 3: Request Body Handling

**Goal**: Handle POST requests with data

**Task**: Create a calculator endpoint

```typescript
// Add new file: src/routes/calculator.ts
import { Router } from 'express';

const router = Router();

router.post('/add', (req: Request, res: Response) => {
	const { a, b } = req.body;

	if (typeof a !== 'number' || typeof b !== 'number') {
		return res.status(400).json({
			success: false,
			message: 'Both a and b must be numbers',
			timestamp: new Date().toISOString(),
		});
	}

	const result = a + b;
	res.json({
		success: true,
		message: 'Addition completed',
		data: { a, b, result, operation: 'add' },
		timestamp: new Date().toISOString(),
	});
});

export { router as calculatorRoutes };
```

**Add to main routes**:

```typescript
// src/routes/index.ts
import { calculatorRoutes } from './calculator';
router.use('/calc', calculatorRoutes);
```

**Test**:

```bash
curl -X POST http://localhost:3000/api/v1/calc/add \
  -H "Content-Type: application/json" \
  -d '{"a": 5, "b": 3}'
```

---

## 🟡 Intermediate Exercises

### Exercise 4: Custom Middleware

**Goal**: Create reusable middleware

**Task**: Create request timing middleware

```typescript
// Create src/middleware/timing.ts
import { Request, Response, NextFunction } from 'express';

export const requestTimer = (req: Request, res: Response, next: NextFunction): void => {
	const startTime = Date.now();

	// Store start time in request object
	(req as any).startTime = startTime;

	// Override res.json to calculate duration
	const originalJson = res.json;
	res.json = function (body) {
		const duration = Date.now() - startTime;
		console.log(`⏱️  ${req.method} ${req.path} - ${duration}ms`);

		// Add duration to response
		if (body && typeof body === 'object') {
			body.requestDuration = `${duration}ms`;
		}

		return originalJson.call(this, body);
	};

	next();
};
```

**Use the middleware**:

```typescript
// src/index.ts
import { requestTimer } from './middleware/timing';
app.use(requestTimer);
```

### Exercise 5: Advanced Validation

**Goal**: Create complex validation schemas

**Task**: Add user profile validation with nested objects

```typescript
// Add to src/utils/validation.ts
export const userSchemas = {
	// ... existing schemas

	createProfile: Joi.object({
		name: Joi.string().min(2).max(50).required(),
		email: Joi.string().email().required(),
		age: Joi.number().min(13).max(120).required(),
		address: Joi.object({
			street: Joi.string().min(5).max(100).required(),
			city: Joi.string().min(2).max(50).required(),
			country: Joi.string().min(2).max(50).required(),
			zipCode: Joi.string()
				.pattern(/^[0-9]{5}(-[0-9]{4})?$/)
				.required(),
		}).required(),
		preferences: Joi.object({
			newsletter: Joi.boolean().default(false),
			notifications: Joi.boolean().default(true),
			theme: Joi.string().valid('light', 'dark').default('light'),
		}).optional(),
		hobbies: Joi.array().items(Joi.string().min(2).max(30)).max(10).optional(),
	}),
};
```

**Create profile route**:

```typescript
// Add to src/routes/users.ts
router.post('/profile', validate(userSchemas.createProfile), userController.createProfile);
```

**Controller**:

```typescript
createProfile: (req: Request, res: Response): void => {
  const profileData = req.body;

  // In a real app, save to database
  const profile = {
    id: Date.now(),
    ...profileData,
    createdAt: new Date().toISOString(),
  };

  const response: ApiResponse = {
    success: true,
    message: 'Profile created successfully',
    data: profile,
    timestamp: new Date().toISOString(),
  };
  res.status(201).json(response);
},
```

### Exercise 6: Error Handling Practice

**Goal**: Create custom error scenarios

**Task**: Add user age verification with custom errors

```typescript
// Add to src/middleware/errorHandler.ts
export class ValidationError extends AppError {
	constructor(message: string, field: string) {
		super(`Validation failed for ${field}: ${message}`, 400);
		this.name = 'ValidationError';
	}
}

export class NotFoundError extends AppError {
	constructor(resource: string, id: string | number) {
		super(`${resource} with ID ${id} not found`, 404);
		this.name = 'NotFoundError';
	}
}
```

**Use in controller**:

```typescript
verifyUserAge: (req: Request, res: Response, next: NextFunction): void => {
  const { age } = req.body;

  if (age < 13) {
    return next(new ValidationError('Users must be at least 13 years old', 'age'));
  }

  if (age > 120) {
    return next(new ValidationError('Please enter a valid age', 'age'));
  }

  // Continue processing
  next();
},
```

---

## 🔴 Advanced Exercises

### Exercise 7: Middleware Composition

**Goal**: Combine multiple middleware functions

**Task**: Create an authentication simulation middleware

```typescript
// Create src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

interface AuthenticatedRequest extends Request {
	user?: {
		id: number;
		email: string;
		role: string;
	};
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return next(new AppError('Authentication token required', 401));
	}

	const token = authHeader.substring(7); // Remove 'Bearer '

	// Simulate token validation (in real app, verify JWT)
	if (token === 'valid-token') {
		req.user = {
			id: 1,
			email: 'user@example.com',
			role: 'user',
		};
		next();
	} else if (token === 'admin-token') {
		req.user = {
			id: 2,
			email: 'admin@example.com',
			role: 'admin',
		};
		next();
	} else {
		next(new AppError('Invalid authentication token', 401));
	}
};

export const authorize = (roles: string[]) => {
	return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
		if (!req.user) {
			return next(new AppError('Authentication required', 401));
		}

		if (!roles.includes(req.user.role)) {
			return next(new AppError('Insufficient permissions', 403));
		}

		next();
	};
};
```

**Use in routes**:

```typescript
// Protected routes
router.get('/profile', authenticate, userController.getProfile);
router.delete('/:id', authenticate, authorize(['admin']), userController.deleteUser);
```

### Exercise 8: Service Layer Pattern

**Goal**: Separate business logic from controllers

**Task**: Create a user service

```typescript
// Create src/services/userService.ts
interface User {
	id: number;
	name: string;
	email: string;
	createdAt: string;
}

class UserService {
	private users: User[] = [
		{ id: 1, name: 'John Doe', email: 'john@example.com', createdAt: new Date().toISOString() },
		{ id: 2, name: 'Jane Smith', email: 'jane@example.com', createdAt: new Date().toISOString() },
	];

	async getAllUsers(): Promise<User[]> {
		// Simulate async operation
		return new Promise((resolve) => {
			setTimeout(() => resolve([...this.users]), 100);
		});
	}

	async getUserById(id: number): Promise<User | null> {
		return new Promise((resolve) => {
			setTimeout(() => {
				const user = this.users.find((u) => u.id === id) || null;
				resolve(user);
			}, 100);
		});
	}

	async createUser(userData: { name: string; email: string }): Promise<User> {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				// Check if email exists
				if (this.users.some((u) => u.email === userData.email)) {
					reject(new Error('Email already exists'));
					return;
				}

				const newUser: User = {
					id: Math.max(...this.users.map((u) => u.id), 0) + 1,
					...userData,
					createdAt: new Date().toISOString(),
				};

				this.users.push(newUser);
				resolve(newUser);
			}, 100);
		});
	}

	async updateUser(id: number, updates: Partial<{ name: string; email: string }>): Promise<User | null> {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				const userIndex = this.users.findIndex((u) => u.id === id);

				if (userIndex === -1) {
					resolve(null);
					return;
				}

				// Check email uniqueness if email is being updated
				if (updates.email && this.users.some((u) => u.email === updates.email && u.id !== id)) {
					reject(new Error('Email already exists'));
					return;
				}

				this.users[userIndex] = { ...this.users[userIndex], ...updates };
				resolve(this.users[userIndex]);
			}, 100);
		});
	}

	async deleteUser(id: number): Promise<User | null> {
		return new Promise((resolve) => {
			setTimeout(() => {
				const userIndex = this.users.findIndex((u) => u.id === id);

				if (userIndex === -1) {
					resolve(null);
					return;
				}

				const deletedUser = this.users.splice(userIndex, 1)[0];
				resolve(deletedUser);
			}, 100);
		});
	}
}

export const userService = new UserService();
```

**Update controller to use service**:

```typescript
// Update src/controllers/userController.ts
import { userService } from '../services/userService';

export const userController = {
	getAllUsers: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const users = await userService.getAllUsers();

			const response: ApiResponse<User[]> = {
				success: true,
				message: 'Users retrieved successfully',
				data: users,
				timestamp: new Date().toISOString(),
			};
			res.status(200).json(response);
		} catch (error) {
			next(error);
		}
	},

	createUser: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const { name, email } = req.body;
			const newUser = await userService.createUser({ name, email });

			const response: ApiResponse<User> = {
				success: true,
				message: 'User created successfully',
				data: newUser,
				timestamp: new Date().toISOString(),
			};
			res.status(201).json(response);
		} catch (error) {
			if (error instanceof Error && error.message === 'Email already exists') {
				return next(new AppError('User with this email already exists', 409));
			}
			next(error);
		}
	},

	// ... update other methods similarly
};
```

### Exercise 9: Configuration Enhancement

**Goal**: Advanced configuration management

**Task**: Create environment-specific configurations

```typescript
// Update src/config/index.ts
interface DatabaseConfig {
	url: string;
	name: string;
	options: {
		useNewUrlParser: boolean;
		useUnifiedTopology: boolean;
	};
}

interface AppConfig {
	port: number;
	nodeEnv: string;
	apiPrefix: string;
	cors: {
		origin: string[] | boolean;
		credentials: boolean;
	};
	database: DatabaseConfig;
	jwt: {
		secret: string;
		expiresIn: string;
	};
	rateLimit: {
		windowMs: number;
		max: number;
	};
}

const developmentConfig: AppConfig = {
	port: parseInt(process.env.PORT || '3000'),
	nodeEnv: 'development',
	apiPrefix: process.env.API_PREFIX || '/api/v1',
	cors: {
		origin: true, // Allow all origins in development
		credentials: true,
	},
	database: {
		url: process.env.DATABASE_URL || 'mongodb://localhost:27017',
		name: process.env.DATABASE_NAME || 'express_dev',
		options: {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		},
	},
	jwt: {
		secret: process.env.JWT_SECRET || 'dev-secret-key',
		expiresIn: process.env.JWT_EXPIRES_IN || '24h',
	},
	rateLimit: {
		windowMs: 15 * 60 * 1000, // 15 minutes
		max: 1000, // More requests in development
	},
};

const productionConfig: AppConfig = {
	...developmentConfig,
	nodeEnv: 'production',
	cors: {
		origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
		credentials: true,
	},
	rateLimit: {
		windowMs: 15 * 60 * 1000, // 15 minutes
		max: 100, // Stricter in production
	},
};

export const config = process.env.NODE_ENV === 'production' ? productionConfig : developmentConfig;

export const isDevelopment = config.nodeEnv === 'development';
export const isProduction = config.nodeEnv === 'production';
```

## 🗄️ Database Exercises

### Exercise 10: Explore Your Database

**Goal**: Understand your database structure and data

**Task**: Use Prisma Studio to explore your database

```bash
# Open visual database browser
npx prisma studio
```

**What to explore**:

1. **Tables**: See the `users` table structure
2. **Records**: View your seeded data
3. **Relationships**: Understanding foreign keys (when you add them)
4. **Constraints**: See the unique email constraint

### Exercise 11: Custom Database Queries

**Goal**: Practice advanced Prisma queries

**Task**: Add advanced user search functionality

```typescript
// Add to src/services/userService.ts
async searchUsers(query: string): Promise<User[]> {
  return await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } }
      ]
    },
    orderBy: { createdAt: 'desc' }
  });
}

async getUsersPaginated(page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.user.count()
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}
```

**Add routes**:

```typescript
// Add to src/routes/users.ts
router.get('/search', userController.searchUsers);
router.get('/paginated', userController.getUsersPaginated);
```

**Test**:

```bash
curl "http://localhost:3000/api/v1/users/search?q=alice"
curl "http://localhost:3000/api/v1/users/paginated?page=1&limit=2"
```

### Exercise 12: Database Schema Evolution

**Goal**: Learn how to modify database schema safely

**Task**: Add a profile table with user relationships

```prisma
// Add to prisma/schema.prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  profile   Profile? // One-to-one relationship

  @@map("users")
}

model Profile {
  id     Int     @id @default(autoincrement())
  bio    String?
  avatar String?
  userId Int     @unique
  user   User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("profiles")
}
```

**Create migration**:

```bash
npx prisma migrate dev --name add_profile_table
```

**Update seeding**:

```typescript
// Update prisma/seed.ts
const userWithProfile = await prisma.user.create({
	data: {
		name: 'Alice Johnson',
		email: 'alice@example.com',
		profile: {
			create: {
				bio: 'Software developer passionate about TypeScript',
				avatar: 'https://example.com/avatar.jpg',
			},
		},
	},
	include: { profile: true },
});
```

### Exercise 13: Database Transactions

**Goal**: Understand database transactions for data consistency

**Task**: Create user with profile in a single transaction

```typescript
// Add to src/services/userService.ts
async createUserWithProfile(
  userData: { name: string; email: string },
  profileData: { bio?: string; avatar?: string }
): Promise<User> {
  return await prisma.$transaction(async (tx) => {
    // Create user first
    const user = await tx.user.create({
      data: userData
    });

    // Create profile
    await tx.profile.create({
      data: {
        ...profileData,
        userId: user.id
      }
    });

    // Return user with profile
    return await tx.user.findUnique({
      where: { id: user.id },
      include: { profile: true }
    });
  });
}
```

### Exercise 14: Database Performance

**Goal**: Learn about database optimization

**Task**: Add database indexes for better performance

```prisma
// Update prisma/schema.prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Add indexes for frequently queried fields
  @@index([createdAt])
  @@index([name])
  @@map("users")
}
```

**Create migration**:

```bash
npx prisma migrate dev --name add_indexes
```

**Test query performance**:

```typescript
// Add to src/services/userService.ts
async getUsersCreatedAfter(date: Date): Promise<User[]> {
  // This query will use the createdAt index
  return await prisma.user.findMany({
    where: {
      createdAt: { gte: date }
    },
    orderBy: { createdAt: 'desc' }
  });
}
```

---

## 🧪 Testing Your Knowledge

### Quiz Questions

**Express.js Questions**:

1. **What's the difference between `app.use()` and `app.get()`?**
2. **Why must error handling middleware have 4 parameters?**
3. **What happens if you don't call `next()` in middleware?**
4. **When should you use `return next(error)` vs `throw error`?**
5. **What's the purpose of the `Router` class?**

**Database Questions**: 6. **What's the difference between a migration and a seed?** 7. **Why use a Service Layer instead of calling Prisma directly in controllers?** 8. **What happens if you don't use `await` with Prisma operations?** 9. **When should you use database transactions?** 10. **What's the benefit of using an ORM like Prisma vs raw SQL?**

### Code Review Exercise

Find the issues in this code:

```typescript
// ❌ This code has several problems
app.get('/users/:id', (req, res) => {
	const id = req.params.id; // Issue 1: No type validation
	const user = users.find((u) => u.id === id); // Issue 2: Type mismatch

	if (!user) {
		throw new Error('User not found'); // Issue 3: Wrong error handling
	}

	res.json(user); // Issue 4: Inconsistent response format
});

app.use(errorHandler); // Issue 5: Wrong placement
app.use('/api', routes);
```

### Answers:

**Express.js Answers**:

1. `app.use()` applies to all HTTP methods, `app.get()` only to GET requests
2. Express identifies error middleware by the 4-parameter signature
3. Request hangs - response never sent
4. Use `return next(error)` in Express routes, `throw` in async functions with try/catch
5. Creates modular, mountable route handlers

**Database Answers**: 6. Migrations change schema structure, seeds add sample data 7. Service layer provides reusable business logic and keeps controllers thin 8. You get a Promise instead of the actual data, causing runtime errors 9. When multiple operations must succeed or fail together (data consistency) 10. Type safety, auto-completion, migration handling, less SQL knowledge required

**Code Issues:**

1. Should validate `id` is a number
2. `req.params.id` is string, `u.id` is number
3. Should use `next(new AppError(...))`
4. Should use consistent `ApiResponse` format
5. Error handler must be after routes

---

## 🚀 Real-World Project Ideas

### Beginner Projects

1. **Todo API**: CRUD operations for tasks
2. **Weather API**: Proxy to external weather service
3. **Book Library**: Manage books and authors
4. **Recipe API**: Store and search recipes

### Intermediate Projects

1. **Blog API**: Posts, comments, categories
2. **E-commerce API**: Products, cart, orders
3. **Social Media API**: Users, posts, followers
4. **Task Management**: Teams, projects, assignments

### Advanced Projects

1. **Microservices**: Multiple interconnected APIs
2. **Real-time Chat**: WebSockets + Express
3. **File Upload Service**: Multi-part form handling
4. **Analytics API**: Data aggregation and reporting

---

## 📚 Additional Resources

### Documentation

- [Express.js Guide](https://expressjs.com/en/guide/)
- [Joi Validation](https://joi.dev/api/)
- [Morgan Logging](https://github.com/expressjs/morgan)

### Advanced Topics

- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Performance](https://nodejs.org/en/docs/guides/simple-profiling/)
- [Testing Express Apps](https://www.albertgao.xyz/2017/05/24/how-to-test-expressjs-with-jest-and-supertest/)

### Keep Learning!

- Try MongoDB integration
- Add JWT authentication
- Implement rate limiting
- Deploy to cloud platforms
- Write comprehensive tests

Happy coding! 🎉
