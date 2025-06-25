import axios, { AxiosError } from 'axios';
import * as cheerio from 'cheerio';
import { Article } from '../types.js';

// Extend the Article interface to include additional properties
interface ExtendedArticle extends Omit<Article, 'image' | 'slug' | 'description' | 'content' | 'url' | 'source' | 'category' | 'subcategory' | 'author' | 'is_featured' | 'status' | 'created_at' | 'updated_at'> {
    image?: string;
    slug: string;
    description: string;
    content: string;
    url: string;
    source: string;
    category: string;
    subcategory: string;
    author: string;
    is_featured: boolean;
    status: 'published' | 'draft' | 'archived';
    created_at: string;
    updated_at: string;
}

// Define TuoiTreArticle interface for API response
interface TuoiTreArticle {
    id?: string | number;
    title?: string;
    name?: string;
    description?: string;
    summary?: string;
    content?: string;
    body?: string;
    thumbnail?: string;
    image?: string;
    avatar?: string;
    url?: string;
    link?: string;
    slug?: string;
    published_at?: string;
    publishDate?: string;
    created_at?: string;
    category_name?: string;
    category?: string;
    author?: string;
    author_name?: string;
    [key: string]: any; // Allow additional fields
}

const BASE_URL = 'https://tuoitre.vn';
const API_BASE = 'https://api.tuoitre.vn/api';

// List of user agents to rotate
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
];

// Get random user agent
const getRandomUserAgent = (): string => {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
};

// Helper function: Get full image URL
const getImageUrl = (imagePath: string): string => {
    if (!imagePath) return 'https://via.placeholder.com/300x200?text=No+Image';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/')) return `${BASE_URL}${imagePath}`;
    return `${BASE_URL}/${imagePath}`;
};

// Helper function: Get full article URL
const getArticleUrl = (url: string, categorySlug: string, itemId: string | number): string => {
    if (url && url.startsWith('http')) return url;
    if (url && url.startsWith('/')) return `${BASE_URL}${url}`;
    return `${BASE_URL}/${categorySlug}/${url || itemId}`;
};

// Helper function: Get category name from slug
const getCategoryName = (slug: string): string => {
    const categoryMap: Record<string, string> = {
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

// Helper function: Return sample articles
const getSampleArticles = (categorySlug: string): ExtendedArticle[] => {
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

// Helper function: Check and get data from object
const getArrayFromData = (obj: any, path: string): TuoiTreArticle[] | null => {
    try {
        const value = path ? path.split('.').reduce((acc, key) => acc?.[key], obj) : obj;
        return Array.isArray(value) ? value : null;
    } catch (error) {
        return null;
    }
};

export const getArticlesByCategory = async (categorySlug: string, limit: number = 10): Promise<ExtendedArticle[]> => {
    try {
        console.log(`Fetching articles for category: ${categorySlug}`);
        
        // List of API endpoints to try
        const endpoints = [
            `${API_BASE}/getlistcategorybyslug/${categorySlug}?page=1&limit=${limit}`,
            `${API_BASE}/GetListCategoryBySlug/${categorySlug}?page=1&limit=${limit}`,
            `${API_BASE}/v1/categories/${categorySlug}/articles?page=1&limit=${limit}`
        ];

        // Try each endpoint until success
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

                // Process returned data
                let articlesData: TuoiTreArticle[] = [];
                const data = response.data;
                
                // Try possible data structures
                const possiblePaths = [
                    '',
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


                // Log raw data structure for debugging
                console.log('Raw data structure:', JSON.stringify(data, null, 2).substring(0, 500) + '...');
                
                if (articlesData.length > 0) {
                    console.log(`Found ${articlesData.length} articles`);
                    
                    // Convert data to unified format
                    const formattedArticles = await Promise.all(articlesData
                        .filter((item): item is TuoiTreArticle => item !== null && typeof item === 'object')
                        .map(async (item, index) => {
                            // Get article URL to fetch original image
                            let articleImage = '';
                            const articleUrl = getArticleUrl(
                                item.url || item.link || '', 
                                categorySlug, 
                                item.slug || String(item.id || '')
                            );
                            
                            try {
                                // Try to fetch image from article details
                                const response = await axios.get(articleUrl, {
                                    headers: {
                                        'User-Agent': getRandomUserAgent(),
                                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                                        'Accept-Language': 'vi,en-US;q=0.7,en;q=0.3',
                                    },
                                    timeout: 10000
                                });
                                
                                // Analyze HTML to get main image
                                const $ = cheerio.load(response.data);
                                articleImage = $('meta[property="og:image"]').attr('content') || 
                                             $('meta[name="twitter:image"]').attr('content') ||
                                             $('img.detail-img-full').attr('src') ||
                                             $('img.detail-img').attr('src') ||
                                             $('img.news-content-img').attr('src') ||
                                             $('img.news-image').attr('src') ||
                                             $('img[itemprop="image"]').attr('src') ||
                                             '';
                                
                                // Ensure image URL is complete
                                if (articleImage && !articleImage.startsWith('http')) {
                                    articleImage = new URL(articleImage, BASE_URL).toString();
                                }
                            } catch (error) {
                                console.error(`Error fetching article details from ${articleUrl}:`, error);
                            }
                            
                            // If no image is found from article details, use image from list
                            if (!articleImage) {
                                articleImage = getImageUrl(item.thumbnail || item.image || item.avatar || '');
                            }
                            
                            return {
                                id: String(item.id || `article-${Date.now()}-${index}`),
                                title: item.title || item.name || 'Không có tiêu đề',
                                description: item.description || item.summary || '',
                                content: item.content || item.body || '',
                                image: articleImage,
                                url: getArticleUrl(
                                    item.url || item.link || '', 
                                    categorySlug, 
                                    item.slug || String(item.id || '')
                                ),
                                slug: item.slug || `article-${Date.now()}-${index}`,
                                source: 'tuoitre',
                                published_at: item.published_at || item.publishDate || item.created_at || new Date().toISOString(),
                                category: getCategoryName(categorySlug),
                                subcategory: item.category_name || item.category || '',
                                author: item.author || item.author_name || 'Tuổi Trẻ',
                                is_featured: index < 3,
                                status: 'published' as const,
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString()
                            };
                        }));
                    
                    console.log(`Successfully formatted ${formattedArticles.length} articles`);
                    return formattedArticles;
                }
            } catch (error) {
                const err = error as Error;
                console.error(`Error with endpoint ${endpoint}:`, err.message);
                // Continue to next endpoint
                continue;
            }
        }

        // If no data found, return sample data
        console.log('No articles found, returning sample data');
        return getSampleArticles(categorySlug);
        
    } catch (error) {
        const err = error as Error;
        console.error('Error in getArticlesByCategory:', err);
        // Return sample data if error
        return getSampleArticles(categorySlug);
    }
};

export default {
    getArticlesByCategory
};
