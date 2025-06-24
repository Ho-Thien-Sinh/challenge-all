import * as React from 'react';
import { useEffect, useState } from 'react';
import { getArticles } from '../lib/api';

export function CheckArticlesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    const checkArticles = async () => {
      try {
        console.log('Đang kiểm tra dữ liệu bài viết...');
        const { data } = await getArticles({ limit: 5 });
        
        console.log(`\nTìm thấy ${data?.length} bài viết`);
        setArticles(data || []);
        
        if (data && data.length > 0) {
          console.log('\nThông tin 5 bài viết mới nhất:');
          data.forEach((article: any, index: number) => {
            console.log(`\n--- Bài viết ${index + 1} ---`);
            console.log('ID:', article.id);
            console.log('Tiêu đề:', article.title);
            console.log('Ảnh đại diện:', article.image_url || 'Không có');
            console.log('Tác giả:', article.author);
            console.log('Danh mục:', article.category);
            console.log('Ngày đăng:', article.published_at);
          });
        } else {
          console.log('Không có bài viết nào trong cơ sở dữ liệu');
        }
      } catch (err) {
        console.error('Lỗi khi kiểm tra bài viết:', err);
        setError('Có lỗi xảy ra khi tải dữ liệu bài viết');
      } finally {
        setIsLoading(false);
      }
    };

    checkArticles();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Kiểm tra dữ liệu bài viết</h1>
      
      {isLoading ? (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Đang kiểm tra dữ liệu bài viết...</span>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="ml-2">{error}</span>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="ml-2">Đã tìm thấy {articles.length} bài viết. Xem chi tiết trong Console (F12).</span>
          </div>
          
          {articles.length > 0 && (
            <div className="mt-4 space-y-4">
              <h3 className="font-semibold">Danh sách bài viết mới nhất:</h3>
              <div className="space-y-2">
                {articles.map((article) => (
                  <div key={article.id} className="p-3 border rounded-md">
                    <h4 className="font-medium">{article.title}</h4>
                    <p className="text-sm text-gray-600">{article.category} • {new Date(article.published_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="ml-2">Vui lòng mở Developer Tools (F12) và chọn tab Console để xem đầy đủ thông tin kiểm tra.</span>
        </div>
      </div>
    </div>
  );
}

export default CheckArticlesPage;
