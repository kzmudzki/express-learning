import { Router } from 'express';
import { healthController } from '../controllers/healthController';
import { cacheMiddleware } from '../middleware/performance';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Basic health check
 *     description: Returns basic service health status
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Service is healthy"
 *               data:
 *                 status: "OK"
 *                 timestamp: "2023-12-01T10:00:00.000Z"
 *                 uptime: 3600
 *                 environment: "development"
 *               timestamp: "2023-12-01T10:00:00.000Z"
 */
router.get('/', cacheMiddleware(30), healthController.getHealth); // Cache for 30 seconds

/**
 * @swagger
 * /health/detailed:
 *   get:
 *     summary: Detailed health check
 *     description: Returns comprehensive service health information including database, memory, and CPU status
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Service is healthy with detailed information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       503:
 *         description: Service is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/detailed', healthController.getDetailedHealth);

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness probe
 *     description: Kubernetes-style readiness check to determine if service is ready to accept traffic
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Service is ready
 *       503:
 *         description: Service is not ready
 */
router.get('/ready', healthController.getReadiness);

/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Liveness probe
 *     description: Kubernetes-style liveness check to determine if service is alive
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Service is alive
 */
router.get('/live', healthController.getLiveness);

// Alternative endpoints for different monitoring tools
router.get('/status', healthController.getDetailedHealth);
router.get('/ping', healthController.getLiveness);

export { router as healthRoutes };
