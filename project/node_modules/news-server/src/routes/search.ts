import { Router } from 'express';
import { searchArticles } from '../controllers/searchController.js';

const router = Router();

// Search articles
router.get('/', searchArticles);

export default router;
