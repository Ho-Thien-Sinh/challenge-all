import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ArrowLeft, Clock, User, ExternalLink } from 'lucide-react';
import { toast } from 'react-toastify';
import { fetchWithAuth } from '../lib/api';

interface Article {
  id: string
  title: string
  content: string
  summary: string
  author: string
  category: string
  image_url?: string
  source_url: string
  published_at: string
}

const ArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchArticle(id);
    }
  }, [id]);

  const fetchArticle = async (articleId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchWithAuth(`/articles/${articleId}`);
      
      if (!data) {
        throw new Error('Không tìm thấy bài viết');
      }
      
      setArticle(data);
    } catch (err) {
      console.error('Lỗi khi tải bài viết:', err);
      setError('Không thể tải bài viết. Vui lòng thử lại sau.');
      toast.error('Không tìm thấy bài viết');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {error || 'Không tìm thấy bài viết'}
        </h1>
        <Link
          to="/"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Quay lại
        </Link>

        <article className="bg-white rounded-lg shadow-md overflow-hidden">
          {article.image_url && (
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-64 md:h-96 object-cover"
              onError={(e) => {
                // Fallback image nếu ảnh lỗi
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = 'https://via.placeholder.com/800x400?text=Không+có+ảnh';
              }}
            />
          )}

          <div className="p-6">
            <div className="flex flex-wrap items-center text-sm text-gray-500 mb-4 gap-4">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                <span>{article.author || 'Không rõ tác giả'}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <time dateTime={article.published_at}>
                  {format(new Date(article.published_at), 'PPP', { locale: vi })}
                </time>
              </div>
              {article.category && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                  {article.category}
                </span>
              )}
              {article.source_url && (
                <a
                  href={article.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline flex items-center"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Nguồn
                </a>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {article.title}
            </h1>

            {article.summary && (
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-blue-800 mb-2">Tóm tắt:</h3>
                <p className="text-gray-700">{article.summary}</p>
              </div>
            )}

            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: article.content || '<p class="text-gray-500 italic">Không có nội dung</p>' 
              }} 
            />
          </div>
        </article>
      </div>
    </div>
  )
}

export default ArticleDetail