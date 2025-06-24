import express from 'express';
import { authenticate, isAdmin } from '../lib/auth.js';
import supabase from '../lib/supabase.js';
import { getArticlesFromAllSubCategories, launchBrowser } from '../services/articleService.js';
import { getArticlesByCategory } from '../services/articleService.js';
import { categorySlugMap } from '../utils/categoryUtils.js';
console.log('Initializing articles router...');
const router = express.Router();
// Log all incoming requests to articles routes
router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] Articles route accessed: ${req.method} ${req.path}`);
    next();
});
// Lấy danh sách bài viết
router.get('/', async (req, res) => {
    try {
        console.log('Received request to /api/v1/articles with query:', req.query);
        const { page = '1', limit = '10', category } = req.query;
        console.log('Parsed query params:', { page, limit, category });
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        const offset = (pageNum - 1) * limitNum;
        let query = supabase
            .from('articles')
            .select('*', { count: 'exact' })
            .order('published_at', { ascending: false });
        if (category) {
            query = query.eq('category', category);
        }
        const { data: articles, error, count } = await query.range(offset, offset + limitNum - 1);
        if (error)
            throw error;
        const total = count || 0;
        const totalPages = Math.ceil(total / limitNum);
        // Send response with articles and pagination info
        res.json({
            success: true,
            data: articles || [],
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                total_pages: totalPages
            }
        });
    }
    catch (error) {
        console.error('Lỗi khi lấy danh sách bài viết:', error);
        res.status(500).json({
            success: false,
            error: 'Không thể lấy danh sách bài viết',
            message: error instanceof Error ? error.message : 'Lỗi không xác định'
        });
    }
});
// Danh sách các nguồn tin được hỗ trợ
const SUPPORTED_SOURCES = ['tuoitre', 'vnexpress'];
// Lấy bài viết từ tất cả các danh mục con
router.get('/all-categories', async (req, res) => {
    try {
        console.log('Bắt đầu lấy bài viết từ tất cả danh mục con...');
        const articles = await getArticlesFromAllSubCategories();
        res.json({
            success: true,
            data: articles,
            message: `Đã lấy thành công ${articles.length} bài viết từ tất cả danh mục con`
        });
    }
    catch (error) {
        console.error('Lỗi khi lấy bài viết từ tất cả danh mục con:', error);
        res.status(500).json({
            success: false,
            error: 'Đã xảy ra lỗi khi lấy bài viết từ tất cả danh mục con',
            message: error instanceof Error ? error.message : 'Lỗi không xác định'
        });
    }
});
// Lấy danh sách bài viết từ nguồn bên ngoài
router.get('/scrape/:source', async (req, res) => {
    let browser = null;
    let page = null;
    const { source } = req.params;
    const { category = 'tin-moi', page: pageParam = '1', limit: limitParam = '10' } = req.query;
    const pageNum = parseInt(pageParam, 10) || 1;
    const limit = parseInt(limitParam, 10) || 10;
    // Validate source
    if (!SUPPORTED_SOURCES.includes(source)) {
        return res.status(400).json({
            success: false,
            error: `Nguồn không được hỗ trợ. Các nguồn được hỗ trợ: ${SUPPORTED_SOURCES.join(', ')}`
        });
    }
    // For Tuổi Trẻ, use the category as the slug
    const categorySlug = source === 'tuoitre' ? category : `${source}-${category}`;
    try {
        const { source } = req.params;
        const { limit = '10', retry = '3' } = req.query;
        const maxRetries = Math.min(parseInt(retry, 10) || 3, 5); // Max 5 retries
        let lastError = null;
        // Validate category slug for Tuổi Trẻ
        if (source === 'tuoitre') {
            const validCategories = ['tin-moi', 'thoi-su', 'the-gioi', 'kinh-doanh', 'giai-tri',
                'the-thao', 'phap-luat', 'giao-duc', 'suc-khoe', 'doi-song',
                'du-lich', 'khoa-hoc', 'so-hoa', 'xe', 'y-kien', 'tam-su', 'cuoi', 'ban-doc'];
            if (!validCategories.includes(category)) {
                return res.status(400).json({
                    success: false,
                    error: `Danh mục không hợp lệ cho Tuổi Trẻ. Các danh mục hợp lệ: ${validCategories.join(', ')}`
                });
            }
        }
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                console.log(`Lấy bài viết (lần thử ${attempt + 1}/${maxRetries})...`);
                // Khởi tạo trình duyệt nếu chưa có
                if (!browser) {
                    browser = await launchBrowser();
                    if (!browser) {
                        throw new Error('Không thể khởi tạo trình duyệt');
                    }
                }
                // Gọi hàm lấy bài viết từ service
                const { articles, hasMore } = await getArticlesByCategory(categorySlug, Number(limit), Number(pageNum));
                return res.json({
                    success: true,
                    data: articles,
                    pagination: {
                        page: pageNum,
                        limit: Number(limit),
                        total: articles.length,
                        total_pages: hasMore ? Number(pageNum) + 1 : Number(pageNum)
                    }
                });
            }
            catch (error) {
                lastError = error;
                console.error(`Lỗi khi lấy bài viết (${maxRetries - attempt - 1} retries left):`, error);
                // Don't close the browser here, let getArticlesByCategory handle it
                browser = null;
                if (attempt >= maxRetries - 1) {
                    throw error;
                }
                // Wait before retrying with exponential backoff
                const delay = 1000 * Math.pow(2, attempt);
                console.log(`Chờ ${delay}ms trước khi thử lại...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        // Nếu đến đây tức là đã thử lại đủ số lần mà vẫn lỗi
        throw lastError || new Error('Không thể lấy bài viết');
    }
    catch (error) {
        console.error('Lỗi khi lấy bài viết:', error);
        const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
        const statusCode = errorMessage.includes('không tồn tại') ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: 'Có lỗi xảy ra khi lấy bài viết',
            error: errorMessage,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
// Lấy bài viết theo danh mục
router.get('/category/:categorySlug', async (req, res) => {
    try {
        const { categorySlug } = req.params;
        const { limit = 10, page = 1 } = req.query;
        const pageNum = Math.max(1, Number(page));
        if (!categorySlug) {
            return res.status(400).json({
                success: false,
                error: 'Yêu cầu mã danh mục'
            });
        }
        // Kiểm tra danh mục tồn tại
        if (!Object.keys(categorySlugMap).includes(categorySlug)) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy danh mục'
            });
        }
        const browser = await launchBrowser();
        try {
            const { articles, hasMore } = await getArticlesByCategory(categorySlug, Number(limit), Number(page));
            // Không cần cache ở đây vì đã xử lý trong service
            res.json({
                success: true,
                data: articles,
                pagination: {
                    page: pageNum,
                    limit: Number(limit),
                    total: articles.length,
                    total_pages: hasMore ? pageNum + 1 : pageNum
                }
            });
        }
        finally {
            if (browser) {
                await browser.close().catch(console.error);
            }
        }
    }
    catch (error) {
        console.error('Lỗi khi lấy bài viết theo danh mục:', error);
        res.status(500).json({
            success: false,
            error: 'Không thể tải bài viết theo danh mục'
        });
    }
});
// Lấy chi tiết bài viết
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data: article, error } = await supabase
            .from('articles')
            .select('*')
            .eq('id', id)
            .single();
        if (error)
            throw error;
        if (!article) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy bài viết',
                message: 'Không tìm thấy bài viết với ID đã cung cấp'
            });
        }
        res.json({
            success: true,
            data: article
        });
    }
    catch (error) {
        console.error('Lỗi khi lấy chi tiết bài viết:', error);
        res.status(500).json({
            success: false,
            error: 'Không thể lấy chi tiết bài viết',
            message: error instanceof Error ? error.message : 'Lỗi không xác định'
        });
    }
});
// Tạo bài viết mới (chỉ admin)
router.post('/', authenticate, isAdmin, async (req, res) => {
    try {
        const articleData = req.body;
        // Kiểm tra các trường bắt buộc
        if (!articleData.title || !articleData.content) {
            return res.status(400).json({
                success: false,
                error: 'Tiêu đề và nội dung là bắt buộc'
            });
        }
        // Thêm vào cơ sở dữ liệu
        const { data: article, error } = await supabase
            .from('articles')
            .insert([{
                ...articleData,
                author_id: req.user?.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }])
            .select()
            .single();
        if (error)
            throw error;
        res.status(201).json({
            success: true,
            data: article
        });
    }
    catch (error) {
        console.error('Lỗi khi tạo bài viết:', error);
        res.status(500).json({
            success: false,
            error: 'Không thể tạo bài viết'
        });
    }
});
// Cập nhật bài viết (chỉ admin)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const articleData = req.body;
        // Kiểm tra bài viết tồn tại
        const { data: existingArticle, error: fetchError } = await supabase
            .from('articles')
            .select('id')
            .eq('id', id)
            .single();
        if (fetchError || !existingArticle) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy bài viết'
            });
        }
        // Cập nhật bài viết
        const { data: article, error } = await supabase
            .from('articles')
            .update({
            ...articleData,
            updated_at: new Date().toISOString()
        })
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw error;
        res.json({
            success: true,
            data: article
        });
    }
    catch (error) {
        console.error('Lỗi khi cập nhật bài viết:', error);
        res.status(500).json({
            success: false,
            error: 'Không thể cập nhật bài viết'
        });
    }
});
// Xóa bài viết (chỉ admin)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        // Xóa khỏi cơ sở dữ liệu
        const { error } = await supabase
            .from('articles')
            .delete()
            .eq('id', id);
        if (error)
            throw error;
        res.json({
            success: true,
            data: null
        });
    }
    catch (error) {
        console.error('Lỗi khi xóa bài viết:', error);
        res.status(500).json({
            success: false,
            error: 'Lỗi khi xóa bài viết'
        });
    }
});
export default router;
