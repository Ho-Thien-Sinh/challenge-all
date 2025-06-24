import axios from 'axios';
const BASE_URL = 'https://tuoitre.vn';
const API_BASE = 'https://api.tuoitre.vn/api';
// Danh sách user agents để xoay vòng
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
];
// Lấy ngẫu nhiên một user agent
const getRandomUserAgent = () => {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
};
// Hàm hỗ trợ: Lấy URL hình ảnh đầy đủ
const getImageUrl = (imagePath) => {
    if (!imagePath)
        return 'https://via.placeholder.com/300x200?text=No+Image';
    if (imagePath.startsWith('http'))
        return imagePath;
    if (imagePath.startsWith('/'))
        return `${BASE_URL}${imagePath}`;
    return `${BASE_URL}/${imagePath}`;
};
// Hàm hỗ trợ: Lấy URL bài viết đầy đủ
const getArticleUrl = (url, categorySlug, itemId) => {
    if (url && url.startsWith('http'))
        return url;
    if (url && url.startsWith('/'))
        return `${BASE_URL}${url}`;
    return `${BASE_URL}/${categorySlug}/${url || itemId}`;
};
// Hàm hỗ trợ: Lấy tên danh mục từ slug
const getCategoryName = (slug) => {
    const categoryMap = {
        'thoi-su': 'Thời sự',
        'the-gioi': 'Thế giới',
        'kinh-doanh': 'Kinh doanh',
        'giai-tri': 'Giải trí',
        'the-thao': 'Thể thao',
        'phap-luat': 'Pháp luật',
        'giao-duc': 'Giáo dục',
        'suc-khoe': 'Sức khỏe',
        'doi-song': 'Đời sống',
        'du-lich': 'Du lịch',
        'khoa-hoc': 'Khoa học',
        'so-hoa': 'Số hóa',
        'xe': 'Xe',
        'y-kien': 'Ý kiến',
        'tam-su': 'Tâm sự'
    };
    return categoryMap[slug] || 'Tin tức';
};
// Hàm hỗ trợ: Trả về dữ liệu mẫu
const getSampleArticles = (categorySlug) => {
    const categoryName = getCategoryName(categorySlug);
    return [
        {
            id: 'sample-1',
            title: `Bài viết mẫu 1 - ${categoryName}`,
            description: 'Đây là mô tả ngắn của bài viết mẫu 1',
            content: 'Nội dung đầy đủ của bài viết mẫu 1',
            image: 'https://via.placeholder.com/300x200?text=Sample+1',
            url: 'https://tuoitre.vn/bai-viet-mau-1',
            slug: 'bai-viet-mau-1',
            source: 'tuoitre',
            published_at: new Date().toISOString(),
            category: categoryName,
            subcategory: '',
            author: 'Tác giả mẫu',
            is_featured: true,
            status: 'published',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: 'sample-2',
            title: `Bài viết mẫu 2 - ${categoryName}`,
            description: 'Đây là mô tả ngắn của bài viết mẫu 2',
            content: 'Nội dung đầy đủ của bài viết mẫu 2',
            image: 'https://via.placeholder.com/300x200?text=Sample+2',
            url: 'https://tuoitre.vn/bai-viet-mau-2',
            slug: 'bai-viet-mau-2',
            source: 'tuoitre',
            published_at: new Date().toISOString(),
            category: categoryName,
            subcategory: '',
            author: 'Tác giả mẫu',
            is_featured: true,
            status: 'published',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
    ];
};
// Hàm kiểm tra và lấy dữ liệu từ object
const getArrayFromData = (obj, path) => {
    try {
        const value = path ? path.split('.').reduce((acc, key) => acc?.[key], obj) : obj;
        return Array.isArray(value) ? value : null;
    }
    catch (error) {
        return null;
    }
};
export const getArticlesByCategory = async (categorySlug, limit = 10) => {
    try {
        console.log(`Fetching articles for category: ${categorySlug}`);
        // Các endpoint API có thể sử dụng
        const endpoints = [
            `${API_BASE}/getlistcategorybyslug/${categorySlug}?page=1&limit=${limit}`,
            `${API_BASE}/GetListCategoryBySlug/${categorySlug}?page=1&limit=${limit}`,
            `${API_BASE}/v1/categories/${categorySlug}/articles?page=1&limit=${limit}`
        ];
        // Thử từng endpoint cho đến khi thành công
        for (const endpoint of endpoints) {
            try {
                console.log(`Trying endpoint: ${endpoint}`);
                const response = await axios.get(endpoint, {
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': getRandomUserAgent(),
                        'Referer': 'https://tuoitre.vn/',
                        'Origin': 'https://tuoitre.vn',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    timeout: 10000
                });
                // Xử lý dữ liệu trả về
                let articlesData = [];
                const data = response.data;
                // Thử các cấu trúc dữ liệu có thể có
                const possiblePaths = [
                    '', // data là mảng
                    'data',
                    'items',
                    'articles',
                    'data.data',
                    'result',
                    'data.items',
                    'data.articles',
                    'response.data',
                    'response.items',
                    'response.articles'
                ];
                for (const path of possiblePaths) {
                    const result = getArrayFromData(data, path);
                    if (result) {
                        articlesData = result;
                        console.log(`Found articles in path: ${path || 'root'}`);
                        break;
                    }
                }
                // Log cấu trúc dữ liệu để debug
                console.log('Raw data structure:', JSON.stringify(data, null, 2).substring(0, 500) + '...');
                if (articlesData.length > 0) {
                    console.log(`Found ${articlesData.length} articles`);
                    // Chuyển đổi dữ liệu về định dạng thống nhất
                    const formattedArticles = articlesData
                        .filter((item) => item !== null && typeof item === 'object')
                        .map((item, index) => ({
                        id: String(item.id || `article-${Date.now()}-${index}`),
                        title: item.title || item.name || 'Không có tiêu đề',
                        description: item.description || item.summary || '',
                        content: item.content || item.body || '',
                        image: getImageUrl(item.thumbnail || item.image || item.avatar || ''),
                        url: getArticleUrl(item.url || item.link || '', categorySlug, item.slug || String(item.id || '')),
                        slug: item.slug || `article-${Date.now()}-${index}`,
                        source: 'tuoitre',
                        published_at: item.published_at || item.publishDate || item.created_at || new Date().toISOString(),
                        category: getCategoryName(categorySlug),
                        subcategory: item.category_name || item.category || '',
                        author: item.author || item.author_name || 'Tuổi Trẻ',
                        is_featured: index < 3,
                        status: 'published',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }));
                    console.log(`Successfully formatted ${formattedArticles.length} articles`);
                    return formattedArticles;
                }
            }
            catch (error) {
                const err = error;
                console.error(`Error with endpoint ${endpoint}:`, err.message);
                // Tiếp tục thử endpoint tiếp theo
                continue;
            }
        }
        // Nếu không tìm thấy dữ liệu, trả về dữ liệu mẫu
        console.log('No articles found, returning sample data');
        return getSampleArticles(categorySlug);
    }
    catch (error) {
        const err = error;
        console.error('Error in getArticlesByCategory:', err);
        // Trả về dữ liệu mẫu nếu có lỗi
        return getSampleArticles(categorySlug);
    }
};
export default {
    getArticlesByCategory
};
