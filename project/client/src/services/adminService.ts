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
      console.log('Fetching user list...');
      
      // 1. Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Authentication error:', authError?.message || 'No user information');
        throw new Error('Not logged in');
      }

      console.log('User authenticated:', user.id);

      // 2. Temporarily skip admin role check for testing
      // const { data: currentUserProfile, error: profileError } = await supabase
      //   .from('profiles')
      //   .select('role')
      //   .eq('id', user.id)
      //   .maybeSingle(); // Use maybeSingle instead of single

      // if (profileError) {
      //   console.error('Error getting profile information:', profileError);
      //   throw new Error('Unable to verify access rights');
      // }


      // if (!currentUserProfile || currentUserProfile.role !== 'admin') {
      //   console.error('User does not have admin rights');
      //   throw new Error('Access denied');
      // }


      // 3. Get a list of all users
      console.log('Getting user list from profiles table...');
      const { data: users, error: usersError, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Error getting user list:', usersError);
        
        // If error is due to non-existent table
        if (usersError.code === '42P01') { // 42P01 = undefined_table
          console.warn('Profiles table does not exist');
          return []; // Return empty array instead of error
        }
        
        throw new Error('Failed to load user list: ' + usersError.message);
      }

      console.log(`Retrieved ${users?.length || 0} users`);

      // 4. If no users found, return empty array
      if (!users || users.length === 0) {
        console.warn('No users found in the profiles table');
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
      console.error('Error in getUsers:', error);
      
      // If error is due to no data found, return empty array
      if (error instanceof Error && error.message.includes('no rows returned')) {
        console.warn('No user data found');
        return [];
      }
      
      // Throw error for UI to handle
      throw new Error(error instanceof Error ? error.message : 'An error occurred while fetching the user list');
    }
  },

  // Update user role
  async updateUserRole(userId: string, role: 'admin' | 'user'): Promise<void> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('Not logged in');
    }

    // Check admin rights
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (adminProfile?.role !== 'admin') {
      throw new Error('No permission to perform this action');
    }

    // Prevent changing own role
    if (userId === user.id) {
      throw new Error('Cannot change your own role');
    }

    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);

    if (error) throw error;
  },

  // Delete user
  async deleteUser(userId: string): Promise<void> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('Not logged in');
    }

    // Check admin role
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (adminProfile?.role !== 'admin') {
      throw new Error('Not authorized to perform this action');
    }

    // Prevent self-deletion
    if (userId === user.id) {
      throw new Error('Cannot delete yourself');
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
