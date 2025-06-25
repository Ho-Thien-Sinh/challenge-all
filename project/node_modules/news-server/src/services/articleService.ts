import * as cheerio from 'cheerio';
import axios, { AxiosRequestConfig } from 'axios';
import puppeteer, { Browser, Page } from 'puppeteer';
import { parseStringPromise } from 'xml2js';
import { Article } from '../types/article.js';
import { CATEGORY_IDS } from '../constants/categories.js';
import supabase from '../lib/supabase.js';
import { saveArticleWithRPC } from '../utils/saveArticleWithRPC.js';

// Create axios instance with default config
const httpClient = axios.create({
    timeout: 10000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'vi,en-US;q=0.9,en;q=0.8',
        'Referer': 'https://tuoitre.vn/'
    }
});

/**
 * Delay execution for a given number of milliseconds
 */
const delay = (ms: number): Promise<void> => 
    new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch content with retry mechanism
 */
async function fetchWithRetry(
    url: string, 
    config: AxiosRequestConfig = {},
    retries = 3,
    backoff = 1000
): Promise<string> {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await httpClient.get<string>(url, {
                ...config,
                responseType: 'text',
                timeout: 10000
            });
            return response.data;
        } catch (error) {
            if (i === retries - 1) throw error;
            await delay(backoff * (i + 1));
        }
    }
    throw new Error(`Failed to fetch ${url} after ${retries} retries`);
}

/**
 * Check if a URL is a valid article URL
 */
function isValidArticleUrl(url: string): boolean {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.includes('tuoitre.vn') && 
               urlObj.pathname.endsWith('.html') &&
               !url.includes('/video/') &&
               !url.includes('/tuyen-sinh/') &&
               !url.includes('/tai-chinh/') &&
               !url.includes('/ban-doc/');
    } catch {
        return false;
    }
}

/**
 * Get category name from slug
 */
function getCategoryFromSlug(slug: string): string {
    const categoryMap: Record<string, string> = {
        'the-thao': 'Thể thao',
        'the-gioi': 'Thế giới',
        'kinh-doanh': 'Kinh doanh',
        'giai-tri': 'Giải trí',
        'giao-duc': 'Giáo dục',
        'khoa-hoc': 'Khoa học',
        'suc-khoe': 'Sức khỏe',
        'du-lich': 'Du lịch',
        'phap-luat': 'Pháp luật',
        'the-gioi-tre': 'Thế giới trẻ',
        'tin-moi-nhat': 'Tin mới nhất',
        'thoi-su': 'Thời sự',
        'van-hoa': 'Văn hóa',
        'doi-song': 'Đời sống',
        'xe': 'Xe',
        'tam-long-nhan-ai': 'Tấm lòng nhân ái',
        'goc-nhin': 'Góc nhìn',
        'tinh-yeu-gioi-tinh': 'Tình yêu giới tính',
        'am-thuc': 'Ẩm thực',
        'lam-dep': 'Làm đẹp',
        'thi-truong-tieu-dung': 'Thị trường tiêu dùng',
        'tinh-yeu': 'Tình yêu',
        'doi-song-gia-dinh': 'Đời sống gia đình',
        'kham-pha': 'Khám phá',
        'the-gioi-sao': 'Thế giới sao',
        'the-gioi-do-day': 'Thế giới đồ đạc',
        'the-gioi-tre-em': 'Thế giới trẻ em',
        'the-gioi-gai-xinh': 'Thế giới gái xinh',
        'the-gioi-phim': 'Thế giới phim',
        'the-gioi-nhac': 'Thế giới nhạc',
        'the-gioi-thoi-trang': 'Thời trang',
        'the-gioi-sach': 'Sách'
    };
    
    return categoryMap[slug] || 
           slug.split('-')
               .map(word => word.charAt(0).toUpperCase() + word.slice(1))
               .join(' ');
}

/**
 * Get article detail from URL
 */
