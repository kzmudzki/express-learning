import { userService } from '../../src/services/userService';
import { prisma } from '../setup';

describe('UserService', () => {
  const testUser = {
    name: 'John Doe',
    email: 'john.doe@example.com'
  };

  describe('createUser', () => {
    it('should create a new user', async () => {
      const user = await userService.createUser(testUser);

      expect(user).toMatchObject({
        id: expect.any(Number),
        name: testUser.name,
        email: testUser.email,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      await prisma.user.create({ data: testUser });
      
      const users = await userService.getAllUsers();
      
      expect(users).toHaveLength(1);
      expect(users[0]).toMatchObject({
        name: testUser.name,
        email: testUser.email
      });
    });

    it('should return empty array when no users exist', async () => {
      const users = await userService.getAllUsers();
      expect(users).toHaveLength(0);
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const createdUser = await prisma.user.create({ data: testUser });
      
      const user = await userService.getUserById(createdUser.id);
      
      expect(user).toMatchObject({
        id: createdUser.id,
        name: testUser.name,
        email: testUser.email
      });
    });

    it('should return null for non-existent user', async () => {
      const user = await userService.getUserById(99999);
      expect(user).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user', async () => {
      const createdUser = await prisma.user.create({ data: testUser });
      const updateData = { name: 'Jane Doe' };
      
      const updatedUser = await userService.updateUser(createdUser.id, updateData);
      
      expect(updatedUser).toMatchObject({
        id: createdUser.id,
        name: updateData.name,
        email: testUser.email
      });
    });

    it('should return null for non-existent user', async () => {
      const user = await userService.updateUser(99999, { name: 'New Name' });
      expect(user).toBeNull();
    });
  });

  describe('deleteUser', () => {
    it('should delete user', async () => {
      const createdUser = await prisma.user.create({ data: testUser });
      
      const deletedUser = await userService.deleteUser(createdUser.id);
      
      expect(deletedUser).toMatchObject({
        id: createdUser.id,
        name: testUser.name,
        email: testUser.email
      });

      // Verify deletion
      const user = await prisma.user.findUnique({
        where: { id: createdUser.id }
      });
      expect(user).toBeNull();
    });

    it('should return null for non-existent user', async () => {
      const user = await userService.deleteUser(99999);
      expect(user).toBeNull();
    });
  });

  describe('emailExists', () => {
    it('should return true if email exists', async () => {
      await prisma.user.create({ data: testUser });
      
      const exists = await userService.emailExists(testUser.email);
      expect(exists).toBe(true);
    });

    it('should return false if email does not exist', async () => {
      const exists = await userService.emailExists('nonexistent@example.com');
      expect(exists).toBe(false);
    });

    it('should exclude specified user ID when checking', async () => {
      const createdUser = await prisma.user.create({ data: testUser });
      
      const exists = await userService.emailExists(testUser.email, createdUser.id);
      expect(exists).toBe(false);
    });
  });
});
