import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import '../types';
// Cấu hình transporter cho nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
});
// Hàm khởi tạo và lấy instance của Supabase client
const getSupabase = () => {
    if (global.__supabaseClient) {
        return global.__supabaseClient;
    }
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase URL and Anon Key must be provided in environment variables');
    }
    global.__supabaseClient = createClient(supabaseUrl, supabaseKey);
    return global.__supabaseClient;
};
// Khởi tạo biến supabase như một getter để trì hoãn việc khởi tạo
const supabase = {
    get auth() {
        return getSupabase().auth;
    },
    get from() {
        return getSupabase().from;
    },
    // Thêm các method khác của Supabase client nếu cần
    // ...
};
// Middleware xác thực
export const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Chưa xác thực' });
        }
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error)
            throw error;
        if (!user) {
            return res.status(401).json({ error: 'Người dùng không tồn tại' });
        }
        // Lấy thông tin vai trò từ bảng users
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();
        if (userError)
            throw userError;
        // Gán thông tin người dùng vào request
        req.user = {
            id: user.id,
            email: user.email || '', // Đảm bảo email không bị undefined
            role: userData?.role || 'user',
            app_metadata: user.app_metadata,
            user_metadata: user.user_metadata,
            aud: user.aud,
            created_at: user.created_at
        };
        next();
    }
    catch (error) {
        console.error('Lỗi xác thực:', error);
        return res.status(401).json({ error: 'Xác thực thất bại' });
    }
};
// Middleware phân quyền admin
export const isAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Không có quyền truy cập' });
    }
    next();
};
// Hàm gửi email xác nhận
export const sendVerificationEmail = async (email, token) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'cusinhhh@gmail.com', // Email admin để xác nhận
        subject: 'Yêu cầu đăng ký tài khoản admin',
        html: `
            <h2>Yêu cầu đăng ký tài khoản admin mới</h2>
            <p>Email: ${email}</p>
            <p>Vui lòng xác nhận hoặc từ chối yêu cầu này.</p>
            <a href="${process.env.APP_URL}/api/auth/verify-admin?token=${token}">Xác nhận</a>
        `
    };
    await transporter.sendMail(mailOptions);
};
// Hàm tạo token xác nhận
export const generateVerificationToken = () => {
    return crypto.randomBytes(32).toString('hex');
};