export async function getArticleDetail(url: string): Promise<Article | null> {
    if (!url || !isValidArticleUrl(url)) {
        console.error('Invalid article URL:', url);
        return null;
    }

    try {
        console.log(`Fetching article: ${url}`);
        
        // Add random delay to avoid rate limiting
        await delay(Math.floor(Math.random() * 2000) + 1000);
        
        // Fetch HTML with cache buster
        const cacheBusterUrl = url.includes('?') 
            ? `${url}&_t=${Date.now()}` 
            : `${url}?_t=${Date.now()}`;
            
        const html = await fetchWithRetry(cacheBusterUrl);
        const $ = cheerio.load(html);
        
        // Check for Cloudflare challenge
        if ($('title').text().includes('Just a moment') || 
            $('body').text().includes('Checking your browser')) {
            throw new Error('Blocked by Cloudflare');
        }

        // Extract article data
        const title = $('h1.article-title, h1.title-detail, h1.title-news').text().trim() || 
                     $('h1').first().text().trim() || 
                     $('title').text().split('|')[0].trim();
        
        if (!title) {
            throw new Error('No title found');
        }
        
        // Extract description
        const description = $('meta[property="og:description"]').attr('content') || 
                          $('meta[name="description"]').attr('content') ||
                          $('.sapo, .sapo-detail, .description, .article-sapo').text().trim() ||
                          '';
        
        // Extract author
        const author = $('.author, .author-name, .author-info').text().trim() || 
                      $('meta[name="author"]').attr('content') || 
                      'Tuổi Trẻ';
        
        // Extract and parse date
        let publishedAt = new Date();
        const dateSelectors = [
            () => $('meta[property="article:published_time"]').attr('content'),
            () => $('meta[itemprop="datePublished"]').attr('content'),
            () => $('meta[name="pubdate"]').attr('content'),
            () => $('.date, .datetime, .time-zone').text().trim(),
            () => $('.header-content .date, .header-content .time').text().trim()
        ];
        
        for (const selector of dateSelectors) {
            const dateString = selector();
            if (dateString) {
                const date = new Date(dateString);
                if (!isNaN(date.getTime())) {
                    publishedAt = date;
                    break;
                }
            }
        }
        
        // Extract image
        let image = $('meta[property="og:image"]').attr('content') || 
                   $('meta[name="twitter:image"]').attr('content') || 
                   $('img.article-image, img.thumbnail').first().attr('src') || '';
        
        if (image && !image.startsWith('http')) {
            const baseUrl = new URL(url).origin;
            image = image.startsWith('//') ? `https:${image}` : `${baseUrl}${image}`;
        }
        
        // Extract and clean content
        let content = '';
        const contentElement = $('.content.fck, .fck, .article-body, .article-content, .detail-content');
        
        if (contentElement.length > 0) {
            const contentClone = contentElement.clone();
            
            // Remove unwanted elements
            contentClone.find('script, style, iframe, .social-like, .social-share, .box-comment, .related-news, .tag-list, .advertisement').remove();
            
            // Get clean HTML
            content = contentClone.html() || '';
            
            // Clean up HTML
            content = content
                .replace(/\s+/g, ' ')
                .replace(/<[^>]*>?/gm, ' ')
                .replace(/\s+/g, ' ')
                .trim();
        }
        
        // If no content found, use description
        if (!content && description) {
            content = description;
        }
        
        // Get category from URL
        const urlParts = new URL(url).pathname.split('/').filter(Boolean);
        const categorySlug = urlParts.length > 1 ? urlParts[0] : 'unknown';
        const category = getCategoryFromSlug(categorySlug);
        
        // Create article object with all required fields
        const article: Article = {
            id: '', // Will be set by database
            title,
            slug: title.toLowerCase()
                     .replace(/[^\w\s-]/g, '')
                     .replace(/\s+/g, '-')
                     .replace(/--+/g, '-'),
            content: content || '',
            summary: description || content?.substring(0, 200) + '...' || '',
            excerpt: description || content?.substring(0, 200) + '...' || '',
            author: author || 'Unknown',
            image_url: image || '',
            image: image || '',
            url: url,
            link: url,
            source_url: url,
            source: 'Tuổi Trẻ',
            category: category || 'uncategorized',
            status: 'published',
            published_at: publishedAt?.toISOString() || new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            // Optional fields
            category_id: CATEGORY_IDS[categorySlug] || 0,
            view_count: 0,
            like_count: 0,
            comment_count: 0,
            is_featured: false,
            tags: []
        };
        
        return article;
        
    } catch (error) {
        console.error(`Error fetching article ${url}:`, error);
        return null;
    }
}

