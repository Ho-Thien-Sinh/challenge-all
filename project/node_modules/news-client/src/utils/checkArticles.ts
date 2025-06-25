import { supabase } from '../lib/supabase';

export async function checkArticles() {
  try {
    console.log('Đang kiểm tra dữ liệu bài viết...');
    
    // Get 5 most recent articles
    const { data: articles, error } = await supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Lỗi khi lấy dữ liệu bài viết:', error);
      return;
    }

    console.log(`\nTìm thấy ${articles?.length} bài viết`);
    
    if (articles && articles.length > 0) {
      console.log('\nThông tin 5 bài viết mới nhất:');
      articles.forEach((article: any, index: number) => {
        console.log(`\n--- Bài viết ${index + 1} ---`);
        console.log('ID:', article.id);
        console.log('Tiêu đề:', article.title);
        console.log('Ảnh đại diện:', article.image_url || 'Không có');
        console.log('Tác giả:', article.author);
        console.log('Danh mục:', article.category);
        console.log('Ngày đăng:', article.published_at);
        
        // Check if there's an excerpt
        if (article.excerpt) {
          console.log('Có trích dẫn (excerpt)');
          // Check if there's an image in the excerpt
          const imgMatch = article.excerpt.match(/<img[^>]+src="([^">]+)"/);
          if (imgMatch && imgMatch[1]) {
            console.log('Tìm thấy ảnh trong excerpt:', imgMatch[1]);
          } else {
            console.log('Không tìm thấy ảnh trong excerpt');
          }
        } else {
          console.log('Không có trích dẫn (excerpt)');
        }
      });
    } else {
      console.log('Không có bài viết nào trong cơ sở dữ liệu');
    }
  } catch (error) {
    console.error('Lỗi khi kiểm tra bài viết:', error);
  }
}

// Run the check function
checkArticles();
