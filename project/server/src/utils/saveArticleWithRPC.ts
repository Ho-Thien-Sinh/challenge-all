import supabase from '../lib/supabase.js';
import { Article } from '../types/article.js';

/**
 * Hàm helper để lưu bài viết sử dụng RPC
 */
export async function saveArticleWithRPC(articleData: any, articleId: number): Promise<Article | null> {
    try {
        console.log('🔄 Đang thử lưu bài viết qua RPC...');
        
        const { data, error } = await supabase.rpc('upsert_article', {
            p_id: articleId,
            p_title: articleData.title,
            p_slug: articleData.slug,
            p_content: articleData.content,
            p_excerpt: articleData.excerpt,
            p_author: articleData.author,
            p_image: articleData.image || articleData.image_url,
            p_image_url: articleData.image_url || articleData.image,
            p_url: articleData.url || articleData.link,
            p_link: articleData.link || articleData.url,
            p_source_url: articleData.source_url,
            p_source: articleData.source,
            p_category: articleData.category,
            p_status: articleData.status,
            p_published_at: articleData.published_at,
            p_created_at: articleData.created_at,
            p_updated_at: articleData.updated_at,
            p_view_count: articleData.view_count || 0,
            p_like_count: articleData.like_count || 0,
            p_comment_count: articleData.comment_count || 0,
            p_is_featured: articleData.is_featured || false,
            p_tags: articleData.tags || [],
            p_summary: articleData.summary || articleData.excerpt || ''
        });

        if (error) {
            console.error('❌ Lỗi khi lưu bài viết (RPC):', {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint,
                articleTitle: articleData.title,
                sourceUrl: articleData.source_url || articleData.url || articleData.link
            });
            throw error;
        }
        
        console.log('✅ Lưu bài viết thành công (RPC)');
        
        // Nếu sử dụng RPC, data trả về có thể không phải là article đầy đủ
        // Nên chúng ta sẽ lấy lại bài viết từ database
        if (data) {
            const { data: savedArticle, error: fetchError } = await supabase
                .from('articles')
                .select('*')
                .eq('link', articleData.link || articleData.url)
                .single();
                
            if (fetchError) {
                console.error('❌ Lỗi khi lấy lại bài viết sau khi lưu:', fetchError);
                return data as Article; // Trả về dữ liệu từ RPC nếu không lấy được từ database
            }
            
            return savedArticle as Article;
        }
        
        return data as Article;
    } catch (rpcError: any) {
        console.error('🔥 Lỗi nghiêm trọng khi lưu bài viết (RPC):', {
            message: rpcError.message,
            code: rpcError.code,
            details: rpcError.details,
            hint: rpcError.hint,
            articleTitle: articleData.title,
            sourceUrl: articleData.source_url || articleData.url || articleData.link
        });
        throw rpcError;
    }
}
