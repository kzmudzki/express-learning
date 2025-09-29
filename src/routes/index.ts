import { Router } from 'express';
import { healthRoutes } from './health';
import { userRoutes } from './users';
import { authRoutes } from './auth';

const router = Router();

// Mount route modules
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

export { router as apiRoutes };
