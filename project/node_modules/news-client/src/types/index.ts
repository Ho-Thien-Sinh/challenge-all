export interface Category {
  slug: string;
  name: string;
  url: string;
}

export interface Article {
  id: string | number;
  title: string;
  excerpt: string;
  content?: string;
  // All possible image fields
  image?: string;
  image_url?: string;
  thumbnail_url?: string;
  thumbnail?: string;
  imageUrl?: string;
  imageURL?: string;
  thumbnailUrl?: string;
  thumbnailURL?: string;
  urlToImage?: string;
  url_to_image?: string;
  featured_image?: string;
  
  // URL and slug
  url?: string;
  slug?: string;
  
  // Metadata
  source?: string;
  published_at: string | Date;
  category: string;
  subcategory?: string;
  author: string;
  is_featured?: boolean;
  status?: string;
  created_at?: string;
  updated_at?: string;
  
  // For UI
  placeholder_color?: string;
  title_first_letter?: string;
  link?: string;
}
