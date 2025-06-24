export interface Article {
  id?: string;
  title: string;
  content: string;
  // Sử dụng url thay vì source_url để thống nhất
  url: string;
  source_url?: string; // Giữ lại để tương thích ngược
  image_url?: string;
  published_at: string | Date;
  publishedAt?: string | Date; // Thêm cho tương thích
  category: string;
  summary?: string;
  author?: string;
  source?: string;
  created_at?: string | Date;
  updated_at?: string | Date;
  status?: 'published' | 'draft' | 'deleted';
  
  // Các trường bổ sung từ tuoitre.vn
  tags?: string[];
  
  // Thống kê - sử dụng cả 2 phiên bản để tương thích
  view_count?: number;
  like_count?: number;
  comment_count?: number;
  views?: number;
  likes?: number;
  comments?: number;
  
  // Các trường cho tính năng nổi bật
  is_featured?: boolean;
  featured_badge?: boolean;
  featured_order?: number | null;
  
  // Các trường URL và mô tả
  link?: string; // Giữ lại cho tương thích
  description?: string;
}

export interface CrawlerStats {
  totalCrawled: number;
  success: number;
  failed: number;
  startTime: Date | null;
  endTime: Date | null;
  errors: Error[];
  pagesCrawled: number;
  articlesFound: number;
  articlesSaved: number;
  status: 'running' | 'idle' | 'paused' | 'stopped' | 'error';
}

export interface CrawlerOptions {
  maxConcurrent?: number;
  delayMs?: number;
  maxRetries?: number;
  batchSize?: number;
  pagesToCrawl?: number;
  delay?: number;
  timeout?: number;
  retries?: number;
  userAgent?: string;
  concurrentRequests?: number;
  debug?: boolean;
}

export interface CrawlerStats {
  totalCrawled: number;
  success: number;
  failed: number;
  startTime: Date | null;
  endTime: Date | null;
  errors: Error[];
  pagesCrawled: number;
  articlesFound: number;
  articlesSaved: number;
  status: 'running' | 'idle' | 'paused' | 'stopped' | 'error';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
