import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	console.log('🌱 Starting database seeding...');

	// Clear existing data
	await prisma.user.deleteMany();
	console.log('📝 Cleared existing users');

	// Create sample users
	const users = await Promise.all([
		prisma.user.create({
			data: {
				name: 'Alice Johnson',
				email: 'alice@example.com',
			},
		}),
		prisma.user.create({
			data: {
				name: 'Bob Wilson',
				email: 'bob@example.com',
			},
		}),
		prisma.user.create({
			data: {
				name: 'Charlie Brown',
				email: 'charlie@example.com',
			},
		}),
	]);

	console.log(`✅ Created ${users.length} users:`);
	users.forEach((user) => {
		console.log(`  - ${user.name} (${user.email})`);
	});

	console.log('🎉 Database seeding completed!');
}

main()
	.catch((e) => {
		console.error('❌ Error during seeding:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
