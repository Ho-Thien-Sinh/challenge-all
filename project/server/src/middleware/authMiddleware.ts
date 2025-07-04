import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../services/supabase.js';
import { UserPayload } from '../types/auth.js';

// Extend Express Request type with our custom user property
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

interface JwtPayload extends jwt.JwtPayload {
  id: string;
  email: string;
  role: string;
}

// Middleware xác thực JWT
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET is not defined in environment variables');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  jwt.verify(token, jwtSecret, async (err, decoded) => {
    if (err) {
      console.error('Token verification error:', err);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    const user = decoded as JwtPayload;
    
    if (!user || !user.id) {
      return res.status(403).json({ error: 'Invalid token payload' });
    }

    try {
      // Check if user exists in the database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('id', user.id)
        .single();

      if (userError || !userData) {
        console.error('User not found in database:', userError);
        return res.status(403).json({ error: 'User not found' });
      }

      // Add user info to the request object
      req.user = {
        id: userData.id,
        email: userData.email,
        role: userData.role
      };

      next();
    } catch (error) {
      console.error('Error verifying user:', error);
      return res.status(500).json({ error: 'Error verifying user' });
    }
  });
};

// Middleware kiểm tra quyền
export const authorizeRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Not authorized to perform this action' });
    }

    next();
  };
};
