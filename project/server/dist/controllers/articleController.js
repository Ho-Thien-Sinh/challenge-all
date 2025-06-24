import { getArticlesByCategory } from '../services/tuoitreService.js';
export const getArticles = async (req, res) => {
    try {
        const { category = 'thoi-su', limit = 10 } = req.query;
        const articles = await getArticlesByCategory(String(category), Number(limit));
        res.json({
            success: true,
            data: articles,
            message: 'Lấy danh sách bài viết thành công'
        });
    }
    catch (error) {
        console.error('Error in getArticles controller:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi lấy danh sách bài viết',
            error: errorMessage
        });
    }
};
export const getArticleDetail = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error in getArticleDetail controller:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi lấy chi tiết bài viết',
            error: errorMessage
        });
    }
};
