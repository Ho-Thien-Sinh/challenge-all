const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('Đang kết nối đến Supabase...');
console.log('URL:', process.env.SUPABASE_URL);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function checkConnection() {
  try {
    // Kiểm tra kết nối bằng cách lấy danh sách bảng
    const { data: tables, error } = await supabase.rpc('get_tables');
    
    if (error) {
      console.error('Lỗi khi kết nối đến Supabase:', error);
      return;
    }
    
    console.log('Kết nối thành công! Các bảng có sẵn:');
    console.log(tables);
    
    // Kiểm tra xem có bảng articles không
    if (tables && tables.includes('articles')) {
      console.log('\nĐang kiểm tra dữ liệu bài viết...');
      const { data: articles, error: articleError } = await supabase
        .from('articles')
        .select('*')
        .limit(5);
        
      if (articleError) {
        console.error('Lỗi khi lấy dữ liệu bài viết:', articleError);
        return;
      }
      
      console.log(`\nTìm thấy ${articles.length} bài viết`);
      if (articles.length > 0) {
        console.log('Mẫu dữ liệu bài viết đầu tiên:');
        console.log({
          id: articles[0].id,
          title: articles[0].title,
          category: articles[0].category,
          published_at: articles[0].published_at
        });
      }
    } else {
      console.log('Không tìm thấy bảng articles trong cơ sở dữ liệu');
    }
  } catch (err) {
    console.error('Lỗi:', err);
  }
}

checkConnection();
