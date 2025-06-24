export interface Category {
  slug: string;
  name: string;
  path: string;
}

export const categories: Category[] = [
  { slug: 'thoi-su', name: 'Thời sự', path: '/thoi-su' },
  { slug: 'the-gioi', name: 'Thế giới', path: '/the-gioi' },
  { slug: 'the-thao', name: 'Thể thao', path: '/the-thao' },
  { slug: 'giai-tri', name: 'Giải trí', path: '/giai-tri' },
  { slug: 'cong-nghe', name: 'Công nghệ', path: '/cong-nghe' },
  { slug: 'suc-khoe', name: 'Sức khỏe', path: '/suc-khoe' },
  { slug: 'kinh-doanh', name: 'Kinh doanh', path: '/kinh-doanh' },
  { slug: 'giao-duc', name: 'Giáo dục', path: '/giao-duc' },
  { slug: 'khoa-hoc', name: 'Khoa học', path: '/khoa-hoc' },
  { slug: 'du-lich', name: 'Du lịch', path: '/du-lich' },
  { slug: 'xe', name: 'Xe', path: '/xe' }
];

export const getCategoryBySlug = (slug: string): Category | undefined => {
  return categories.find(cat => cat.slug === slug);
};
