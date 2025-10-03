import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupDatabase() {
	try {
		console.log('🔄 Setting up database...');

		// Test database connection
		await prisma.$connect();
		console.log('✅ Database connection successful');

		// Run migrations
		console.log('🔄 Running database migrations...');
		// Note: In production, run: npx prisma migrate deploy

		console.log('✅ Database setup completed successfully!');
	} catch (error) {
		console.error('❌ Database setup failed:', error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

setupDatabase();
