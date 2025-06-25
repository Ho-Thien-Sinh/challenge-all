import { IconType } from 'react-icons';

export interface Category {
  slug: string;
  name: string;
  path: string;
  icon: IconType;
}

import { 
  FaClock, 
  FaGlobe, 
  FaFutbol, 
  FaSmile, 
  FaLaptopMedical, 
  FaBriefcase, 
  FaBookOpen, 
  FaAtom, 
  FaPlane, 
  FaCar,
  FaHeartbeat 
} from 'react-icons/fa';

export const categories: Category[] = [
  { slug: 'thoi-su', name: 'Thời sự', path: '/thoi-su', icon: FaClock },
  { slug: 'the-gioi', name: 'Thế giới', path: '/the-gioi', icon: FaGlobe },
  { slug: 'the-thao', name: 'Thể thao', path: '/the-thao', icon: FaFutbol },
  { slug: 'giai-tri', name: 'Giải trí', path: '/giai-tri', icon: FaSmile },
  { slug: 'cong-nghe', name: 'Công nghệ', path: '/cong-nghe', icon: FaLaptopMedical },
  { slug: 'suc-khoe', name: 'Sức khỏe', path: '/suc-khoe', icon: FaHeartbeat },
  { slug: 'kinh-doanh', name: 'Kinh doanh', path: '/kinh-doanh', icon: FaBriefcase },
  { slug: 'giao-duc', name: 'Giáo dục', path: '/giao-duc', icon: FaBookOpen },
  { slug: 'khoa-hoc', name: 'Khoa học', path: '/khoa-hoc', icon: FaAtom },
  { slug: 'du-lich', name: 'Du lịch', path: '/du-lich', icon: FaPlane },
  { slug: 'xe', name: 'Xe', path: '/xe', icon: FaCar }
];

export const getCategoryBySlug = (slug: string): Category | undefined => {
  return categories.find(cat => cat.slug === slug);
};
