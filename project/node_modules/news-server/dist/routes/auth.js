import { Router } from 'express';
import supabase from "../lib/supabase.js";
import { sendVerificationEmail, generateVerificationToken, authenticate } from '../lib/auth.js';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
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
const handleError = (err, res) => {
    console.error('Auth Error:', err);
    if (err instanceof z.ZodError) {
        return res.status(400).json({
            error: 'Dữ liệu không hợp lệ',
            details: fromZodError(err).message
        });
    }
    else if (err instanceof Error) {
        return res.status(500).json({
            error: err.message || 'Đã xảy ra lỗi hệ thống'
        });
    }
    res.status(500).json({ error: 'Đã xảy ra lỗi hệ thống không xác định' });
};
const router = Router();
// Đăng ký tài khoản user
router.post('/register', async (req, res) => {
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
        if (authError)
            throw authError;
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
        if (profileError)
            throw profileError;
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
    }
    catch (error) {
        handleError(error, res);
    }
});
// Yêu cầu đăng ký tài khoản admin
router.post('/request-admin', authenticate, async (req, res) => {
    try {
        // Kiểm tra req.user tồn tại
        if (!req.user) {
            return res.status(401).json({ error: 'Không xác thực được người dùng' });
        }
        const userId = req.user.id;
        const verificationToken = generateVerificationToken();
        // Lưu token xác nhận
        await supabase
            .from('users')
            .update({ verification_token: verificationToken })
            .eq('id', userId);
        // Gửi email xác nhận
        await sendVerificationEmail(req.user.email, verificationToken);
        res.json({ message: 'Đã gửi yêu cầu đăng ký admin' });
    }
    catch (error) {
        console.error('Lỗi yêu cầu đăng ký admin:', error);
        res.status(500).json({ error: 'Lỗi xử lý yêu cầu' });
    }
});
// Xác nhận tài khoản admin
router.get('/verify-admin', async (req, res) => {
    try {
        const { token } = req.query;
        // Tìm user với token xác nhận
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('verification_token', token)
            .single();
        if (!user || error) {
            return res.status(400).json({ error: 'Token không hợp lệ' });
        }
        // Cập nhật quyền admin
        await supabase
            .from('users')
            .update({
            role: 'admin',
            is_verified: true,
            verification_token: null
        })
            .eq('id', user.id);
        res.send('Tài khoản admin đã được kích hoạt thành công!');
    }
    catch (error) {
        console.error('Lỗi xác nhận admin:', error);
        res.status(500).json({ error: 'Lỗi xử lý yêu cầu' });
    }
});
// Đăng nhập
router.post('/login', async (req, res) => {
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
    }
    catch (error) {
        handleError(error, res);
    }
});
// Đăng xuất
router.post('/logout', authenticate, async (req, res) => {
    try {
        await supabase.auth.signOut();
        res.clearCookie('sb-access-token');
        res.json({ message: 'Đăng xuất thành công' });
    }
    catch (error) {
        handleError(error, res);
    }
});
// Lấy thông tin user hiện tại
router.get('/me', authenticate, async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ error: 'Không xác thực được người dùng' });
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
    }
    catch (error) {
        handleError(error, res);
    }
});
export default router;
