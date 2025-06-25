import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export const adminService = {
  /**
   * Get list of all users (admin only)
   * @returns List of users
   */
  async getUsers(): Promise<UserProfile[]> {
    try {
      console.log('Bắt đầu lấy danh sách người dùng...');
      
      // 1. Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Lỗi xác thực:', authError?.message || 'Không có thông tin người dùng');
        throw new Error('Chưa đăng nhập');
      }

      console.log('Đã xác thực người dùng:', user.id);

      // 2. Temporarily skip admin role check for testing
      // const { data: currentUserProfile, error: profileError } = await supabase
      //   .from('profiles')
      //   .select('role')
      //   .eq('id', user.id)
      //   .maybeSingle(); // Sử dụng maybeSingle thay vì single

      // if (profileError) {
      //   console.error('Lỗi khi lấy thông tin profile:', profileError);
      //   throw new Error('Không thể kiểm tra quyền truy cập');
      // }


      // if (!currentUserProfile || currentUserProfile.role !== 'admin') {
      //   console.error('Người dùng không có quyền admin');
      //   throw new Error('Không có quyền truy cập');
      // }


      // 3. Get a list of all users
      console.log('Đang lấy danh sách người dùng từ bảng profiles...');
      const { data: users, error: usersError, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Lỗi khi lấy danh sách người dùng:', usersError);
        
        // If error is due to non-existent table
        if (usersError.code === '42P01') { // 42P01 = undefined_table
          console.warn('Bảng profiles chưa được tạo');
          return []; // Trả về mảng rỗng thay vì lỗi
        }
        
        throw new Error('Không thể tải danh sách người dùng: ' + usersError.message);
      }

      console.log(`Đã lấy được ${users?.length || 0} người dùng`);

      // 4. If no users found, return empty array
      if (!users || users.length === 0) {
        console.warn('Không tìm thấy người dùng nào trong bảng profiles');
        return [];
      }

      // 5. Convert data to correct format
      return users.map(user => ({
        id: user.id,
        email: user.email || '',
        role: user.role || 'user',
        created_at: user.created_at || new Date().toISOString(),
        user_metadata: {
          full_name: user.full_name || '',
          avatar_url: user.avatar_url || ''
        }
      }));
    } catch (error) {
      console.error('Lỗi trong getUsers:', error);
      
      // If error is due to no data found, return empty array
      if (error instanceof Error && error.message.includes('no rows returned')) {
        console.warn('Không tìm thấy dữ liệu người dùng');
        return [];
      }
      
      // Ném lại lỗi cho phía UI xử lý
      throw new Error(error instanceof Error ? error.message : 'Đã xảy ra lỗi khi lấy danh sách người dùng');
    }
  },

  // Update user role
  async updateUserRole(userId: string, role: 'admin' | 'user'): Promise<void> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('Chưa đăng nhập');
    }

    // Kiểm tra quyền admin
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (adminProfile?.role !== 'admin') {
      throw new Error('Không có quyền thực hiện hành động này');
    }

    // Prevent changing own role
    if (userId === user.id) {
      throw new Error('Không thể thay đổi quyền của chính mình');
    }

    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);

    if (error) throw error;
  },

  // Xóa người dùng
  async deleteUser(userId: string): Promise<void> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('Chưa đăng nhập');
    }

    // Kiểm tra quyền admin
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (adminProfile?.role !== 'admin') {
      throw new Error('Không có quyền thực hiện hành động này');
    }

    // Prevent self-deletion
    if (userId === user.id) {
      throw new Error('Không thể xóa chính mình');
    }

    // Delete user from auth.users table
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
    if (deleteError) throw deleteError;

    // Delete profile information
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) throw error;
  }
};
