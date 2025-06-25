export interface Article {
  id?: string;
  title: string;
  content: string;
  // Use url instead of source_url for consistency
  url: string;
  source_url?: string; // Kept for backward compatibility
  image_url?: string;
  published_at: string | Date;
  publishedAt?: string | Date; // Added for compatibility
  category: string;
  summary?: string;
  author?: string;
  source?: string;
  created_at?: string | Date;
  updated_at?: string | Date;
  status?: 'published' | 'draft' | 'deleted';
  
  // Additional fields from tuoitre.vn
  tags?: string[];
  
  // Statistics - using both versions for compatibility
  view_count?: number;
  like_count?: number;
  comment_count?: number;
  views?: number;
  likes?: number;
  comments?: number;
  
  // Fields for featured content
  is_featured?: boolean;
  featured_badge?: boolean;
  featured_order?: number | null;
  
  // URL and description fields
  link?: string; // Kept for compatibility
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
