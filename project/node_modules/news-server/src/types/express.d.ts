import { User } from '@supabase/supabase-js';

declare global {
  namespace Express {
    // Define user interface
    interface UserPayload {
      id: string;
      email: string;
      role: 'admin' | 'user';
      [key: string]: any;
    }

    // Extend Request interface
    interface Request {
      user?: UserPayload;
    }
  }
}

// Ensure file is treated as a module
export {};
