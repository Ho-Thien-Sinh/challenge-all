import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
// Load biến môi trường từ file .env
dotenv.config();
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; // Sử dụng service role key
if (!supabaseUrl || !supabaseKey) {
    throw new Error('❌ Thiếu cấu hình Supabase. Vui lòng kiểm tra file .env');
}
console.log('🔐 Đang sử dụng service role key để kết nối Supabase');
// Define custom fetch function to disable cache
const customFetch = (input, init = {}) => {
    return fetch(input, {
        ...init,
        cache: 'no-store',
        headers: {
            ...(init.headers || {}),
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
    });
};
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
        storageKey: 'svc', // Key riêng cho service role
        storage: {
            getItem() {
                return null;
            },
            setItem() { },
            removeItem() { }
        },
        flowType: 'pkce'
    },
    global: {
        fetch: customFetch
    },
    db: {
        schema: 'public'
    }
});
// Clear any existing schema cache
if (typeof window !== 'undefined') {
    // @ts-ignore
    if (window.localStorage) {
        // @ts-ignore
        window.localStorage.removeItem('supabase.auth.token');
    }
}
// Export default để tương thích với import hiện tại
export default supabase;
