import express from 'express';
import { MAIN_CATEGORIES } from '../constants/categories.js';
import { getCategoryFromSlug } from '../utils/categoryUtils.js';

type CategorySlug = typeof MAIN_CATEGORIES[number];

const router = express.Router();

// Lấy danh sách tất cả danh mục
router.get('/', (req, res) => {
    try {
        const categories = MAIN_CATEGORIES.map((slug: CategorySlug) => ({
            slug,
            name: getCategoryFromSlug(slug) || slug,
            url: `/tin-tuc/${slug}`
        }));
        
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách danh mục:', error);
        res.status(500).json({
            success: false,
            error: 'Không thể lấy danh sách danh mục'
        });
    }
});

export default router;
