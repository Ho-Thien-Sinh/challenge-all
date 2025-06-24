import { User } from '@supabase/supabase-js';

declare global {
  namespace Express {
    // Định nghĩa kiểu user
    interface UserPayload {
      id: string;
      email: string;
      role: 'admin' | 'user';
      [key: string]: any;
    }

    // Mở rộng Request interface
    interface Request {
      user?: UserPayload;
    }
  }
}

// Bảo đảm file này được coi là module
export {};
