import { useEffect, memo, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Categories from './Categories';
import { 
  FaHome,
  FaGlobe,
  FaBriefcase,
  FaBolt,
  FaBookOpen,
  FaHeartbeat,
  FaSmile,
  FaAtom,
  FaPlane,
  FaCar,
  FaTimes
} from 'react-icons/fa';

// Styles are now in CSS modules

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = memo(({ isOpen, onClose }) => {
  const location = useLocation();

  // Close menu when page changes
  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  const navItems = [
    { 
      path: '/',
      name: 'Trang chủ',
      icon: FaHome
    },
    { 
      path: '/the-gioi',
      name: 'Thế giới',
      icon: FaGlobe
    },
    { 
      path: '/kinh-doanh',
      name: 'Kinh doanh',
      icon: FaBriefcase
    },
    { 
      path: '/the-thao',
      name: 'Thể thao',
      icon: FaBolt
    },
    { 
      path: '/giao-duc',
      name: 'Giáo dục',
      icon: FaBookOpen
    },
    { 
      path: '/suc-khoe',
      name: 'Sức khỏe',
      icon: FaHeartbeat
    },
    { 
      path: '/giai-tri',
      name: 'Giải trí',
      icon: FaSmile
    },
    { 
      path: '/khoa-hoc',
      name: 'Khoa học',
      icon: FaAtom
    },
    { 
      path: '/du-lich',
      name: 'Du lịch',
      icon: FaPlane
    },
    { 
      path: '/xe',
      name: 'Xe',
      icon: FaCar
    },
  ] as const;

  // Memoize the nav items to prevent unnecessary re-renders
  const memoizedNavItems = useCallback(() => {
    return navItems.map((item) => (
      <li key={item.path}>
        <NavLink
          to={item.path}
          className={({ isActive }) =>
            `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            } group/item overflow-hidden whitespace-nowrap`
          }
        >
          <item.icon className="w-5 h-5 flex-shrink-0" />
          <span className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {item.name}
          </span>
        </NavLink>
      </li>
    ));
  }, [location.pathname]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
          aria-label="Đóng menu"
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full bg-white z-50 transform transition-all duration-300 ease-in-out w-16 hover:w-64 group ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:shadow-none overflow-hidden flex flex-col`}
        aria-label="Menu chính"
      >
        <div className="p-4 border-b flex items-center justify-between h-16">
          <h2 className="text-xl font-bold text-gray-800 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">Menu</h2>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
            aria-label="Đóng menu"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <style>
            {`
              .sidebar-scroll-container {
                max-height: calc(100vh - 4rem);
                overflow-y: auto;
                scrollbar-width: thin;
                scrollbar-color: #cbd5e0 #f7fafc;
                scroll-behavior: smooth;
              }
              
              .sidebar-scroll-container::-webkit-scrollbar {
                width: 6px;
              }
              
              .sidebar-scroll-container::-webkit-scrollbar-track {
                background: #f7fafc;
              }
              
              .sidebar-scroll-container::-webkit-scrollbar-thumb {
                background-color: #cbd5e0;
                border-radius: 3px;
                transition: background-color 0.2s ease-in-out;
              }
              
              .sidebar-scroll-container::-webkit-scrollbar-thumb:hover {
                background-color: #a0aec0;
              }
            `}
          </style>
          <div className="sidebar-scroll-container">
            <nav className="p-2">
              <ul className="space-y-1">
                {memoizedNavItems()}
              </ul>
            </nav>

            <div className="p-4 border-t">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Danh mục
              </h3>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Categories />
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
