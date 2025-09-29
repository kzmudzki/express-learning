import request from 'supertest';
import { createTestApp } from '../helpers/testApp';
import { prisma } from '../setup';

const app = createTestApp();

describe('User Endpoints', () => {
  const testUser = {
    name: 'John Doe',
    email: 'john.doe@example.com'
  };

  describe('POST /api/v1/users', () => {
    it('should create a new user', async () => {
      const response = await request(app)
        .post('/api/v1/users')
        .send(testUser)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: 'User created successfully',
        data: {
          id: expect.any(Number),
          name: testUser.name,
          email: testUser.email,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }
      });
    });

    it('should return 409 for duplicate email', async () => {
      // Create first user
      await request(app)
        .post('/api/v1/users')
        .send(testUser)
        .expect(201);

      // Try to create user with same email
      const response = await request(app)
        .post('/api/v1/users')
        .send(testUser)
        .expect(409);

      expect(response.body).toMatchObject({
        success: false,
        message: 'User with this email already exists',
      });
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/users')
        .send({ name: 'John' }) // Missing email
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/users', () => {
    beforeEach(async () => {
      await prisma.user.create({
        data: testUser
      });
    });

    it('should return all users', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Users retrieved successfully',
        data: expect.arrayContaining([
          expect.objectContaining({
            name: testUser.name,
            email: testUser.email
          })
        ])
      });
    });
  });

  describe('GET /api/v1/users/:id', () => {
    let userId: number;

    beforeEach(async () => {
      const user = await prisma.user.create({
        data: testUser
      });
      userId = user.id;
    });

    it('should return user by id', async () => {
      const response = await request(app)
        .get(`/api/v1/users/${userId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'User retrieved successfully',
        data: {
          id: userId,
          name: testUser.name,
          email: testUser.email
        }
      });
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/v1/users/99999')
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        message: 'User not found',
      });
    });

    it('should return 400 for invalid user id', async () => {
      const response = await request(app)
        .get('/api/v1/users/invalid')
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Invalid user ID',
      });
    });
  });

  describe('PUT /api/v1/users/:id', () => {
    let userId: number;

    beforeEach(async () => {
      const user = await prisma.user.create({
        data: testUser
      });
      userId = user.id;
    });

    it('should update user', async () => {
      const updateData = {
        name: 'Jane Doe',
        email: 'jane.doe@example.com'
      };

      const response = await request(app)
        .put(`/api/v1/users/${userId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'User updated successfully',
        data: {
          id: userId,
          name: updateData.name,
          email: updateData.email
        }
      });
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .put('/api/v1/users/99999')
        .send({ name: 'New Name' })
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        message: 'User not found',
      });
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    let userId: number;

    beforeEach(async () => {
      const user = await prisma.user.create({
        data: testUser
      });
      userId = user.id;
    });

    it('should delete user', async () => {
      const response = await request(app)
        .delete(`/api/v1/users/${userId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'User deleted successfully',
      });

      // Verify user is deleted
      const deletedUser = await prisma.user.findUnique({
        where: { id: userId }
      });
      expect(deletedUser).toBeNull();
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .delete('/api/v1/users/99999')
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        message: 'User not found',
      });
    });
  });
});