/**
 * Get articles by category with pagination
 */
export async function getArticlesByCategory(
    categorySlug: string, 
    limit = 10, 
    page = 1
): Promise<{ articles: Article[]; hasMore: boolean }> {
    try {
        const articles: Article[] = [];
        const offset = (page - 1) * limit;
        
        // Fetch articles from Supabase
        const { data, error, count } = await supabase
            .from('articles')
            .select('*', { count: 'exact' })
            .eq('category', getCategoryFromSlug(categorySlug))
            .order('published_at', { ascending: false })
            .range(offset, offset + limit - 1);
            
        if (error) throw error;
        
        return {
            articles: data || [],
            hasMore: (count || 0) > offset + limit
        };
        
    } catch (error) {
        console.error(`Error fetching articles for category ${categorySlug}:`, error);
        return { articles: [], hasMore: false };
    }
}

/**
 * Check database connection
 */
export async function checkDatabaseConnection(): Promise<boolean> {
    try {
        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .limit(1);

        if (error) {
            console.error('❌ Lỗi kiểm tra kết nối database:', error);
            return false;
        }
        
        console.log('✅ Kiểm tra kết nối database thành công');
        return true;
    } catch (error) {
        console.error('🔥 Lỗi nghiêm trọng khi kiểm tra kết nối:', error);
        return false;
    }
}

/**
 * Save article to database
 */
