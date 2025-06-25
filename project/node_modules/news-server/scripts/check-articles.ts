import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

async function checkArticles() {
  try {
    console.log('Đang kết nối đến Supabase...');
    
    // Get list of all categories
    const { data: categories, error: categoryError } = await supabase
      .from('articles')
      .select('category')
      .not('category', 'is', null);

    if (categoryError) {
      console.error('Lỗi khi lấy danh sách danh mục:', categoryError);
      return;
    }

    // Count number of articles per category
    const categoryCounts: Record<string, number> = {};
    categories?.forEach(article => {
      categoryCounts[article.category] = (categoryCounts[article.category] || 0) + 1;
    });

    console.log('\nSố lượng bài viết theo danh mục:');
    console.table(categoryCounts);

    // Lấy 5 bài viết mới nhất từ mỗi danh mục
    for (const category of Object.keys(categoryCounts)) {
      console.log(`\n=== 5 bài viết mới nhất trong danh mục "${category}" ===`);
      
      const { data: articles, error } = await supabase
        .from('articles')
        .select('*')
        .eq('category', category)
        .order('published_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error(`Lỗi khi lấy bài viết danh mục ${category}:`, error);
        continue;
      }

      if (articles && articles.length > 0) {
        articles.forEach((article, index) => {
          console.log(`\n--- Bài viết ${index + 1} ---`);
          console.log('ID:', article.id);
          console.log('Tiêu đề:', article.title);
          console.log('Tác giả:', article.author);
          console.log('Danh mục:', article.category);
          console.log('Ngày đăng:', article.published_at);
          console.log('URL:', article.url);
          console.log('Mô tả:', article.description?.substring(0, 100) + '...');
        });
      } else {
        console.log(`Không tìm thấy bài viết nào trong danh mục ${category}`);
      }
    }

    // Check for data errors
    console.log('\n=== Kiểm tra dữ liệu lỗi ===');
    const { data: errorData } = await supabase
      .from('articles')
      .select('*')
      .or('title.is.null,description.is.null,category.is.null,published_at.is.null')
      .limit(10);
    
    if (errorData && errorData.length > 0) {
      console.log(`\nTìm thấy ${errorData.length} bài viết có dữ liệu bị thiếu hoặc lỗi:`);
      errorData.forEach((article, index) => {
        console.log(`\n--- Bài viết lỗi ${index + 1} ---`);
        console.log('ID:', article.id);
        console.log('Tiêu đề:', article.title);
        console.log('Danh mục:', article.category);
      });
    } else {
      console.log('Không tìm thấy bài viết nào bị lỗi dữ liệu.');
    }

  } catch (error) {
    console.error('Lỗi:', error);
  }
}

checkArticles();
