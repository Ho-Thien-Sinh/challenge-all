import { Router, Request, Response } from 'express';
import { 
  getCategories, 
  createCategory, 
  getCategoryById, 
  updateCategory, 
  deleteCategory 
} from '../controllers/categoryController.js';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware.js';
import { UserPayload } from '../types/auth.js';

// Extend the Express Request type to include our custom user property
declare module 'express-serve-static-core' {
  interface Request {
    user?: UserPayload;
  }
}

const router = Router();

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Protected routes (require authentication)
router.use(authenticateToken);

// Admin-only routes
router.post('/', authorizeRole(['admin']), createCategory);
router.put('/:id', authorizeRole(['admin']), updateCategory);
router.delete('/:id', authorizeRole(['admin']), deleteCategory);

export default router;
