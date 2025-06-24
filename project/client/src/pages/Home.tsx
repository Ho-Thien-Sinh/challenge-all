import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getArticles } from '../lib/api';
import ArticleList from '../components/ArticleList';
import Pagination from '../components/Pagination';
import { Article } from '../types';

const Home: React.FC = () => {
  // State management
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchParams] = useSearchParams();
  const limit = 10;
  
  // Parse URL search parameters for filtering
  const category = searchParams.get('category') || '';
  const searchQuery = searchParams.get('q') || '';
  
  // Fetch articles from API
  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Gọi API với các tham số tìm kiếm
      const searchParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });
      
      if (category) searchParams.set('category', category);
      if (searchQuery) searchParams.set('q', searchQuery);
      
      console.log('Fetching articles with params:', Object.fromEntries(searchParams.entries()));
      
      const response = await getArticles(searchParams);
      console.log('API Response:', response); // Debug
      
      if (!response.success) {
        throw new Error(response.error || 'Không thể tải bài viết');
      }
      
      // API trả về dữ liệu trong response.data và pagination trong response.pagination
      const data = response.data || [];
      const total = response.pagination?.total || 0;
      const totalPages = response.pagination?.total_pages || 1;
      
      console.log('Total items:', total, 'Page size:', limit, 'Total pages:', totalPages); // Debug
      
      if (!data || data.length === 0) {
        setError('Không tìm thấy bài viết nào');
      } else {
        setArticles(Array.isArray(data) ? data : []);
        setTotalPages(totalPages > 0 ? totalPages : 1);
      }
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tải bài viết');
    } finally {
      setLoading(false);
    }
  }, [currentPage, category, searchQuery, limit]);
  
  // Fetch articles when component mounts or dependencies change
  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle retry on error
  const handleRetry = () => {
    fetchArticles();
  };

  // Loading state
  if (loading && articles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p className="font-bold">Lỗi</p>
          <p>{error}</p>
          <button 
            onClick={handleRetry}
            className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Tin tức mới nhất</h1>
      
      {/* Display search query if present */}
      {searchQuery && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700">
            Kết quả tìm kiếm cho: <span className="text-primary-600">{searchQuery}</span>
          </h2>
        </div>
      )}
      
      {/* Display category filter if present */}
      {category && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700">
            Danh mục: <span className="text-primary-600 capitalize">{category}</span>
          </h2>
        </div>
      )}
      
      {/* Article List */}
      <ArticleList 
        articles={articles}
        loading={loading}
        error={error}
        onRetry={fetchArticles}
      />
      
      {/* No articles message */}
      {!loading && articles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Không có bài viết nào để hiển thị</p>
          <button 
            onClick={handleRetry}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Tải lại
          </button>
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default Home;
