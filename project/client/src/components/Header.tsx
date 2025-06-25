import { memo, useCallback, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaSearch, FaTimes, FaUser, FaHome } from 'react-icons/fa';
import { categories } from '../categories';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  // No need for onMenuToggle prop anymore
}

// Create NAV_ITEMS from the imported categories list
const NAV_ITEMS = [
  { path: '/', name: 'Trang chủ', icon: FaHome },
  ...categories.map(category => ({
    path: category.path,
    name: category.name,
    icon: category.icon
  }))
];

const Header: React.FC<HeaderProps> = memo(() => {
  console.log('Header rendering...');
  console.log('Current path:', window.location.pathname);
  const location = useLocation();
  const { user, signOut, getUserDisplayName, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  // Define icon components with proper typing
  const SearchIcon = FaSearch;
  const XIcon = FaTimes;
  const UserIcon = FaUser;

  // Handle sign out
  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      setIsUserMenuOpen(false);
      navigate('/login');
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
    }
  }, [signOut, navigate]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  // Check if current path matches menu item
  const isActive = (path: string) => 
    location.pathname === path || 
    (path !== '/' && location.pathname.startsWith(path));

  // Handle search
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

  // Function to close user menu
  const closeUserMenu = useCallback(() => {
    setIsUserMenuOpen(false);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-red-700 text-white shadow-md">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-white font-bold text-xl">
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
                <XIcon className="h-5 w-5" />
              ) : (
                <SearchIcon className="h-5 w-5" />
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
                  <SearchIcon className="h-4 w-4" />
                </button>
              </form>
            </div>

            {/* Menu tài khoản */}
            {user ? (
              <div className="flex items-center space-x-2">
                {isAdmin && (
                  <>
                    <Link
                      to="/them-bai-bao"
                      className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 text-sm rounded-full bg-white text-red-700 font-medium hover:bg-red-50 hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 border border-red-200"
                    >
                      <span className="text-base">+</span>
                      <span>Bài viết mới</span>
                    </Link>
                    <Link
                      to="/quan-ly-tai-khoan"
                      className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 text-sm rounded-full bg-red-800 text-white font-medium hover:bg-red-900 hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 border border-red-700"
                    >
                      <UserIcon className="h-3.5 w-3.5" />
                      <span>Quản lý tài khoản</span>
                    </Link>
                  </>
                )}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-2 p-2 rounded-full hover:bg-red-600 transition-colors"
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                    aria-label="Tài khoản"
                  >
                    <UserIcon className="h-6 w-6" />
                    <span className="hidden md:inline">{getUserDisplayName()}</span>
                  </button>
                  
                  {/* Dropdown tài khoản */}
                  {isUserMenuOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu"
                    >
                      <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        <div className="font-medium">{getUserDisplayName()}</div>
                        <div className="text-gray-500 truncate">{user.email}</div>
                      </div>
                      <Link
                        to="/tai-khoan"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                        onClick={closeUserMenu}
                      >
                        Tài khoản của tôi
                      </Link>
                      <Link
                        to="/bai-viet-da-luu"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                        onClick={closeUserMenu}
                      >
                        Bài viết đã lưu
                      </Link>
                      <div className="border-t border-gray-100"></div>
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => navigate('/them-bai-bao')}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Bài viết mới
                          </button>
                          <button
                            onClick={() => navigate('/quan-ly-tai-khoan')}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Quản lý tài khoản
                          </button>
                        </>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3 py-2 text-sm font-medium text-white hover:bg-red-600 rounded-md"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-2 text-sm font-medium text-white bg-red-800 hover:bg-red-900 rounded-md"
                >
                  Đăng ký
                </Link>
              </div>
            )}
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
