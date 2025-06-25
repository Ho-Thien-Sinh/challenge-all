import * as React from 'react';
import { useEffect } from 'react';

const App = () => {
  useEffect(() => {
    console.log('App component mounted');
    console.log('Environment:', import.meta.env.MODE);
    console.log('API URL:', import.meta.env.VITE_API_URL);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">Ứng dụng đang chạy!</h1>
        <p className="text-lg mb-4">Đây là một component đơn giản để kiểm tra.</p>
        <div className="bg-gray-100 p-4 rounded-md text-left">
          <p className="font-mono text-sm">Environment: {import.meta.env.MODE}</p>
          <p className="font-mono text-sm">API URL: {import.meta.env.VITE_API_URL}</p>
        </div>
      </div>
    </div>
  );
};

export default App;
