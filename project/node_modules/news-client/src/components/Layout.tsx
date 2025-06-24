import { memo } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const Layout: React.FC = memo(() => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-1 pt-16 overflow-hidden">
        <main 
          className="h-full overflow-y-auto focus:outline-none"
          tabIndex={0} // Cho phép focus vào main để bàn phím có thể scroll
        >
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
});

Layout.displayName = 'Layout';

export default Layout;