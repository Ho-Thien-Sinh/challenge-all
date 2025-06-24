import { memo, useCallback, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  X, 
  User, 
  Home,
  Clock, 
  Star, 
  ThumbsUp, 
  Globe,
  Briefcase,
  BookOpen,
  HeartPulse,
  Smile,
  Atom,
  Plane,
  Car
} from 'lucide-react'; 
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { categories } from '../categories';

interface HeaderProps {
  // Không cần prop onMenuToggle nữa
}

// Tạo danh sách các icon tương ứng với từng danh mục
const CATEGORY_ICONS: Record<string, any> = {
  'thoi-su': Clock,
  'the-gioi': Globe,
  'the-thao': ThumbsUp,
  'giai-tri': Smile,
  'cong-nghe': Atom,
  'suc-khoe': HeartPulse,
  'kinh-doanh': Briefcase,
  'giao-duc': BookOpen,
  'khoa-hoc': Atom,
  'du-lich': Plane,
  'xe': Car,
};

// Tạo NAV_ITEMS từ danh sách categories đã import
const NAV_ITEMS = [
  { path: '/', name: 'Trang chủ', icon: Home },
  ...categories.map(category => ({
    path: category.path,
    name: category.name,
    icon: CATEGORY_ICONS[category.slug] || Globe // Mặc định dùng Globe nếu không tìm thấy icon
  }))
];

const Header: React.FC<HeaderProps> = memo(() => {
  const location = useLocation();
  const { user, signOut, getUserDisplayName } = useAuth();
  const navigate = useNavigate();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  // Xử lý đăng xuất
  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      setIsUserMenuOpen(false);
      navigate('/login');
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
    }
  }, [signOut, navigate]);

  // Đóng menu user khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Tự động focus vào ô tìm kiếm khi mở
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  // Kiểm tra đường dẫn hiện tại có trùng với menu không
  const isActive = (path: string) => 
    location.pathname === path || 
    (path !== '/' && location.pathname.startsWith(path));

  // Xử lý tìm kiếm
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      navigate(`/tim-kiem?q=${encodeURIComponent(trimmedQuery)}`);
      setSearchQuery('');
      setIsSearchExpanded(false);
    }
  }, [navigate, searchQuery]);

  const toggleSearch = useCallback(() => {
    setIsSearchExpanded(!isSearchExpanded);
  }, [isSearchExpanded]);

  const toggleUserMenu = useCallback(() => {
    setIsUserMenuOpen(!isUserMenuOpen);
  }, [isUserMenuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-red-700 text-white shadow-md">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link 
              to="/" 
              className="text-white font-bold text-xl"
            >
              Báo Mới
            </Link>
          </div>
          
          {/* Menu chính - Desktop */}
          <nav className="hidden md:flex space-x-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive(item.path)
                    ? 'bg-red-800 text-white' 
                    : 'text-white hover:bg-red-600'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Phần tìm kiếm và tài khoản */}
          <div className="flex items-center space-x-3">
            {/* Nút tìm kiếm - Mobile */}
            <button 
              onClick={toggleSearch}
              className="md:hidden p-2 rounded-full text-white hover:bg-red-600"
              aria-label="Tìm kiếm"
            >
              {isSearchExpanded ? (
                <X className="h-5 w-5" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </button>

            {/* Ô tìm kiếm - Desktop */}
            <div className="hidden md:flex items-center">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm..."
                  className="w-48 px-3 py-1.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  aria-label="Tìm kiếm tin tức"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label="Tìm kiếm"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>
            </div>

            {/* Menu tài khoản */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={toggleUserMenu}
                className="p-1.5 rounded-full text-white hover:bg-red-600"
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
                aria-label="Tài khoản"
              >
                <User className="h-6 w-6" />
              </button>
              
              {/* Dropdown tài khoản */}
              {isUserMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu"
                >
                  {user ? (
                    <>
                      <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        <div className="font-medium">{getUserDisplayName()}</div>
                        <div className="text-gray-500 truncate">{user.email}</div>
                      </div>
                      <Link
                        to="/tai-khoan"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Tài khoản của tôi
                      </Link>
                      <Link
                        to="/bai-viet-da-luu"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Bài viết đã lưu
                      </Link>
                      <div className="border-t border-gray-100"></div>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        Đăng xuất
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                        role="menuitem"
                      >
                        Đăng nhập
                      </Link>
                      <Link
                        to="/register"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                        role="menuitem"
                      >
                        Đăng ký tài khoản
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu button */}

          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div 
        className={cn(
          'md:hidden bg-white transition-all duration-300 overflow-hidden',
          isSearchExpanded ? 'max-h-20 border-t border-gray-100' : 'max-h-0'
        )}
        id="mobile-search"
        aria-hidden={!isSearchExpanded}
      >
        <div className="px-4 py-3">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tìm kiếm tin tức..."
              aria-label="Tìm kiếm tin tức"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              aria-label="Gửi tìm kiếm"
            >
              Tìm
            </button>
          </form>
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;
