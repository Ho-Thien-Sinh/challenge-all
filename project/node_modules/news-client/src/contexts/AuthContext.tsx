import * as React from 'react';
const { createContext, useContext, useEffect, useState } = React;
import { User as SupabaseUser, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

// Extend the base User type to include our custom fields
type CustomUserMetadata = {
  displayName?: string;
  full_name?: string;
  [key: string]: any;
};

export interface User extends Omit<SupabaseUser, 'user_metadata'> {
  user_metadata?: CustomUserMetadata;
}

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  isAdmin: boolean
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  getUserDisplayName: () => string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  // Helper function to get user display name
  const getUserDisplayName = (user: User | null): string => {
    if (!user) return 'Người dùng';
    
    // Check user_metadata first (from social logins)
    if (user.user_metadata?.displayName) {
      return user.user_metadata.displayName;
    }
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    
    // Fallback to email username
    if (user.email) {
      return user.email.split('@')[0];
    }
    
    return 'Người dùng';
  };

  useEffect(() => {
    const checkAdminStatus = async (userId: string) => {
      // Check if user is admin
      // Change this condition based on how you store admin information
      const isUserAdmin = userId === 'cusinhhh@gmail.com';
      setIsAdmin(isUserAdmin);
      return isUserAdmin;
    };

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.email) {
        await checkAdminStatus(session.user.email);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.email) {
        await checkAdminStatus(session.user.email);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  // Create the context value with additional helper functions
  const contextValue = {
    user,
    session,
    loading,
    isAdmin,
    signUp,
    signIn,
    signOut,
    // Add helper function to get display name
    getUserDisplayName: () => getUserDisplayName(user),
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children}
    </AuthContext.Provider>
  )
}