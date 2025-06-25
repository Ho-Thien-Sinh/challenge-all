import * as React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { FaClock, FaUser } from 'react-icons/fa';

interface Article {
  id: string | number;
  title: string;
  summary: string;
  excerpt?: string;
  author: string;
  category: string;
  image_url?: string;
  published_at: string;
  [key: string]: any; // Add index signature to avoid TypeScript error
}

interface NewsCardProps {
  article: Article;
  variant?: 'default' | 'featured';
}

const NewsCard: React.FC<NewsCardProps> = ({ article, variant = 'default' }) => {
  const publishedDate = new Date(article.published_at);

  // Function to check if image URL is valid
  const isValidImageUrl = (url: string | undefined): boolean => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Get image URL or return null if no valid image
  const getImageUrl = (): string | null => {
    if (isValidImageUrl(article.image_url)) return article.image_url || null;
    
    // Try to extract image from excerpt if available
    if (article.excerpt) {
      const imgMatch = article.excerpt.match(/<img[^>]+src="([^">]+)"/);
      if (imgMatch && imgMatch[1] && isValidImageUrl(imgMatch[1])) {
        return imgMatch[1];
      }
    }
    
    return null;
  };

  const imageUrl = getImageUrl();
  const hasImage = !!imageUrl;
  
  // Random background colors for placeholder
  const placeholderColors = [
    'bg-blue-100', 'bg-green-100', 'bg-yellow-100',
    'bg-pink-100', 'bg-purple-100', 'bg-indigo-100'
  ];
  const randomColor = placeholderColors[
    (article.title?.length || 0) % placeholderColors.length
  ];
  
  // Get first letter of title for placeholder
  const placeholderText = article.title ? article.title.charAt(0).toUpperCase() : 'N';

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    // Replace with placeholder if image fails to load
    target.parentElement?.classList.add(randomColor);
    target.style.display = 'none';
    const placeholder = target.nextElementSibling as HTMLElement;
    if (placeholder) {
      placeholder.style.display = 'flex';
    }
  };

  if (variant === 'featured') {
    return (
      <Link
        to={`/article/${article.id}`}
        className="news-card group block"
      >
        <div className="relative h-80 overflow-hidden">
          {hasImage ? (
            <>
              <img
                src={imageUrl}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={handleImageError}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </>
          ) : (
            <div className={`w-full h-full ${randomColor} flex items-center justify-center`}>
              <FaClock className="w-4 h-4 mr-1 text-gray-500" />
              <span>{placeholderText}</span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <span className="inline-block bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium mb-3">
              {article.category}
            </span>
            <h2 className="text-2xl font-bold mb-2 line-clamp-2 group-hover:text-primary-200 transition-colors">
              {article.title}
            </h2>
            <p className="text-gray-200 mb-3 line-clamp-2">{article.summary}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-300">
              <div className="flex items-center space-x-1">
                <FaUser size={16} />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center space-x-1">
                <FaClock size={16} />
                <span>{format(publishedDate, 'dd/MM/yyyy HH:mm', { locale: vi })}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/article/${article.id}`}
      className="news-card group block"
    >
      <div className="flex space-x-4 p-4">
        <div className="flex-shrink-0">
          {hasImage ? (
            <img
              src={imageUrl}
              alt={article.title}
              className="w-32 h-24 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
              onError={handleImageError}
            />
          ) : (
            <div className={`w-32 h-24 ${randomColor} rounded-lg flex items-center justify-center`}>
              <span className="text-2xl font-bold text-gray-700">{placeholderText}</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <span className="inline-block bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs font-medium">
              {article.category}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {article.title}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{article.summary}</p>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <FaUser size={14} />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center space-x-1">
              <FaClock size={14} />
              <span>{format(publishedDate, 'dd/MM/yyyy HH:mm', { locale: vi })}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default NewsCard;