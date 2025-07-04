import { Router, Request, Response, NextFunction } from 'express';
import supabase from "../lib/supabase.js";
import { generateVerificationToken, authenticate } from '../lib/auth.js';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';

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

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'your_jwt_secret';

// Register user account
router.post('/register', async (req: Request, res: Response) => {
  try {
    console.log('Bắt đầu đăng ký');
    // Validate input
    const { email, password } = registerSchema.parse(req.body);
    console.log('Validate xong:', email);
    
    // Check if email exists
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    console.log('Kiểm tra email xong:', existingUser);
    
    if (existingUser) {
      console.log('Email đã tồn tại:', email);
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
    console.log('Tạo user trên Supabase xong:', data, authError);
    
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
    console.log('Tạo profile user xong', profileError);
    
    if (profileError) throw profileError;
    
    // Send verification email
    // Nếu cần logic xác thực email, hãy dùng Supabase hoặc dịch vụ khác
    res.status(201).json({ success: true, message: 'Đăng ký thành công. Vui lòng xác thực OTP.' });
    console.log('Trả về response thành công');
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ success: false, message: 'Lỗi server khi đăng ký', error: error.message });
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
        // Nếu cần logic xác thực email, hãy dùng Supabase hoặc dịch vụ khác
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
    
    // @ts-expect-error: TypeScript type issue with jsonwebtoken
    const token = jwt.sign(
      { id: userData.id, email: userData.email, role: userData.role },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );
    
    // Set secure cookie với access token của Supabase (nếu muốn giữ)
    res.cookie('sb-access-token', data.session?.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });
    
    // Trả về user info và JWT
    res.json({
      user: {
        id: userData.id,
        email: userData.email,
        role: userData.role
      },
      token
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

// Hàm sinh OTP 6 số
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Endpoint gửi OTP qua Supabase
router.post('/send-otp', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Email không hợp lệ' });
    }
    // Gửi OTP qua Supabase
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true, // hoặc false nếu chỉ cho phép user đã tồn tại
        emailRedirectTo: process.env.FRONTEND_URL || 'http://localhost:3000'
      }
    });
    if (error) {
      return res.status(500).json({ success: false, message: 'Không gửi được OTP', error: error.message });
    }
    res.json({ success: true, message: 'OTP đã được gửi qua email!' });
  } catch (error) {
    console.error('Lỗi gửi OTP qua Supabase:', error);
    res.status(500).json({ success: false, message: 'Không gửi được OTP' });
  }
});

// Endpoint xác thực OTP qua Supabase
router.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { email, token } = req.body; // token là mã OTP user nhập từ email
    if (!email || !token) {
      return res.status(400).json({ success: false, message: 'Thiếu email hoặc mã OTP' });
    }
    // Gọi Supabase để xác thực OTP
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    });
    if (error) {
      return res.status(400).json({ success: false, message: 'OTP không hợp lệ hoặc đã hết hạn', error: error.message });
    }
    res.json({ success: true, message: 'Xác thực OTP thành công!', data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server khi xác thực OTP' });
  }
});

// Endpoint xác thực OTP cho đăng ký dùng JWT
router.post('/verify-register-otp', async (req: Request, res: Response) => {
  try {
    const { otpToken, otp } = req.body;
    if (!otpToken || !otp) {
      return res.status(400).json({ success: false, message: 'Thiếu otpToken hoặc OTP' });
    }
    let payload: JwtPayload;
    try {
      payload = jwt.verify(otpToken, JWT_SECRET) as JwtPayload;
    } catch (err: unknown) {
      return res.status(400).json({ success: false, message: 'otpToken không hợp lệ hoặc đã hết hạn' });
    }
    if (!payload.otp || !payload.email) {
      return res.status(400).json({ success: false, message: 'otpToken không hợp lệ' });
    }
    if (otp !== payload.otp) {
      return res.status(400).json({ success: false, message: 'Mã OTP không đúng' });
    }
    // Cập nhật is_verified=true cho user
    const { error } = await supabase
      .from('users')
      .update({ is_verified: true })
      .eq('email', payload.email);
    if (error) {
      return res.status(500).json({ success: false, message: 'Lỗi khi cập nhật xác thực user' });
    }
    res.json({ success: true, message: 'Xác thực OTP thành công, tài khoản đã được xác minh!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server khi xác thực OTP' });
  }
});

export default router;
