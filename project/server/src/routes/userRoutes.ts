import { Router, Request, Response } from 'express';
import { 
  getUsers, 
  createUser, 
  getUserById, 
  updateUser, 
  deleteUser 
} from '../controllers/userController.js';
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
router.post('/', createUser); // Register new user

// Protected routes (require authentication)
router.use(authenticateToken);

// Get current user profile
router.get('/me', (req: Request, res: Response) => {
  // req.user is added by authenticateToken middleware
  res.json(req.user);
});

// User management routes
router.get('/', authorizeRole(['admin']), getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', authorizeRole(['admin']), deleteUser);

export default router;
