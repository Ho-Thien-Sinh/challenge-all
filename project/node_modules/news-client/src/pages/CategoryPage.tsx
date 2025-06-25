import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import ArticleList from '../components/ArticleList';
import Pagination from '../components/Pagination';
import { Article } from '../types';
import { getArticles } from '../lib/api';
import { getCategoryName, isValidCategorySlug } from '../utils/categories';

interface CategoryPageProps {
  categorySlug?: string;
}

const CategoryPage: React.FC<CategoryPageProps> = ({ categorySlug: propCategorySlug }) => {
  const params = useParams<{ '*': string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // State management
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const limit = 12;
  
  // Use prop if provided, otherwise fall back to URL param
  const categorySlug = propCategorySlug || params['*'] || 'thoi-su';
  const searchQuery = searchParams.get('q') || '';
  
  // Check if categorySlug is valid
  useEffect(() => {
    if (!isValidCategorySlug(categorySlug) && !searchQuery) {
      // If not a valid category and not a search query, redirect to home
      navigate('/');
    }
  }, [categorySlug, searchQuery, navigate]);

  // Get category display name
  const getCategoryDisplayName = (slug: string): string => {
    if (searchQuery) return `Kết quả tìm kiếm cho "${searchQuery}"`;
    return getCategoryName(slug);
  };

  // Fetch articles from API
  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Create URL with search parameters
      const searchParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString()
      });
      
      // If valid category, add to parameters
      if (isValidCategorySlug(categorySlug)) {
        // Use category slug to get corresponding category name
        const categoryName = getCategoryName(categorySlug);
        if (categoryName) {
          searchParams.set('category', categoryName);
        }
      }
      
      if (searchQuery) searchParams.set('q', searchQuery);
      
      console.log('Fetching articles with params:', Object.fromEntries(searchParams.entries()));
      
      console.log('Fetching articles with params:', Object.fromEntries(searchParams.entries()));
      
      const response = await getArticles(searchParams);
      console.log('API Response:', response);
      
      // Check if response is an array (API error case)
      if (Array.isArray(response)) {
        throw new Error('Invalid data format from server');
      }
      
      // Check if API error
      if (!response.success) {
        throw new Error(response.error || response.message || 'Không thể tải bài viết');
      }
      
      // Get data from response
      const data = response.data || [];
      const total = response.pagination?.total || 0;
      const totalPages = response.pagination?.total_pages || Math.ceil(total / limit) || 1;
      
      console.log('Total items:', total, 'Page size:', limit, 'Total pages:', totalPages);
      
      if (!data || data.length === 0) {
        setError(`Không tìm thấy bài viết nào ${searchQuery ? `với từ khóa "${searchQuery}"` : `trong danh mục "${getCategoryDisplayName(categorySlug)}"`}`);
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
  }, [currentPage, categorySlug, searchQuery, limit]);

  useEffect(() => {
    // Only call API if valid category or search query
    if (isValidCategorySlug(categorySlug) || searchQuery) {
      fetchArticles().catch(error => {
        console.error('Error fetching articles:', error);
        setError('Không thể tải bài viết. Vui lòng thử lại sau.');
      });
    } else {
      setLoading(false);
      setError('Danh mục không tồn tại');
    }
  }, [categorySlug, searchQuery, currentPage, fetchArticles]);

  // Reset to first page when category or search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [categorySlug, searchQuery]);

  // If no valid category and no search query, do not display anything
  if (!isValidCategorySlug(categorySlug) && !searchQuery) {
    return null;
  }

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
            className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (articles.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">
          {getCategoryDisplayName(categorySlug)}
        </h1>
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
          <p className="font-bold">Không tìm thấy bài viết nào</p>
          <p>{searchQuery ? 
            `Không tìm thấy bài viết nào với từ khóa "${searchQuery}"` : 
            `Không có bài viết nào trong danh mục này.`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {getCategoryDisplayName(categorySlug)}
        </h1>
        <div className="w-20 h-1 bg-blue-600 mb-6"></div>
        
        {/* Article List */}
        <ArticleList articles={articles} loading={loading} />
        
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
    </div>
  );
};

export default CategoryPage;
