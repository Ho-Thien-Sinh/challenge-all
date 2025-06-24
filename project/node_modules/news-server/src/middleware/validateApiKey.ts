import { Request, Response, NextFunction } from 'express';

const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  console.log('Validating API key...');
  console.log('Request URL:', req.originalUrl);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Query params:', req.query);
  
  const apiKey = req.headers['apikey'] || req.query.apikey;
  const validApiKey = process.env.API_KEY || process.env.SUPABASE_ANON_KEY;

  console.log('API Key from request:', apiKey ? '***' : 'Not provided');
  console.log('Valid API key exists:', !!validApiKey);

  if (!validApiKey) {
    console.error('API key not configured on server');
    return res.status(500).json({
      success: false,
      error: 'Server configuration error',
      message: 'API key not configured on server'
    });
  }

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'No API key provided',
      hint: 'Please provide an API key in the `apikey` header or query parameter'
    });
  }

  if (apiKey !== validApiKey) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'Invalid API key',
      hint: 'Please provide a valid API key'
    });
  }

  next();
};

export default validateApiKey;
