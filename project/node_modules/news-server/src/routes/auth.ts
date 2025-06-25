import { Router, Request, Response, NextFunction } from 'express';
import supabase from "../lib/supabase.js";
import { sendVerificationEmail, generateVerificationToken, authenticate } from '../lib/auth.js';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

// Kiểm tra xem có phải đang chạy trong môi trường ESM không
declare const __filename: string;
const isESM = typeof __filename !== 'undefined' && __filename.endsWith('.mjs');

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
});

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu là bắt buộc')
});

// Error handling middleware
const handleError = (err: unknown, res: Response) => {
  console.error('Auth Error:', err);
  if (err instanceof z.ZodError) {
    return res.status(400).json({ 
      error: 'Dữ liệu không hợp lệ',
      details: fromZodError(err).message 
    });
  } else if (err instanceof Error) {
    return res.status(500).json({ 
      error: err.message || 'Đã xảy ra lỗi hệ thống' 
    });
  }
  res.status(500).json({ error: 'Đã xảy ra lỗi hệ thống không xác định' });
};

const router = Router();

// Register user account
router.post('/register', async (req: Request, res: Response) => {
  try {
    // Validate input
    const { email, password } = registerSchema.parse(req.body);
    
    // Check if email exists
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
      
    if (existingUser) {
      return res.status(400).json({ error: 'Email đã được sử dụng' });
    }
    
    // Create auth user
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.FRONTEND_URL}/login`
      }
    });
    
    if (authError) throw authError;
    
    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        { 
          id: data.user?.id, 
          email,
          role: 'user',
          is_verified: false,
          created_at: new Date().toISOString()
        }
      ]);
      
    if (profileError) throw profileError;
    
    // Send verification email
    const verificationToken = generateVerificationToken();
    await supabase
      .from('users')
      .update({ verification_token: verificationToken })
      .eq('id', data.user?.id);
      
    await sendVerificationEmail(email, verificationToken);
    
    res.status(201).json({ 
      message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác minh tài khoản.' 
    });
  } catch (error) {
    handleError(error, res);
  }
});

// Request admin account
router.post('/request-admin', authenticate, async (req: Request, res: Response) => {
    try {
        // Check if req.user exists
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const userId = req.user.id;
        const verificationToken = generateVerificationToken();
        
        // Save verification token
        await supabase
            .from('users')
            .update({ verification_token: verificationToken })
            .eq('id', userId);
            
        // Send verification email
        await sendVerificationEmail(req.user.email, verificationToken);
        
        res.json({ message: 'Đã gửi yêu cầu đăng ký admin' });
    } catch (error) {
        console.error('Lỗi yêu cầu đăng ký admin:', error);
        res.status(500).json({ error: 'Lỗi xử lý yêu cầu' });
    }
});

// Verify admin account
router.get('/verify-admin', async (req: Request, res: Response) => {
    try {
        const { token } = req.query;
        
        // Find user with verification token
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('verification_token', token)
            .single();
            
        if (!user || error) {
            return res.status(400).json({ error: 'Token không hợp lệ' });
        }
        
        // Update admin role
        await supabase
            .from('users')
            .update({ 
                role: 'admin',
                is_verified: true,
                verification_token: null 
            })
            .eq('id', user.id);
            
        res.send('Tài khoản admin đã được kích hoạt thành công!');
    } catch (error) {
        console.error('Lỗi xác nhận admin:', error);
        res.status(500).json({ error: 'Lỗi xử lý yêu cầu' });
    }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    // Validate input
    const { email, password } = loginSchema.parse(req.body);
    
    // Authenticate user
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (authError) {
      return res.status(401).json({ 
        error: 'Email hoặc mật khẩu không đúng' 
      });
    }
    
    // Get user profile
    const { data: userData, error: profileError } = await supabase
      .from('users')
      .select('id, email, role, is_verified')
      .eq('id', data.user?.id)
      .single();
      
    if (profileError || !userData) {
      return res.status(404).json({ error: 'Không tìm thấy thông tin người dùng' });
    }
    
    if (!userData.is_verified) {
      return res.status(403).json({ 
        error: 'Tài khoản chưa được xác minh. Vui lòng kiểm tra email của bạn.' 
      });
    }
    
    // Set secure cookie with access token
    res.cookie('sb-access-token', data.session?.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });
    
    res.json({
      user: {
        id: userData.id,
        email: userData.email,
        role: userData.role
      }
    });
  } catch (error) {
    handleError(error, res);
  }
});

// Logout
router.post('/logout', authenticate, async (req: Request, res: Response) => {
  try {
    await supabase.auth.signOut();
    res.clearCookie('sb-access-token');
    res.json({ message: 'Đăng xuất thành công' });
  } catch (error) {
    handleError(error, res);
  }
});

// Get current user information
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, role, created_at')
      .eq('id', req.user.id)
      .single();
      
    if (error || !user) {
      return res.status(404).json({ error: 'Không tìm thấy thông tin người dùng' });
    }
    
    res.json(user);
  } catch (error) {
    handleError(error, res);
  }
});

export default router;