export async function saveArticle(article: Omit<Article, 'id'> & { id?: number | string }): Promise<Article | null> {
    console.log('🔄 Đang lưu bài viết:', article.url || article.link);
    
    try {
        // Check database connection before saving
        const isConnected = await checkDatabaseConnection();
        if (!isConnected) {
            throw new Error('Không thể kết nối đến database');
        }

        // Generate slug if not provided
        const generateSlug = (title: string) => {
            if (!title) return 'bai-viet';
            return title
                .toLowerCase()
                .replace(/[^\w\s-]/g, '') // Remove special characters
                .replace(/\s+/g, '-')       // Replace spaces with hyphens
                .replace(/--+/g, '-')        // Replace multiple hyphens with a single hyphen
                .substring(0, 100);          // Limit slug length
        };

        // Create a new object containing only snake_case fields
        const articleData: Record<string, any> = {
            // Required fields
            title: article.title || 'Không có tiêu đề',
            slug: article.slug || generateSlug(article.title || 'bai-viet'),
            content: article.content || '',
            excerpt: article.excerpt || (article as any).summary || '',
            author: article.author || 'Unknown',
            image: article.image || (article as any).image_url || '',
            image_url: article.image_url || (article as any).image || '',
            url: article.url || (article as any).link || '',
            link: (article as any).link || article.url || '',
            source_url: article.source_url || article.url || (article as any).link || '',
            source: article.source || 'Tuổi Trẻ',
            category: article.category || 'uncategorized',
            status: article.status || 'published',
            published_at: article.published_at || (article as any).publishedAt || new Date().toISOString(),
            created_at: article.created_at || (article as any).createdAt || new Date().toISOString(),
            updated_at: new Date().toISOString(),
            
            // Optional fields
            view_count: article.view_count || (article as any).views || 0,
            like_count: article.like_count || (article as any).likes || 0,
            comment_count: article.comment_count || (article as any).comments || 0,
            is_featured: article.is_featured || false,
            tags: article.tags || [],
            summary: article.excerpt || (article as any).summary || ''
        };

        // Remove all undefined, null, or empty string fields
        Object.keys(articleData).forEach(key => {
            if (articleData[key] === undefined || articleData[key] === null || articleData[key] === '') {
                delete articleData[key];
            }
        });

        // Log article data before saving (only in dev environment)
        if (process.env.NODE_ENV !== 'production') {
            console.log('📝 Dữ liệu bài viết trước khi lưu:', {
                title: articleData.title,
                source_url: articleData.source_url,
                category: articleData.category
            });
        }


        // Convert ID to number if needed
        const articleId = article.id ? (typeof article.id === 'string' ? parseInt(article.id, 10) || 0 : article.id) : 0;
        
        // Try upsert directly first (without using RPC)
        try {
            console.log('🔄 Đang thử upsert trực tiếp...');
            const { data: upsertData, error: upsertError } = await supabase
                .from('articles')
                .upsert(articleData, {
                    onConflict: 'link',  // Use link as unique key
                    ignoreDuplicates: false
                })
                .select()
                .single();

            if (upsertError) {
                console.error('❌ Lỗi khi upsert trực tiếp:', {
                    message: upsertError.message,
                    code: upsertError.code,
                    details: upsertError.details,
                    hint: upsertError.hint,
                    articleTitle: articleData.title,
                    sourceUrl: articleData.source_url || articleData.url || articleData.link
                });
                
                // If error is due to RLS, try using RPC
                if (upsertError.code === '42501') {
                    console.log('🔄 Thử dùng RPC thay thế...');
                    return await saveArticleWithRPC(articleData, articleId);
                }
                
                throw upsertError;
            }
            
            console.log('✅ Lưu bài viết thành công (direct upsert)');
            return upsertData as Article;
            
        } catch (error: any) {
            console.error('❌ Lỗi khi lưu bài viết (direct upsert):', {
                message: error.message,
                code: error.code,
                articleTitle: articleData.title,
                sourceUrl: articleData.source_url || articleData.url || articleData.link
            });
            
            // Try using RPC if direct upsert fails
            return await saveArticleWithRPC(articleData, articleId);
        }
    } catch (error) {
        console.error('❌ Lỗi khi lưu bài viết:', {
            message: error instanceof Error ? error.message : 'Lỗi không xác định',
            code: (error as any).code,
            details: (error as any).details,
            hint: (error as any).hint,
            articleTitle: article.title,
            sourceUrl: article.source_url || article.url || (article as any).link || 'unknown'
        });
        return null;
    }
}


/**
 * Get articles from all subcategories
 */
async function getArticlesFromAllSubCategories(): Promise<Article[]> {
    try {
        const allArticles: Article[] = [];
        const categories = Object.keys(CATEGORY_IDS);
        
        // Process each category
        for (const category of categories) {
            try {
                // Get articles for this category
                const { articles } = await getArticlesByCategory(category, 10, 1);
                if (articles && articles.length > 0) {
                    allArticles.push(...articles);
                }
                
                // Add a small delay between requests to avoid rate limiting
                await delay(500);
            } catch (error) {
                console.error(`Error fetching articles for category ${category}:`, error);
                // Continue with next category even if one fails
                continue;
            }
        }
        
        // Remove duplicates by URL
        const uniqueArticles = Array.from(new Map(allArticles.map(article => [article.url, article])).values());
        
        // Sort by published date (newest first)
        return uniqueArticles.sort((a, b) => {
            const dateA = a.published_at ? new Date(a.published_at) : new Date(0);
            const dateB = b.published_at ? new Date(b.published_at) : new Date(0);
            return dateB.getTime() - dateA.getTime();
        });
    } catch (error) {
        console.error('Error in getArticlesFromAllSubCategories:', error);
        throw error;
    }
}

