import request from 'supertest';
import { createTestApp } from '../helpers/testApp';

const app = createTestApp();

describe('Health Endpoints', () => {
  describe('GET /api/v1/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Service is healthy',
        data: {
          status: 'OK',
        }
      });
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.data.timestamp).toBeDefined();
    });
  });

  describe('GET /api/v1/health/detailed', () => {
    it('should return detailed health information', async () => {
      const response = await request(app)
        .get('/api/v1/health/detailed')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Detailed service health information',
        data: {
          status: 'OK',
          environment: expect.any(String),
          nodeVersion: expect.any(String),
          platform: expect.any(String),
          arch: expect.any(String),
          pid: expect.any(Number),
        }
      });
      expect(response.body.data.uptime).toBeGreaterThan(0);
      expect(response.body.data.memory).toBeDefined();
    });
  });
});
