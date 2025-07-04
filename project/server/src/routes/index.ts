import { Router } from 'express';
import articlesRouter from './articles.js';
import authRouter from './auth.js';
import categoriesRouter from './categoryRoutes.js';
import usersRouter from './userRoutes.js';
import searchRouter from './search.js';
import systemRouter from './system.js';
import { apiKeyAuth } from '../middleware/apiKeyAuth.js';

console.log('Setting up API routes...');
const router = Router();

// API v1 routes
const v1Router = Router();

// Health check endpoint - No API key required
v1Router.get('/health', (req, res) => {
  console.log('Health check endpoint called');
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Mount public routes first (no API key required)
v1Router.use('/auth', authRouter);

// Add API key authentication middleware for protected routes
v1Router.use(apiKeyAuth);

// Mount protected routes (require API key)
v1Router.use('/articles', articlesRouter);
v1Router.use('/categories', categoriesRouter);
v1Router.use('/users', usersRouter);
v1Router.use('/search', searchRouter);
v1Router.use('/system', systemRouter);

// Mount v1 router under /api/v1
router.use('/api/v1', v1Router);

// Log all routes
console.log('Registered routes:');
console.log('  GET /api/v1/health');
console.log('  GET /api/v1/articles');
console.log('  GET /api/v1/categories');
console.log('  GET /api/v1/users');
console.log('  GET /api/v1/system/health');
console.log('  ... and other routes');

export default router;
