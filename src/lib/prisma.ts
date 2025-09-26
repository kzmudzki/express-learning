import { PrismaClient } from '@prisma/client';

// Create a singleton Prisma client instance
// This ensures we don't create multiple database connections
const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		log: ['query', 'info', 'warn', 'error'], // Log all database operations in development
	});

// In development, save the client to globalThis to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
	await prisma.$disconnect();
});
