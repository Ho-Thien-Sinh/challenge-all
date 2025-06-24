import { memo, useEffect, useCallback, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
  slug: string;
}

const Categories: React.FC = memo(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check if a category is currently active
  const isActive = useCallback(
    (path: string) => location.pathname === `/tin-tuc/${path}`,
    [location.pathname]
  );
  
  // Handle category click with navigation
  const handleCategoryClick = useCallback((slug: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate(`/tin-tuc/${slug}`);
  }, [navigate]);

  // Fetch categories on component mount
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const apiUrl = new URL(`${import.meta.env.VITE_API_URL}/api/v1/categories`);
        
        // Thêm API key vào query parameter
        const apiKey = import.meta.env.VITE_API_KEY || 'news_app_12345_secure_key_67890';
        
        // Tạo URL mới để tránh lặp lại query parameters
        const finalUrl = new URL(apiUrl.toString());
        finalUrl.searchParams.set('apikey', apiKey);
        
        console.log('Fetching categories with API key:', apiKey);
        console.log('Final URL:', finalUrl.toString());
        
        const response = await fetch(finalUrl.toString(), {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          cache: 'default',
          signal: controller.signal,
          // Thêm header Authorization nếu cần
          // 'Authorization': `Bearer ${apiKey}`
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || 
            `Lỗi ${response.status}: Không thể tải danh mục`
          );
        }
        
        const data = await response.json();
        
        if (isMounted) {
          setCategories(Array.isArray(data) ? data : []);
        }
      } catch (err: unknown) {
        // Ignore AbortError as it's expected during component unmount
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        
        console.error('Lỗi khi tải danh mục:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tải danh mục');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCategories().catch(error => {
      if (error.name !== 'AbortError') {
        console.error('Unhandled error in fetchCategories:', error);
      }
    });
    
    // Cleanup function
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  // Memoize categories to prevent unnecessary re-renders
  const memoizedCategories = useMemo(() => categories, [categories]);

  if (loading) return <div className="text-center py-4">Đang tải danh mục...</div>;
  if (error) return <div className="text-red-500 text-center py-4">Lỗi: {error}</div>;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Danh mục</h2>
      <ul className="space-y-2">
        {memoizedCategories.map((category) => (
          <li key={category.id}>
            <button
              onClick={() => handleCategoryClick(category.slug)}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                isActive(category.slug)
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
});

export default Categories;