/**
 * Generate a unique numeric ID for an article based on its URL
 */
function generateArticleId(url: string): number {
    // Create a simple hash from the URL
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
        const char = url.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & 0x7FFFFFFF; // Ensure positive 32-bit integer
    }
    return hash;
}

/**
 * Scrape articles from Tuá»•i Tráº»'s RSS feed for a specific category
 */
async function scrapeTuoiTreRSS(categorySlug: string): Promise<Article[]> {
    const articles: Article[] = [];
    const rssUrl = `https://tuoitre.vn/rss/${categorySlug}.rss`;
    
    try {
        // Fetch the RSS feed
        const response = await fetchWithRetry(rssUrl);
        const result = await parseStringPromise(response);
        
        // Parse the RSS items
        if (result?.rss?.channel?.[0]?.item) {
            const items = result.rss.channel[0].item;
            
            for (const item of items) {
                try {
                    const title = item.title?.[0] || '';
                    const url = item.link?.[0] || '';
                    const description = item.description?.[0] || '';
                    const pubDate = item.pubDate?.[0] ? new Date(item.pubDate[0]) : new Date();
                    
                    // Extract image from excerpt if available
                    let imageUrl = '';
                    const imgMatch = description.match(/<img[^>]+src="([^">]+)"/);
                    if (imgMatch && imgMatch[1]) {
                        imageUrl = imgMatch[1];
                    }
                    
                    // Skip if we don't have a valid URL
                    if (!url) continue;
                    
                    // Create article object with all required fields
                    const articleId = generateArticleId(url);
                    const category = getCategoryFromSlug(categorySlug);
                    const article: Article = {
                        id: articleId,
                        title: title || 'Không có tiêu đề',
                        summary: description || '',
                        excerpt: description || '',
                        content: '', // Will be fetched later when viewing the article
                        author: 'Tuổi Trẻ',
                        image_url: imageUrl,
                        image: imageUrl,
                        url: url,
                        link: url,
                        source_url: url,
                        source: 'Tuổi Trẻ', // Change from 'tuoitre' to 'Tuổi Trẻ' to unify
                        category: category || 'uncategorized',
                        status: 'published',
                        published_at: pubDate?.toISOString() || new Date().toISOString(),
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        // Optional fields
                        view_count: 0,
                        like_count: 0,
                        comment_count: 0,
                        is_featured: false,
                        category_id: CATEGORY_IDS[categorySlug] || 0,
                        tags: [], // Add tags field
                        slug: title ? title.toLowerCase()
                            .replace(/[^\w\s-]/g, '')
                            .replace(/\s+/g, '-')
                            .replace(/--+/g, '-')
                            .substring(0, 100) : `article-${Date.now()}`
                    };
                    
                    articles.push(article);
                } catch (error) {
                    console.error('Error parsing RSS item:', error);
                    continue;
                }
            }
        }
        
        return articles;
    } catch (error) {
        console.error(`Error scraping Tuá»•i Tráº» RSS for category ${categorySlug}:`, error);
        return [];
    }
}

/**
 * Launch a headless browser instance
 */
async function launchBrowser(): Promise<Browser | null> {
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run'
            ]
        });
        return browser;
    } catch (error) {
        console.error('❌ Không thể khởi tạo trình duyệt:', error);
        return null;
    }
}



export {
    getArticlesFromAllSubCategories,
    launchBrowser,
    scrapeTuoiTreRSS
};

export default {
    getArticleDetail,
    getArticlesByCategory,
    getArticlesFromAllSubCategories,
    saveArticle,
    getCategoryFromSlug,
    isValidArticleUrl,
    // saveArticleWithRPC is imported and used directly where needed
    checkDatabaseConnection
};
