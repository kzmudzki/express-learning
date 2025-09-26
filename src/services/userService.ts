import { prisma } from '../lib/prisma';
import { User } from '@prisma/client';

export class UserService {
	// Get all users from database
	async getAllUsers(): Promise<User[]> {
		return await prisma.user.findMany({
			orderBy: {
				createdAt: 'desc', // Most recent first
			},
		});
	}

	// Get user by ID
	async getUserById(id: number): Promise<User | null> {
		return await prisma.user.findUnique({
			where: { id },
		});
	}

	// Create new user
	async createUser(userData: { name: string; email: string }): Promise<User> {
		return await prisma.user.create({
			data: userData,
		});
	}

	// Update user
	async updateUser(id: number, updates: { name?: string; email?: string }): Promise<User | null> {
		// First check if user exists
		const existingUser = await this.getUserById(id);
		if (!existingUser) {
			return null;
		}

		return await prisma.user.update({
			where: { id },
			data: updates,
		});
	}

	// Delete user
	async deleteUser(id: number): Promise<User | null> {
		// First check if user exists
		const existingUser = await this.getUserById(id);
		if (!existingUser) {
			return null;
		}

		return await prisma.user.delete({
			where: { id },
		});
	}

	// Check if email exists (for validation)
	async emailExists(email: string, excludeUserId?: number): Promise<boolean> {
		const user = await prisma.user.findUnique({
			where: { email },
		});

		if (!user) return false;
		if (excludeUserId && user.id === excludeUserId) return false;
		return true;
	}
}

export const userService = new UserService();
