import { Router } from 'express';
import { checkHealth } from '../controllers/systemController.js';

const router = Router();

router.get('/health', checkHealth);

export default router;
