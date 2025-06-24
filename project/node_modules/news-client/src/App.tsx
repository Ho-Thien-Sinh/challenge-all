import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/Layout';
import Home from './pages/Home';
import ArticleDetail from './pages/ArticleDetail';
import Search from './pages/Search';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import CategoryPage from './pages/CategoryPage';
import NotFound from './pages/NotFound';
import { categories } from './categories';
import CheckArticlesPage from './pages/CheckArticlesPage';

// Create the router configuration
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFound />, // Hiển thị trang 404 khi có lỗi
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { 
        path: 'article/:id', 
        element: <ArticleDetail />,
        errorElement: <div className="p-4 text-red-600">Không tìm thấy bài viết</div>
      },
      { 
        path: 'search', 
        element: <Search />,
        errorElement: <div className="p-4 text-red-600">Lỗi tìm kiếm</div>
      },
      { 
        path: 'profile', 
        element: <Profile />,
        errorElement: <div className="p-4 text-red-600">Lỗi tải trang cá nhân</div>
      },
      // Generate routes for each category
      ...categories.map(category => ({
        path: category.path.slice(1), // Remove leading slash
        element: <CategoryPage categorySlug={category.slug} />,
        errorElement: <div className="p-4 text-red-600">Lỗi tải danh mục</div>
      })),
      // Route kiểm tra dữ liệu bài viết
      { path: '/check-articles', element: <CheckArticlesPage /> },
      
      // Catch all other routes
      { path: '*', element: <NotFound /> }
    ],
  },
]);

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <RouterProvider router={router} />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </AuthProvider>
  );
}

export default App