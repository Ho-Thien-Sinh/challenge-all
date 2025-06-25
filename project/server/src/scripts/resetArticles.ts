import supabase from '../lib/supabase.js';

async function resetArticles() {
  try {
    console.log('Đang xóa tất cả bài viết cũ...');
    
    // Delete all articles
    const { error: deleteError } = await supabase
      .from('articles')
      .delete()
      .neq('id', 0); // Delete all articles except those with id = 0 (if any)


    if (deleteError) {
      console.error('Lỗi khi xóa bài viết cũ:', deleteError);
      return;
    }

    console.log('✅ Đã xóa tất cả bài viết cũ');
    console.log('Hệ thống sẽ tự động cập nhật bài viết mới trong vòng vài phút tới...');

    // If you want to activate crawl immediately, you can call the update-articles API
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

// Run resetArticles function
resetArticles();
