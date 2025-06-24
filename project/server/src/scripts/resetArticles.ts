import supabase from '../lib/supabase.js';

async function resetArticles() {
  try {
    console.log('Đang xóa tất cả bài viết cũ...');
    
    // Xóa tất cả bài viết
    const { error: deleteError } = await supabase
      .from('articles')
      .delete()
      .neq('id', 0); // Xóa tất cả bài viết trừ những bài có id = 0 (nếu có)


    if (deleteError) {
      console.error('Lỗi khi xóa bài viết cũ:', deleteError);
      return;
    }

    console.log('✅ Đã xóa tất cả bài viết cũ');
    console.log('Hệ thống sẽ tự động cập nhật bài viết mới trong vòng vài phút tới...');

    // Nếu muốn kích hoạt crawl ngay lập tức, có thể gọi API update-articles
    try {
      console.log('\nĐang kích hoạt cập nhật bài viết mới...');
      const response = await fetch('http://localhost:5001/api/v1/update-articles', {
        method: 'POST',
      });
      
      if (response.ok) {
        console.log('✅ Đã kích hoạt cập nhật bài viết mới');
        console.log('Xin vui lòng đợi trong giây lát...');
      } else {
        console.error('❌ Lỗi khi kích hoạt cập nhật bài viết:', await response.text());
      }
    } catch (error) {
      console.error('❌ Lỗi khi gọi API cập nhật bài viết:', error);
    }

  } catch (error) {
    console.error('❌ Lỗi khi reset bài viết:', error);
  }
}

// Chạy hàm reset
resetArticles();
