import { Request, Response } from 'express';
import { supabase } from '../services/supabase.js';
import bcrypt from 'bcrypt';

// Import the UserPayload type from our shared types
import { UserPayload } from '../types/auth.js';

// Extend the Express Request type to include our custom user property
declare module 'express-serve-static-core' {
  interface Request {
    user?: UserPayload;
    [key: string]: any; // Add index signature to allow any other properties
  }
}

// Lấy danh sách người dùng (có phân trang)
export const getUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Lấy tổng số người dùng
    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    // Lấy danh sách người dùng với phân trang
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, is_active, created_at, updated_at')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      data: users,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Tạo người dùng mới
export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password, full_name, role = 'user' } = req.body;

    // Kiểm tra xem email đã tồn tại chưa
    const { data: existingUser, error: existingError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo người dùng mới
    const { data: user, error } = await supabase
      .from('users')
      .insert([
        { 
          email, 
          password: hashedPassword, 
          full_name,
          role,
          is_active: true
        }
      ])
      .select('id, email, full_name, role, is_active, created_at')
      .single();

    if (error) throw error;

    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Lấy thông tin chi tiết người dùng
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Only admin or the user themselves can view the details
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ error: 'Not authorized to view this user' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, is_active, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Cập nhật thông tin người dùng
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, password, full_name, role, is_active, avatar_url } = req.body;
    
    // Only admin or the user themselves can update the information
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ error: 'Not authorized to update this user' });
    }

    // Chỉ admin mới được cập nhật role và trạng thái
    const updateData: any = { full_name, avatar_url };
    
    if (req.user.role === 'admin') {
      if (role !== undefined) updateData.role = role;
      if (is_active !== undefined) updateData.is_active = is_active;
    }

    // Nếu có mật khẩu mới, mã hóa lại
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Cập nhật thông tin
    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('id, email, full_name, role, is_active, avatar_url, created_at, updated_at')
      .single();

    if (error) throw error;

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Xóa người dùng
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Only admin can delete users
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete users' });
    }
    
    // Prevent deleting own account
    if (req.user.id === id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Xóa người dùng
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Đổi mật khẩu
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Lấy thông tin người dùng hiện tại
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('password')
      .eq('id', req.user.id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Kiểm tra mật khẩu hiện tại
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Mã hóa mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu mới
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', req.user.id);

    if (updateError) throw updateError;

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
