import { Router } from 'express';
import { healthController } from '../controllers/healthController';

const router = Router();

// GET /health - Basic health check
router.get('/', healthController.getHealth);

// GET /health/detailed - Detailed health information
router.get('/detailed', healthController.getDetailedHealth);

export { router as healthRoutes };
