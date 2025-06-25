import express, { Request, Response } from 'express';
import { authenticate, isAdmin } from '../lib/auth.js';
import supabase from '../lib/supabase.js';
import { getArticlesFromAllSubCategories, launchBrowser } from '../services/articleService.js';
import { getArticlesByCategory } from '../services/articleService.js';
import { updateArticles } from '../controllers/articleController.js';
import type { Article } from '../types/article.js';
import { categorySlugMap } from '../utils/categoryUtils.js';
import { Browser, Page } from 'puppeteer';

console.log('Initializing articles router...');
const router = express.Router();

// Log all incoming requests to articles routes
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Articles route accessed: ${req.method} ${req.path}`);
  next();
});

/**
 * @swagger
 * /api/v1/articles:
 *   get:
 *     summary: Lấy danh sách bài viết
 *     description: Lấy danh sách bài viết với phân trang và lọc theo danh mục
 *     tags: [Articles]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng bài viết mỗi trang (tối đa 100)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Lọc theo danh mục (tùy chọn)
 *     responses:
 *       200:
 *         description: Danh sách bài viết
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Article'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Lỗi request không hợp lệ
 *       500:
 *         description: Lỗi server
 */
router.get('/', async (req: Request, res: Response<ArticleListResponse | ErrorResponse>) => {
    console.log('\n=== /articles Request ===');
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Query:', JSON.stringify(req.query, null, 2));
    
    try {
        // Extract and validate query parameters
        const { page = '1', limit = '10', category } = req.query as { 
            page?: string; 
            limit?: string; 
            category?: string;
        };
        
        console.log('\n=== Query Parameters ===');
        console.log('Page:', page);
        console.log('Limit:', limit);
        console.log('Category:', category || 'None');
        
        // Validate and parse pagination parameters
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
        const offset = (pageNum - 1) * limitNum;

        console.log('\n=== Database Query ===');
        console.log(`Fetching articles (Page: ${pageNum}, Limit: ${limitNum}, Offset: ${offset})`);
        
        // Build the base query
        let query = supabase
            .from('articles')
            .select('*', { count: 'exact' });

        // Apply category filter if provided
        if (category && typeof category === 'string') {
            console.log(`Applying category filter: ${category}`);
            query = query.eq('category', category);
        }

        // Add ordering and pagination
        query = query
            .order('published_at', { ascending: false })
            .range(offset, offset + limitNum - 1);

        console.log('Executing query...');
        console.time('supabase-query');
        
        // Execute the query
        const { data: articles, error, count } = await query;
        
        console.timeEnd('supabase-query');
        
        if (error) {
            console.error('\n=== Supabase Query Error ===');
            console.error('Error Code:', error.code);
            console.error('Error Message:', error.message);
            console.error('Error Details:', error.details);
            console.error('Error Hint:', error.hint);
            throw error;
        }

        const total = count || 0;
        const totalPages = Math.ceil(total / limitNum);

        console.log('\n=== Query Results ===');
        console.log(`Found ${total} total articles (showing ${articles?.length || 0})`);
        
        if (articles && articles.length > 0) {
            console.log('First article sample:', {
                id: articles[0].id,
                title: articles[0].title,
                category: articles[0].category,
                published_at: articles[0].published_at
            });
        }

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
        
        console.log('\n=== Response Sent ===');
        console.log(`Status: 200 OK (${articles?.length || 0} articles)`);
        
    } catch (error) {
        console.error('\n=== ERROR in /articles ===');
        console.error('Error occurred at:', new Date().toISOString());
        
        if (error instanceof Error) {
            console.error('Error Type:', error.constructor.name);
            console.error('Error Name:', error.name);
            console.error('Error Message:', error.message);
            console.error('Error Stack:', error.stack);
            
            // Check for Supabase errors
            if ('code' in error) {
                console.error('Supabase Error Code:', (error as any).code);
                console.error('Supabase Error Details:', (error as any).details);
                console.error('Supabase Error Hint:', (error as any).hint);
            }
        } else {
            console.error('Non-Error object thrown:', error);
        }
        
        // Prepare error details for development
        let errorDetails: { name?: string; code?: string; details?: any; hint?: string } | undefined;
        if (process.env.NODE_ENV === 'development') {
            errorDetails = {
                name: error instanceof Error ? error.name : 'UnknownError',
                code: (error && typeof error === 'object' && 'code' in error) 
                    ? String(error.code) 
                    : undefined,
                details: (error && typeof error === 'object' && 'details' in error) 
                    ? error.details 
                    : undefined,
                hint: (error && typeof error === 'object' && 'hint' in error && typeof error.hint === 'string')
                    ? error.hint 
                    : undefined
            };
        }

        // Send error response
        const errorResponse: ErrorResponse = {
            success: false, 
            error: 'Không thể lấy danh sách bài viết',
            message: error instanceof Error ? error.message : 'Lỗi không xác định',
            errorDetails
        };
        
        // Log the full error for debugging
        console.error('Full error object:', error);
        
        res.status(500).json(errorResponse);
        
        console.log('\n=== Error Response Sent ===');
        console.log('Status: 500 Internal Server Error');
        console.log('Response:', JSON.stringify(errorResponse, null, 2));
    }
});

// Base API response type
type ApiResponse<T = any> = {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    stack?: string;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
    };
    // Additional error details for development
    errorDetails?: {
        name?: string;
        code?: string;
        details?: any;
        hint?: string;
    };
};

// Type for successful article responses
type ArticleListResponse = ApiResponse<Article[]> & {
    data: Article[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
    };
};

// Type for error responses
type ErrorResponse = ApiResponse<null> & {
    success: false;
    error: string;
    message: string;
};

// List of supported news sources
const SUPPORTED_SOURCES = ['tuoitre', 'vnexpress'];

/**
 * @swagger
 * /api/v1/articles/all-categories:
 *   get:
 *     summary: Lấy bài viết từ tất cả danh mục con
 *     description: Lấy bài viết từ tất cả các danh mục con hiện có
 *     tags: [Articles]
 *     responses:
 *       200:
 *         description: Danh sách bài viết từ tất cả danh mục con
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Article'
 *                 message:
 *                   type: string
 *       500:
 *         description: Lỗi server khi lấy dữ liệu
 */
router.get('/all-categories', async (req: Request, res: Response<ApiResponse<Article[]>>) => {
    try {
        console.log('Bắt đầu lấy bài viết từ tất cả danh mục con...');
        const articles = await getArticlesFromAllSubCategories();
        
        res.json({
            success: true,
            data: articles,
            message: `Đã lấy thành công ${articles.length} bài viết từ tất cả danh mục con`
        });
    } catch (error) {
        console.error('Lỗi khi lấy bài viết từ tất cả danh mục con:', error);
        res.status(500).json({
            success: false,
            error: 'Đã xảy ra lỗi khi lấy bài viết từ tất cả danh mục con',
            message: error instanceof Error ? error.message : 'Lỗi không xác định'
        });
    }
});

/**
 * @swagger
 * /api/v1/articles/scrape/{source}:
 *   get:
 *     summary: Thu thập bài viết từ nguồn bên ngoài
 *     description: Thu thập bài viết từ các nguồn tin tức bên ngoài như Tuổi Trẻ, VnExpress
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: source
 *         required: true
 *         schema:
 *           type: string
 *           enum: [tuoitre, vnexpress]
 *         description: Nguồn tin tức
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           default: tin-moi
 *         description: Danh mục tin tức
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng bài viết mỗi trang
 *       - in: query
 *         name: retry
 *         schema:
 *           type: integer
 *           default: 3
 *         description: Số lần thử lại khi gặp lỗi (tối đa 5 lần)
 *     responses:
 *       200:
 *         description: Danh sách bài viết đã thu thập
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Article'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Tham số không hợp lệ hoặc nguồn không được hỗ trợ
 *       500:
 *         description: Lỗi server khi thu thập dữ liệu
 */
router.get('/scrape/:source', async (req: Request, res: Response<ApiResponse<Article[]>>) => {
    let browser: Browser | null = null;
    let page: Page | null = null;
    
    const { source } = req.params;
    const { category = 'tin-moi', page: pageParam = '1', limit: limitParam = '10' } = req.query;
    const pageNum = parseInt(pageParam as string, 10) || 1;
    const limit = parseInt(limitParam as string, 10) || 10;
    
    // Validate source
    if (!SUPPORTED_SOURCES.includes(source)) {
        return res.status(400).json({
            success: false,
            error: `Nguồn không được hỗ trợ. Các nguồn được hỗ trợ: ${SUPPORTED_SOURCES.join(', ')}`
        });
    }
    
    // For Tuổi Trẻ, use the category as the slug
    const categorySlug = source === 'tuoitre' ? (category as string) : `${source}-${category}`;
    
    try {
        const { source } = req.params as { source: string };
        const { limit = '10', retry = '3' } = req.query as { limit?: string; retry?: string };
        const maxRetries = Math.min(parseInt(retry, 10) || 3, 5); // Max 5 retries
        let lastError: Error | null = null;

        // Validate category slug for Tuổi Trẻ
        if (source === 'tuoitre') {
            const validCategories = ['tin-moi', 'thoi-su', 'the-gioi', 'kinh-doanh', 'giai-tri', 
                                 'the-thao', 'phap-luat', 'giao-duc', 'suc-khoe', 'doi-song',
                                 'du-lich', 'khoa-hoc', 'so-hoa', 'xe', 'y-kien', 'tam-su', 'cuoi', 'ban-doc'];
            
            if (!validCategories.includes(category as string)) {
                return res.status(400).json({
                    success: false,
                    error: `Danh mục không hợp lệ cho Tuổi Trẻ. Các danh mục hợp lệ: ${validCategories.join(', ')}`
                });
            }
        }

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                console.log(`Lấy bài viết (lần thử ${attempt + 1}/${maxRetries})...`);
                // Initialize browser if not already initialized
                if (!browser) {
                    browser = await launchBrowser();
                    if (!browser) {
                        throw new Error('Không thể khởi tạo trình duyệt');
                    }
                }
                
                // Call service function to get articles
                const { articles, hasMore } = await getArticlesByCategory(
                    categorySlug, 
                    Number(limit), 
                    Number(pageNum)
                );
                
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
                
            } catch (error) {
                lastError = error as Error;
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
        
        // If we get here, it means we've retried enough times and still failed
        throw lastError || new Error('Không thể lấy bài viết');
        
    } catch (error) {
        console.error('Lỗi khi lấy bài viết:', error);
        const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
        const statusCode = errorMessage.includes('không tồn tại') ? 404 : 500;
        
        res.status(statusCode).json({
            success: false,
            message: 'Có lỗi xảy ra khi lấy bài viết',
            error: errorMessage,
            stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
        });
    }
});

/**
 * @swagger
 * /api/v1/articles/category/{categorySlug}:
 *   get:
 *     summary: Lấy bài viết theo danh mục
 *     description: Lấy danh sách bài viết thuộc một danh mục cụ thể
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: categorySlug
 *         required: true
 *         schema:
 *           type: string
 *         description: Đường dẫn danh mục
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng bài viết mỗi trang
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *     responses:
 *       200:
 *         description: Danh sách bài viết theo danh mục
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Article'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       404:
 *         description: Không tìm thấy danh mục
 *       500:
 *         description: Lỗi server
 */
router.get('/category/:categorySlug', async (req, res: Response<ApiResponse<Article[]>>) => {
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
        
        // Check if category exists
        if (!Object.keys(categorySlugMap).includes(categorySlug)) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy danh mục'
            });
        }
        
        const browser = await launchBrowser();
        try {
            const { articles, hasMore } = await getArticlesByCategory(
                categorySlug,
                Number(limit),
                Number(page)
            );
            
            // No need to cache here since it's already handled in the service
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
        } finally {
            if (browser) {
                await browser.close().catch(console.error);
            }
        }
    } catch (error) {
        console.error('Lỗi khi lấy bài viết theo danh mục:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Không thể tải bài viết theo danh mục' 
        });
    }
});

/**
 * @swagger
 * /api/v1/articles/{id}:
 *   get:
 *     summary: Lấy chi tiết bài viết
 *     description: Lấy thông tin chi tiết của một bài viết theo ID
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài viết
 *     responses:
 *       200:
 *         description: Thông tin chi tiết bài viết
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Article'
 *       404:
 *         description: Không tìm thấy bài viết
 *       500:
 *         description: Lỗi server
 */
router.get('/:id', async (req: Request, res: Response<ApiResponse<Article>>) => {
    try {
        const { id } = req.params;
        const { data: article, error } = await supabase
            .from('articles')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
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
    } catch (error) {
        console.error('Lỗi khi lấy chi tiết bài viết:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Không thể lấy chi tiết bài viết',
            message: error instanceof Error ? error.message : 'Lỗi không xác định'
        });
    }
});

/**
 * @swagger
 * /api/v1/articles:
 *   post:
 *     summary: Tạo bài viết mới (Admin)
 *     description: Tạo một bài viết mới (yêu cầu quyền admin)
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 description: Tiêu đề bài viết
 *               content:
 *                 type: string
 *                 description: Nội dung bài viết
 *               category:
 *                 type: string
 *                 description: Danh mục bài viết
 *               image_url:
 *                 type: string
 *                 format: url
 *                 description: URL hình ảnh đại diện
 *     responses:
 *       201:
 *         description: Bài viết đã được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Article'
 *       400:
 *         description: Thiếu thông tin bắt buộc
 *       401:
 *         description: Chưa xác thực
 *       403:
 *         description: Không có quyền thực hiện
 *       500:
 *         description: Lỗi server
 */
router.post('/', authenticate, isAdmin, async (req: Request, res: Response<ApiResponse<Article>>) => {
    try {
        const articleData = req.body;
        
        // Check required fields
        if (!articleData.title || !articleData.content) {
            return res.status(400).json({
                success: false,
                error: 'Tiêu đề và nội dung là bắt buộc'
            });
        }
        
        // Add to database
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
            
        if (error) throw error;
        
        res.status(201).json({
            success: true,
            data: article
        });
    } catch (error) {
        console.error('Lỗi khi tạo bài viết:', error);
        res.status(500).json({
            success: false,
            error: 'Không thể tạo bài viết'
        });
    }
});

/**
 * @swagger
 * /api/v1/articles/update-articles:
 *   post:
 *     summary: Cập nhật tất cả bài viết (Admin)
 *     description: Cập nhật tất cả bài viết từ nguồn tin tức (yêu cầu quyền admin)
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cập nhật bài viết thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Chưa xác thực
 *       403:
 *         description: Không có quyền thực hiện
 *       500:
 *         description: Lỗi server khi cập nhật bài viết
 */
router.post('/update-articles', authenticate, isAdmin, updateArticles);

/**
 * @swagger
 * /api/v1/articles/{id}:
 *   put:
 *     summary: Cập nhật bài viết (Admin)
 *     description: Cập nhật thông tin một bài viết (yêu cầu quyền admin)
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài viết cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Article'
 *     responses:
 *       200:
 *         description: Bài viết đã được cập nhật
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Article'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa xác thực
 *       403:
 *         description: Không có quyền thực hiện
 *       404:
 *         description: Không tìm thấy bài viết
 *       500:
 *         description: Lỗi server
 */
router.put('/:id', authenticate, isAdmin, async (req: Request, res: Response<ApiResponse<Article>>) => {
    try {
        const { id } = req.params;
        const articleData = req.body;
        
        // Check if article exists
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
        
        // Update article
        const { data: article, error } = await supabase
            .from('articles')
            .update({
                ...articleData,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();
            
        if (error) throw error;
        
        res.json({
            success: true,
            data: article
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật bài viết:', error);
        res.status(500).json({
            success: false,
            error: 'Không thể cập nhật bài viết'
        });
    }
});

/**
 * @swagger
 * /api/v1/articles/{id}:
 *   delete:
 *     summary: Xóa bài viết (Admin)
 *     description: Xóa một bài viết (yêu cầu quyền admin)
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài viết cần xóa
 *     responses:
 *       200:
 *         description: Bài viết đã được xóa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Chưa xác thực
 *       403:
 *         description: Không có quyền thực hiện
 *       404:
 *         description: Không tìm thấy bài viết
 *       500:
 *         description: Lỗi server
 */
router.delete('/:id', authenticate, isAdmin, async (req: Request, res: Response<ApiResponse<null>>) => {
    try {
        const { id } = req.params;
        
        // Delete from database
        const { error } = await supabase
            .from('articles')
            .delete()
            .eq('id', id);
            
        if (error) throw error;
        
        res.json({
            success: true,
            data: null
        });
    } catch (error) {
        console.error('Lỗi khi xóa bài viết:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Lỗi khi xóa bài viết' 
        });
    }
});

export default router;
