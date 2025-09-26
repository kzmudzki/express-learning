import { Router } from 'express';
import { healthRoutes } from './health';
import { userRoutes } from './users';

const router = Router();

// Mount route modules
router.use('/health', healthRoutes);
router.use('/users', userRoutes);

export { router as apiRoutes };
