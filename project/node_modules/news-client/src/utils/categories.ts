export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export const categories: Category[] = [
  { id: 'thoi-su', name: 'Thời sự', slug: 'thoi-su' },
  { id: 'the-gioi', name: 'Thế giới', slug: 'the-gioi' },
  { id: 'kinh-doanh', name: 'Kinh doanh', slug: 'kinh-doanh' },
  { id: 'khoa-hoc', name: 'Khoa học', slug: 'khoa-hoc' },
  { id: 'giai-tri', name: 'Giải trí', slug: 'giai-tri' },
  { id: 'the-thao', name: 'Thể thao', slug: 'the-thao' },
  { id: 'phap-luat', name: 'Pháp luật', slug: 'phap-luat' },
  { id: 'giao-duc', name: 'Giáo dục', slug: 'giao-duc' },
  { id: 'suc-khoe', name: 'Sức khỏe', slug: 'suc-khoe' },
  { id: 'doi-song', name: 'Đời sống', slug: 'doi-song' },
  { id: 'du-lich', name: 'Du lịch', slug: 'du-lich' },
  { id: 'cong-nghe', name: 'Công nghệ', slug: 'cong-nghe' },
  { id: 'xe', name: 'Xe', slug: 'xe' }
];

// Map from slug to full category name
export const getCategoryName = (slug: string): string => {
  const category = categories.find(cat => cat.slug === slug);
  return category ? category.name : 'Không xác định';
};

// Map from full name to slug
export const getCategorySlug = (name: string): string => {
  const category = categories.find(cat => cat.name === name);
  return category ? category.slug : '';
};

// Get category information from slug
export const getCategoryBySlug = (slug: string): Category | undefined => {
  return categories.find(cat => cat.slug === slug);
};

// Lấy thông tin danh mục từ tên
export const getCategoryByName = (name: string): Category | undefined => {
  return categories.find(cat => cat.name === name);
};

// Check if a slug is valid
export const isValidCategorySlug = (slug: string): boolean => {
  return categories.some(cat => cat.slug === slug);
};
