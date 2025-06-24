import { Router } from 'express';
import articlesRouter from './articles.js';
import authRouter from './auth.js';
import categoriesRouter from './categories.js';
import { apiKeyAuth } from '../middleware/apiKeyAuth.js';
console.log('Setting up API routes...');
const router = Router();
// API v1 routes
const v1Router = Router();
// Thêm middleware xác thực API key cho tất cả các routes API
v1Router.use(apiKeyAuth);
// Mount routers under /api/v1
v1Router.use('/articles', articlesRouter);
v1Router.use('/auth', authRouter);
v1Router.use('/categories', categoriesRouter);
// Health check endpoint
v1Router.get('/health', (req, res) => {
    console.log('Health check endpoint called');
    res.status(200).json({ status: 'ok' });
});
// Mount v1 router under /api/v1
router.use('/api/v1', v1Router);
// Log all routes
console.log('Registered routes:');
console.log('  GET /api/v1/health');
console.log('  GET /api/v1/articles');
console.log('  ... and other routes');
export default router;
