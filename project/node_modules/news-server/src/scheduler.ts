import { createClient } from '@supabase/supabase-js';
import { Article } from './types/article.js';
import { MAIN_CATEGORIES } from './constants/categories.js';
import articleService from './services/articleService.js';
import { scrapeTuoiTreRSS } from './services/articleService.js';

// Function to check table schema
async function checkTableSchema() {
    try {
        console.log('Checking table schema...');
        const { data, error } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type, is_nullable')
            .eq('table_name', 'articles');
            
        if (error) {
            console.error('Lỗi khi lấy thông tin cấu trúc bảng:', error);
            return;
        }
        
        console.log('Cấu trúc bảng articles:');
        console.table(data || []);
    } catch (error) {
        console.error('Lỗi khi kiểm tra cấu trúc bảng:', error);
    }
}

const { getArticlesByCategory, getCategoryFromSlug } = articleService;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Supabase configuration. Please check the environment variables SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Function to update article data for a category
async function updateCategoryArticles(categorySlug: string) {
    console.log(`[${new Date().toISOString()}] Bắt đầu cập nhật danh mục: ${categorySlug}`);
    
    try {
        // Get the latest articles from RSS feed
        const articles = await scrapeTuoiTreRSS(categorySlug);
        
        if (articles && articles.length > 0) {
            console.log(`[${new Date().toISOString()}] Đã lấy được ${articles.length} bài viết từ RSS feed của danh mục ${categorySlug}`);
            
            // Save new articles to database
            for (const article of articles) {
                try {
                    // Check if article already exists by source_url
                    const { data: existingArticle, error: selectError } = await supabase
                        .from('articles')
                        .select('id')
                        .or(`source_url.eq.${article.source_url || article.url}`)
                        .maybeSingle();
                    
                    if (selectError) {
                        console.error(`Lỗi khi kiểm tra bài viết (link: ${article.url}):`, selectError);
                        continue;
                    }
                    
                    if (!existingArticle) {
                        // Prepare article data according to the Article interface
                        const articleData: Article = {
                            id: article.id,
                            title: article.title,
                            summary: article.summary || article.excerpt || '',
                            excerpt: article.excerpt || article.summary || '',
                            content: article.content || '',
                            author: article.author || 'Unknown',
                            image_url: article.image_url || article.image || '',
                            image: article.image || article.image_url || '',
                            url: article.url,
                            link: article.link || article.url,
                            source_url: article.source_url || article.source || article.url,
                            source: article.source || article.source_url || article.url,
                            category: article.category || getCategoryFromSlug(categorySlug) || 'uncategorized',
                            status: 'published',
                            published_at: article.published_at || article.publishedAt || new Date().toISOString(),
                            created_at: article.created_at || article.createdAt || new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        } as Article;
                        
                        // Insert new article
                        const { error: insertError } = await supabase
                            .from('articles')
                            .insert([articleData]);
                            
                        if (insertError) {
                            console.error(`Lỗi khi lưu bài viết (link: ${article.url}):`, insertError);
                        } else {
                            console.log(`✅ Đã thêm bài viết mới: ${article.title} (${article.url})`);
                        }
                    } else {
                        console.log(`ℹ️ Bài viết đã tồn tại: ${article.title} (${article.url})`);
                    }
                } catch (error) {
                    console.error(`Lỗi khi xử lý bài viết:`, error);
                }
                
                // Thêm delay giữa các request để tránh bị chặn
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        } else {
            console.log(`[${new Date().toISOString()}] Không tìm thấy bài viết mới trong danh mục ${categorySlug}`);
        }
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Lỗi khi cập nhật danh mục ${categorySlug}:`, error);
    }
}

// Function to update article data for all categories
async function updateAllCategories() {
    console.log(`[${new Date().toISOString()}] Bắt đầu cập nhật tất cả danh mục`);
    
    // Iterate through all main categories
    for (const category of MAIN_CATEGORIES) {
        try {
            console.log(`Đang xử lý danh mục: ${category}`);
            await updateCategoryArticles(category);
            
            // Thêm delay giữa các danh mục để tránh bị chặn
            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
            console.error(`Lỗi khi xử lý danh mục ${category}:`, error);
            // Tiếp tục với danh mục tiếp theo nếu có lỗi
            continue;
        }
    }
    
    console.log(`[${new Date().toISOString()}] Đã cập nhật xong tất cả danh mục`);
}

// Function to start scheduler
export function startScheduler(intervalMinutes: number = 30) {
    console.log(`[${new Date().toISOString()}] Khởi động scheduler, cập nhật mỗi ${intervalMinutes} phút`);
    
    // Run first update immediately
    updateAllCategories().catch(console.error);
    
    // Set up regular updates
    const intervalMs = intervalMinutes * 60 * 1000;
    const intervalId = setInterval(() => {
        updateAllCategories().catch(console.error);
    }, intervalMs);
    
    // Function to stop scheduler
    return () => {
        clearInterval(intervalId);
        console.log(`[${new Date().toISOString()}] Đã dừng scheduler`);
    };
}

// Export a function to run the scheduler when this file is run directly
export async function runScheduler(intervalMinutes?: number) {
    const interval = intervalMinutes || (process.argv[2] ? parseInt(process.argv[2], 10) : 30);
    
    console.log(`[${new Date().toISOString()}] Khởi động scheduler từ dòng lệnh, cập nhật mỗi ${interval} phút`);
    
    // Handle program shutdown signals
    const stopScheduler = startScheduler(interval);
    
    const handleShutdown = () => {
        console.log('\nNhận được tín hiệu dừng, đang dọn dẹp...');
        stopScheduler();
        process.exit(0);
    };

    process.on('SIGINT', handleShutdown);
    process.on('SIGTERM', handleShutdown);
}

// Run the scheduler if this file is executed directly
// This is a more compatible way to check if the file is being run directly
const isDirectRun = process.argv[1] && process.argv[1] === new URL(import.meta.url).pathname;
if (isDirectRun) {
    (async () => {
        // Check the database schema first
        await checkTableSchema();
        await runScheduler();
    })().catch(console.error);
}
