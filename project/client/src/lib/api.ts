// Debug: Kiểm tra các biến môi trường
console.log('Environment Variables:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_API_KEY: import.meta.env.VITE_API_KEY ? '***' : 'MISSING',
  NODE_ENV: import.meta.env.MODE
});

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';
const API_KEY = import.meta.env.VITE_API_KEY || '';

if (!API_KEY) {
  console.error('LỖI: Không tìm thấy VITE_API_KEY trong biến môi trường');
  console.log('Các biến môi trường hiện có:', Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')));
}

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  console.log('[API] API Key:', API_KEY ? '***' : 'MISSING');
  console.log('[API] Base URL:', API_URL);
  
  try {
    // Tạo URL với API key
    const separator = url.includes('?') ? '&' : '?';
    const apiKeyParam = `apikey=${encodeURIComponent(API_KEY)}`;
    
    // Kiểm tra nếu URL đã có query parameters
    const hasExistingParams = url.includes('?');
    const urlWithKey = hasExistingParams 
      ? `${url}&${apiKeyParam}`
      : `${url}${separator}${apiKeyParam}`;
    
    const fullUrl = `${API_URL}${urlWithKey}`;
    
    console.log('[API] Making request to:', fullUrl);
    
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      credentials: 'include' // Đảm bảo gửi cả cookies nếu cần
    });
    
    console.log('[API] Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `HTTP error! status: ${response.status}`
      }));
      console.error('API Error:', errorData); // Debug
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  message?: string;
  error?: string;
}

export const getArticles = async (params: URLSearchParams | { 
  category?: string; 
  page?: number; 
  limit?: number;
  q?: string;
} = {}): Promise<ApiResponse<any>> => {
  try {
    const searchParams = new URLSearchParams();
    const apiUrl = '/articles';
    
    // Xử lý tham số đầu vào
    if (params instanceof URLSearchParams) {
      // Tạo URL với các tham số từ URLSearchParams
      const queryString = params.toString();
      const fullUrl = queryString ? `${apiUrl}?${queryString}` : apiUrl;
      
      console.log('[API] Fetching articles with URLSearchParams:', fullUrl);
      
      const response = await fetchWithAuth(fullUrl);
      console.log('[API] Raw response:', response);
      
      // Đảm bảo response có cấu trúc ApiResponse
      if (response && typeof response === 'object' && 'success' in response) {
        const apiResponse = response as ApiResponse<any>;
        console.log(`[API] Success: ${apiResponse.success}, Data length: ${Array.isArray(apiResponse.data) ? apiResponse.data.length : 'N/A'}`);
        return apiResponse;
      }
      
      // Nếu response là mảng (kiểu cũ), chuyển đổi sang định dạng mới
      if (Array.isArray(response)) {
        console.log('[API] Legacy array response detected, converting to new format');
        return {
          success: true,
          data: response,
          pagination: {
            page: 1,
            limit: response.length,
            total: response.length,
            total_pages: 1
          }
        };
      }
      
      // Nếu không phải mảng cũng không phải đối tượng hợp lệ
      throw new Error('Định dạng dữ liệu không hợp lệ từ máy chủ');
    } else {
      // Tạo URLSearchParams từ đối tượng tham số
      if (params.category) {
        searchParams.append('category', params.category);
        console.log('[API] Category filter:', params.category);
      }
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.q) searchParams.append('q', params.q);
      
      const queryString = searchParams.toString();
      const fullUrl = queryString ? `${apiUrl}?${queryString}` : apiUrl;
      
      console.log('[API] Fetching articles with params:', {
        url: fullUrl,
        params: Object.fromEntries(searchParams.entries())
      });
      
      const response = await fetchWithAuth(fullUrl);
      console.log('[API] Raw response:', response);
      
      // Xử lý tương tự như trên
      if (response && typeof response === 'object' && 'success' in response) {
        const apiResponse = response as ApiResponse<any>;
        console.log(`[API] Success: ${apiResponse.success}, Data length: ${Array.isArray(apiResponse.data) ? apiResponse.data.length : 'N/A'}`);
        return apiResponse;
      }
      
      if (Array.isArray(response)) {
        console.log('[API] Legacy array response detected, converting to new format');
        return {
          success: true,
          data: response,
          pagination: {
            page: params.page || 1,
            limit: params.limit || response.length,
            total: response.length,
            total_pages: Math.ceil(response.length / (params.limit || response.length))
          }
        };
      }
      
      throw new Error('Định dạng dữ liệu không hợp lệ từ máy chủ');
    }
  } catch (error) {
    console.error('Error in getArticles:', error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Không thể tải bài viết. Vui lòng thử lại sau.'
    };
  }
};

export const searchArticles = async (query: string, page: number = 1, limit: number = 10) => {
  const params = new URLSearchParams({
    q: query,
    page: page.toString(),
    limit: limit.toString()
  });
  
  return fetchWithAuth(`/search?${params.toString()}`);
};
