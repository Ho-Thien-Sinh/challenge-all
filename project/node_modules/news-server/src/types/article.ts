/**
 * Định nghĩa kiểu dữ liệu cho bài viết
 */
export interface Article {
    id: number | string;
    title: string;
    slug?: string;
    summary?: string;  // Alias for excerpt
    excerpt?: string;  // For backward compatibility
    content: string;
    image_url: string;  // Changed from 'image' to match database
    image?: string;    // For backward compatibility
    url: string;       // Main URL field that matches the database
    link?: string;     // For backward compatibility
    source_url: string; // Changed from 'source' to match database
    source?: string;   // For backward compatibility
    author: string;
    category: string;
    status: 'draft' | 'published' | 'archived';
    published_at: string; // Made required to match database
    publishedAt?: string; // For backward compatibility
    created_at: string;   // Made required to match database
    createdAt?: string;   // For backward compatibility
    updated_at: string;   // Made required to match database
    updatedAt?: string;   // For backward compatibility
    // Các trường tùy chọn
    tags?: string[];
    views?: number;
    view_count?: number;
    likes?: number;
    like_count?: number;
    comments?: number;
    comment_count?: number;
    is_featured?: boolean;
    // Các trường bổ sung
    category_id?: number;
    original_id?: string;
    // Các trường mở rộng
    [key: string]: any;
}

/**
 * Định nghĩa kiểu dữ liệu cho danh mục
 */
export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    parent_id?: string | null;
    order?: number;
    created_at: string;
    updated_at: string;
}

/**
 * Định nghĩa kiểu dữ liệu cho phản hồi API
 */
export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
    meta?: {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
    };
}

/**
 * Định nghĩa kiểu dữ liệu cho phân trang
 */
export interface PaginationParams {
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    search?: string;
    category?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
}
