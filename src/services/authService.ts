import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient, UserRole } from '@prisma/client';
import { CONFIG } from '../config';
import { AppError } from '../middleware/errorHandler';
import { JwtPayload, AuthenticatedUser, LoginRequest, RegisterRequest, AuthResponse } from '../types/auth';

const prisma = new PrismaClient();

export const authService = {
	async hashPassword(password: string): Promise<string> {
		const saltRounds = 12;
		return bcrypt.hash(password, saltRounds);
	},

	async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
		return bcrypt.compare(password, hashedPassword);
	},

	generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
		return jwt.sign(payload as any, CONFIG.JWT_SECRET, {
			expiresIn: CONFIG.JWT_EXPIRES_IN,
		} as jwt.SignOptions);
	},

	verifyToken(token: string): JwtPayload {
		try {
			return jwt.verify(token, CONFIG.JWT_SECRET) as JwtPayload;
		} catch (error) {
			throw new AppError('Invalid or expired token', 401);
		}
	},

	async register(userData: RegisterRequest): Promise<AuthResponse> {
		const { name, email, password } = userData;

		// Check if user already exists
		const existingUser = await prisma.user.findUnique({
			where: { email },
		});

		if (existingUser) {
			throw new AppError('User with this email already exists', 409);
		}

		// Hash password
		const hashedPassword = await this.hashPassword(password);

		// Create user
		const user = await prisma.user.create({
			data: {
				name,
				email,
				password: hashedPassword,
				role: UserRole.USER,
			},
		});

		// Generate token
		const token = this.generateToken({
			userId: user.id,
			email: user.email,
			role: user.role,
		});

		// Return response without password
		const { password: _, ...userWithoutPassword } = user;

		return {
			user: userWithoutPassword,
			token,
			expiresIn: CONFIG.JWT_EXPIRES_IN,
		};
	},

	async login(credentials: LoginRequest): Promise<AuthResponse> {
		const { email, password } = credentials;

		// Find user with password
		const user = await prisma.user.findUnique({
			where: { email },
		});

		if (!user || !user.password) {
			throw new AppError('Invalid credentials', 401);
		}

		if (!user.isActive) {
			throw new AppError('Account is deactivated', 401);
		}

		// Verify password
		const isPasswordValid = await this.comparePassword(password, user.password);
		if (!isPasswordValid) {
			throw new AppError('Invalid credentials', 401);
		}

		// Generate token
		const token = this.generateToken({
			userId: user.id,
			email: user.email,
			role: user.role,
		});

		// Return response without password
		const { password: _, ...userWithoutPassword } = user;

		return {
			user: userWithoutPassword,
			token,
			expiresIn: CONFIG.JWT_EXPIRES_IN,
		};
	},

	async getUserById(id: number): Promise<AuthenticatedUser | null> {
		const user = await prisma.user.findUnique({
			where: { id, isActive: true },
		});

		if (!user) {
			return null;
		}

		// Return user without password
		const { password: _, ...userWithoutPassword } = user;
		return userWithoutPassword as AuthenticatedUser;
	},

	async updateUserRole(userId: number, role: UserRole): Promise<AuthenticatedUser | null> {
		const user = await prisma.user.update({
			where: { id: userId },
			data: { role },
		});

		const { password: _, ...userWithoutPassword } = user;
		return userWithoutPassword as AuthenticatedUser;
	},

	async deactivateUser(userId: number): Promise<void> {
		await prisma.user.update({
			where: { id: userId },
			data: { isActive: false },
		});
	},
};
