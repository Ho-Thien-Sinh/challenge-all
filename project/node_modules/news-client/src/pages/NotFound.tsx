import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Không tìm thấy trang</h2>
        <p className="text-gray-600 mb-6">
          Xin lỗi, chúng tôi không thể tìm thấy trang bạn đang tìm kiếm.
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Quay về trang chủ
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
