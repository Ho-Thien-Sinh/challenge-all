import * as React from 'react';
import { Link } from 'react-router-dom';
import { Article } from '../types';

interface ArticleListProps {
  articles: Article[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const ArticleList: React.FC<ArticleListProps> = ({ 
  articles = [], 
  loading = false, 
  error = null,
  onRetry 
}) => {
  // Type guard to check if article has the required properties
  const isValidArticle = (article: any): article is Article => {
    return (
      article && 
      typeof article === 'object' &&
      'title' in article &&
      'published_at' in article
    );
  };

  // Get the first available image from various possible fields
  const getImageUrl = (article: Article): string | undefined => {
    return (
      article.image_url ||
      article.image ||
      article.thumbnail_url ||
      article.thumbnail ||
      article.imageUrl ||
      article.imageURL ||
      article.thumbnailUrl ||
      article.thumbnailURL ||
      article.urlToImage ||
      article.url_to_image ||
      article.featured_image
    );
  };

  // Format date consistently
  const formatDate = (dateString?: string | Date): string => {
    if (!dateString) return '';
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-4">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-2">Đã xảy ra lỗi khi tải dữ liệu</div>
        <div className="text-gray-500 text-sm mb-4">{error}</div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Thử lại
          </button>
        )}
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
        <div className="text-gray-400 mb-4">📰</div>
        <h3 className="text-lg font-medium text-gray-700 mb-1">Không có bài viết nào</h3>
        <p className="text-gray-500 mb-4">Không tìm thấy bài viết phù hợp</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Thử lại
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((item) => {
        // Ensure we have a valid article object before proceeding
        const article = item as Article;
        
        if (!isValidArticle(article)) {
          console.warn('Invalid article data:', article);
          return null;
        }

        const imageUrl = getImageUrl(article);
        const articleUrl = article.url || (article as any).link || `#`;
        const isExternal = typeof articleUrl === 'string' && articleUrl.startsWith('http');
        
        const articleContent = (
          <>
            {imageUrl && (
              <div className="w-full h-48 overflow-hidden bg-gray-100">
                <img 
                  src={imageUrl} 
                  alt={article.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://via.placeholder.com/400x300?text=${encodeURIComponent(article.title?.[0] || 'N')}`;
                  }}
                />
              </div>
            )}
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
                {article.title}
              </h2>
              {article.excerpt && (
                <p className="text-gray-600 line-clamp-3 text-sm mb-3">
                  {article.excerpt}
                </p>
              )}
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{article.author || 'Ẩn danh'}</span>
                {article.published_at && (
                  <time dateTime={new Date(article.published_at).toISOString()}>
                    {formatDate(article.published_at)}
                  </time>
                )}
              </div>
              {article.category && (
                <div className="mt-2">
                  <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                    {article.category}
                  </span>
                </div>
              )}
            </div>
          </>
        );

        return isExternal ? (
          <a
            key={article.id}
            href={articleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 bg-white"
          >
            {articleContent}
          </a>
        ) : (
          <Link
            key={article.id}
            to={articleUrl}
            className="block rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 bg-white"
          >
            {articleContent}
          </Link>
        );
      })}
    </div>
  );
};

export default ArticleList;
