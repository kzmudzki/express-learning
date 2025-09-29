import { PrismaClient } from '@prisma/client';

// Test database setup
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./test.db'
    }
  }
});

beforeAll(async () => {
  // Setup test database
  await prisma.$connect();
});

afterAll(async () => {
  // Cleanup test database
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean up database before each test
  await prisma.user.deleteMany({});
});

export { prisma };
