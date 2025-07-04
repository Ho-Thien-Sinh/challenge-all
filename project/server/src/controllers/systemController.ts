import { Request, Response } from 'express';
import { supabase } from '../services/supabase.js';

export const checkHealth = async (req: Request, res: Response) => {
  try {
    // Kiểm tra kết nối database
    const { data, error } = await supabase
      .from('articles')
      .select('id')
      .limit(1);

    if (error) throw error;

    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        connected: true,
        message: 'Database connected successfully',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('Health check failed:', error);
    return res.status(503).json({
      success: false,
      error: 'Service Unavailable',
      details: error?.message || 'Unknown error occurred'
    });
  }
};
