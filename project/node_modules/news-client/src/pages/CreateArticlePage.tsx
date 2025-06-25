import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { uploadFile } from '../lib/storage';

const CreateArticlePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('');
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // List of categories (can be fetched from database or hardcoded)
  const categories = [
    'Thời sự', 'Thế giới', 'Kinh doanh', 'Giải trí',
    'Thể thao', 'Pháp luật', 'Giáo dục', 'Sức khỏe',
    'Đời sống', 'Du lịch', 'Khoa học', 'Số hóa', 'Xe'
  ];

  // Using uploadFile function from storage service

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Bạn cần đăng nhập để đăng bài');
      return;
    }
    
    try {
      setIsPublishing(true);
      setError('');
      
      // Upload featured image if exists
      let imageUrl = '';
      if (featuredImage) {
        try {
          imageUrl = await uploadFile(featuredImage, 'articles');
          console.log('Ảnh đã được tải lên thành công:', imageUrl);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định';
          console.error('Lỗi khi tải ảnh lên:', errorMessage);
          setError(`Lỗi khi tải ảnh lên: ${errorMessage}`);
          setIsPublishing(false);
          return;
        }
      }
      
      // Call API to create new article in database
      const { data, error } = await supabase
        .from('articles')
        .insert([
          {
            title,
            content,
            excerpt: excerpt || content.substring(0, 200) + '...',
            category,
            image_url: imageUrl,
            author_id: user.id,
            status: 'published',
            slug: title.toLowerCase()
              .replace(/[^\w\s-]/g, '') // Remove special characters
              .replace(/\s+/g, '-') // Replace spaces with dashes
              .replace(/--+/g, '-') // Remove multiple consecutive dashes
              .substring(0, 100), // Limit length
          },
        ])
        .select();
      
      if (error) throw error;
      
      setSuccess(true);
      // Redirect to newly created article after 1.5s
      setTimeout(() => {
        navigate(`/bai-viet/${data[0].slug}`);
      }, 1500);
      
    } catch (err) {
      console.error('Lỗi khi đăng bài:', err);
      setError('Có lỗi xảy ra khi đăng bài. Vui lòng thử lại.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Viết bài mới</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md">
          Bài viết đã được đăng thành công! Đang chuyển hướng...
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Tiêu đề <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            placeholder="Nhập tiêu đề bài viết"
            required
          />
        </div>
        
        {/* Featured image */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Ảnh đại diện
          </label>
          <div className="mt-1 flex items-center">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFeaturedImage(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
            />
          </div>
          {featuredImage && (
            <div className="mt-2">
              <img 
                src={URL.createObjectURL(featuredImage)} 
                alt="Xem trước" 
                className="h-32 w-32 object-cover rounded-md"
              />
            </div>
          )}
        </div>
        
        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Danh mục <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            required
          >
            <option value="">Chọn danh mục</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        
        {/* Excerpt */}
        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
            Mô tả ngắn
          </label>
          <textarea
            id="excerpt"
            rows={3}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            placeholder="Mô tả ngắn về bài viết (nếu không nhập sẽ tự động lấy 200 ký tự đầu tiên của nội dung)"
          />
        </div>
        
        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Nội dung <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            placeholder="Viết nội dung bài viết của bạn tại đây..."
            required
          />
        </div>
        
        {/* Nút đăng bài */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isPublishing}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPublishing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang đăng...
              </>
            ) : 'Đăng bài'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateArticlePage;
