import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabase';

// Initialize admin client
const supabaseAdmin = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Function to check admin status
const isAdmin = async (userId: string): Promise<boolean> => {
  try {
    // Check in profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    return profile?.role === 'admin';
  } catch (error) {
    console.error('Lỗi khi kiểm tra quyền admin:', error);
    return false;
  }
};

export { supabaseAdmin, isAdmin };
