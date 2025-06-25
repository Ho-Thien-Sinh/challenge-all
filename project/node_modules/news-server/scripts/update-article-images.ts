import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../.env' });

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Lỗi: Thiếu thông tin cấu hình Supabase. Vui lòng kiểm tra file .env');
  process.exit(1);
}

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

console.log('🔗 Đã kết nối đến Supabase');

// Function to extract image URL from excerpt
function extractImageFromExcerpt(excerpt: string): string | null {
  if (!excerpt) return null;
  
  // Find all img tags in the excerpt
  const imgRegex = /<img[^>]+src="([^">]+)"/g;
  let match;
  let lastMatch = null;
  
  while ((match = imgRegex.exec(excerpt)) !== null) {
    lastMatch = match[1];
  }
  
  return lastMatch || null;
}

// Function to update article thumbnail images
async function updateArticleImages() {
  try {
    console.log('🔄 Bắt đầu cập nhật ảnh đại diện cho bài viết...');
    
    // Get all articles without a thumbnail image
    const { data: articles, error } = await supabase
      .from('articles')
      .select('*')
      .or('image_url.is.null,image_url.eq.');
    
    if (error) {
      console.error('❌ Lỗi khi lấy danh sách bài viết:', error);
      return;
    }
    
    console.log(`📊 Tìm thấy ${articles?.length || 0} bài viết cần cập nhật ảnh`);
    
    if (!articles || articles.length === 0) {
      console.log('✅ Không có bài viết nào cần cập nhật');
      return;
    }
    
    let updatedCount = 0;
    
    // Process each article
    for (const article of articles) {
      try {
        const excerpt = article.excerpt || '';
        const imageUrl = extractImageFromExcerpt(excerpt);
        
        if (imageUrl) {
          // Update the image_url field
          const { error: updateError } = await supabase
            .from('articles')
            .update({ 
              image_url: imageUrl,
              updated_at: new Date().toISOString()
            })
            .eq('id', article.id);
          
          if (updateError) {
            console.error(`❌ Lỗi khi cập nhật bài viết ${article.id}:`, updateError.message);
          } else {
            console.log(`✅ Đã cập nhật ảnh cho bài viết: ${article.title.substring(0, 50)}...`);
            updatedCount++;
          }
        } else {
          console.log(`ℹ️ Không tìm thấy ảnh trong excerpt của bài viết: ${article.title.substring(0, 50)}...`);
        }
        
        // Wait a bit to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`❌ Lỗi khi xử lý bài viết ${article.id}:`, error);
      }
    }
    
    console.log(`\n✅ Hoàn thành! Đã cập nhật ${updatedCount}/${articles.length} bài viết`);
    
  } catch (error) {
    console.error('❌ Lỗi không mong muốn:', error);
  }
}

// Run the update function
updateArticleImages();
