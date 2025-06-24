import { Request, Response } from 'express';
import { getArticlesByCategory } from '../services/tuoitreService.js';
import { startCrawler } from '../crawler.js';

export const getArticles = async (req: Request, res: Response) => {
    try {
        const { category = 'thoi-su', limit = 10 } = req.query;
        const articles = await getArticlesByCategory(String(category), Number(limit));
        
        res.json({
            success: true,
            data: articles,
            message: 'Lấy danh sách bài viết thành công'
        });
    } catch (error: unknown) {
        console.error('Error in getArticles controller:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi lấy danh sách bài viết',
            error: errorMessage
        });
    }
};

export const getArticleDetail = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        // Ở đây bạn có thể triển khai lấy chi tiết bài viết nếu cần
        res.json({
            success: true,
            data: {
                id,
                title: 'Bài viết mẫu',
                content: 'Nội dung bài viết mẫu',
                // ... các trường khác
            },
            message: 'Lấy chi tiết bài viết thành công'
        });
    } catch (error: unknown) {
        console.error('Error in getArticleDetail controller:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi lấy chi tiết bài viết',
            error: errorMessage
        });
    }
};

export const updateArticles = async (req: Request, res: Response) => {
    try {
        console.log('Bắt đầu cập nhật bài viết...');
        
        // Gọi hàm startCrawler để bắt đầu quá trình crawl dữ liệu
        await startCrawler('https://tuoitre.vn');
        
        res.json({
            success: true,
            message: 'Đã bắt đầu cập nhật bài viết. Vui lòng đợi trong giây lát...'
        });
    } catch (error: unknown) {
        console.error('Lỗi khi cập nhật bài viết:', error);
        const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi cập nhật bài viết',
            error: errorMessage
        });
    }
};
