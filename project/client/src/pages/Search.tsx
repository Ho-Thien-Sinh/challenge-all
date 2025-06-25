import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaSearch as SearchIcon } from 'react-icons/fa';
import { searchArticles } from '../lib/api';
import NewsCard from '../components/NewsCard';
import Pagination from '../components/Pagination';
import { toast } from 'react-toastify';

interface Article {
  id: string;
  title: string;
  summary?: string;
  excerpt?: string;
  author: string;
  category: string;
  image_url?: string;
  published_at: string;
  slug?: string;
  views?: number;
  likes?: number;
  comments_count?: number;
}

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  
  const query = searchParams.get('q') || '';
  const articlesPerPage = 12;

  const performSearch = useCallback(async () => {
    const searchTerm = query.trim();
    if (!searchTerm) {
      setArticles([]);
      setTotalPages(1);
      return;
    }

    setLoading(true);
    try {
      toast.info('Đang tìm kiếm bài viết...', { autoClose: 1000 });
      
      const { data, total } = await searchArticles(searchTerm, currentPage, articlesPerPage);
      
      setArticles(data || []);
      setTotalPages(Math.ceil((total || 0) / articlesPerPage));
      
      if (data && data.length === 0) {
        toast.info('Không tìm thấy bài viết nào phù hợp');
      }
    } catch (error) {
      console.error('Lỗi khi tìm kiếm bài viết:', error);
      toast.error('Có lỗi xảy ra khi tìm kiếm bài viết');
    } finally {
      setLoading(false);
    }
  }, [query, currentPage, articlesPerPage]);
  
  // Handle search when query or current page changes
  useEffect(() => {
    performSearch();
  }, [performSearch]);
  
  // Reset to page 1 when query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [query]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/tim-kiem?q=${encodeURIComponent(searchQuery.trim())}`);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleArticleClick = (id: string) => {
    navigate(`/bai-viet/${id}`);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto mb-8">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm bài viết..."
            className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-500 hover:text-blue-600 focus:outline-none"
            disabled={loading}
          >
            <SearchIcon className="h-5 w-5" />
          </button>
        </form>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {query && (
            <h1 className="text-2xl font-bold mb-6">
              Kết quả tìm kiếm cho: <span className="text-blue-600">"{query}"</span>
            </h1>
          )}
          
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <div 
                  key={article.id} 
                  onClick={() => handleArticleClick(article.id)}
                  className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                >
                  <NewsCard
                   article={{
                    id: article.id,
                    title: article.title,
                    excerpt: article.excerpt || article.summary || '',
                    summary: article.summary || article.excerpt || '',
                    author: article.author,
                    category: article.category,
                    image_url: article.image_url,
                    published_at: article.published_at,
                    views: article.views,
                    likes: article.likes,
                    comments_count: article.comments_count
                  }}
                  variant="default"
/>
                </div>
              ))}
            </div>
          ) : (
            query && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Không tìm thấy bài viết nào phù hợp với từ khóa "{query}"</p>
              </div>
            )
          )}
          
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Search;
