import { Request, Response } from 'express';
import supabase from '../lib/supabase.js';

export const searchArticles = async (req: Request, res: Response) => {
  console.log('Search request received:', req.query);
  
  try {
    const { q: searchQuery, page = '1', limit = '12' } = req.query;
    
    if (!searchQuery || typeof searchQuery !== 'string') {
      console.log('Invalid search query:', searchQuery);
      return res.status(400).json({ 
        success: false, 
        error: 'Truy vấn tìm kiếm không hợp lệ' 
      });
    }

    console.log(`Searching for: "${searchQuery}", page: ${page}, limit: ${limit}`);
    
    const pageNumber = parseInt(page as string, 10) || 1;
    const limitNumber = parseInt(limit as string, 10) || 12;
    const offset = (pageNumber - 1) * limitNumber;

    // Search articles with full-text search
    console.log('Executing Supabase query...');
    
    // Split search query into individual terms
    const searchTerms = searchQuery
      .split(/\s+/)
      .filter(term => term.length > 0)
      .map(term => term.trim());
    
    console.log('Search terms:', searchTerms);
    
    // Create query builder
    let query = supabase
      .from('articles')
      .select('*', { count: 'exact' });
    
    // Add search conditions for each keyword
    if (searchTerms.length > 0) {
      // Create an array of OR conditions for each search term
      const orConditions = searchTerms.flatMap(term => [
        `title.ilike.%${term}%`,
        `summary.ilike.%${term}%`
      ]);
      
      // Apply OR conditions
      query = query.or(orConditions.join(','));
    } else {
      // If no search terms, get all articles
      query = query.not('id', 'is', null);
    }
    
    // Add pagination and sorting
    const { data: articles, error: searchError, count } = await query
      .order('published_at', { ascending: false })
      .range(offset, offset + limitNumber - 1);

    console.log('Supabase query completed. Results:', { 
      count,
      hasError: !!searchError,
      error: searchError
    });

    if (searchError) {
      console.error('Lỗi khi tìm kiếm bài viết:', searchError);
      return res.status(500).json({ 
        success: false, 
        error: 'Lỗi khi tìm kiếm bài viết',
        details: searchError.message
      });
    }

    const totalPages = Math.ceil((count || 0) / limitNumber);
    const response = {
      success: true,
      data: articles || [],
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total: count || 0,
        total_pages: totalPages || 0
      }
    };

    console.log(`Returning ${articles?.length || 0} articles`);
    res.status(200).json(response);
  } catch (error) {
    console.error('Lỗi trong quá trình tìm kiếm:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Đã xảy ra lỗi khi xử lý yêu cầu tìm kiếm',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
