import { User as SupabaseUser, UserAppMetadata, UserMetadata } from '@supabase/supabase-js';

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: 'admin' | 'user';
      app_metadata: UserAppMetadata;
      user_metadata: UserMetadata;
      aud: string;
      created_at: string;
      [key: string]: any;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
