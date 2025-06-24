import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load environment variables based on the current mode
  const env = loadEnv(mode, process.cwd(), '');

  // Log environment variables for debugging (excluding sensitive values)
  console.log('Environment Variables:', {
    VITE_API_URL: env.VITE_API_URL,
    VITE_SUPABASE_URL: env.VITE_SUPABASE_URL ? '***' : 'Not set',
    VITE_SUPABASE_ANON_KEY: env.VITE_SUPABASE_ANON_KEY ? '***' : 'Not set'
  });

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@types': path.resolve(__dirname, './src/types'),
        '@lib': path.resolve(__dirname, './src/lib'),
        '@contexts': path.resolve(__dirname, './src/contexts'),
      },
    },
    server: {
      port: 3000,
      host: true,
      cors: true,
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: false,
          rewrite: (path: string) => path.replace(/^\/api/, '')
        }
      }
    },
    preview: {
      port: 3000,
      host: true,
    },
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || 'http://localhost:5001'),
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || ''),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || ''),
    },
  };
});