import { Request, Response, NextFunction } from 'express';

// API key authentication middleware
export const apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
  console.log('\n=== API Key Middleware ===');
  console.log('Request URL:', req.originalUrl);
  console.log('Request Method:', req.method);
  
  // List of valid API keys (in a real environment, these should be stored in environment variables)
  const HARDCODED_API_KEYS = ['news_app_12345_secure_key_67890'];
  
  // Get API key from different sources (header or query parameter)
  const apiKey = 
    (req.headers['x-api-key'] as string) ||
    (req.headers['apikey'] as string) ||
    (req.query.apikey as string) ||
    (req.query.apiKey as string) ||
    (req.query.API_KEY as string);
  
  console.log('\nAPI Key from request (raw):', JSON.stringify(apiKey));
  console.log('Valid API keys (hardcoded):', JSON.stringify(HARDCODED_API_KEYS));
  
  // If no API key is provided
  if (!apiKey) {
    console.error('❌ No API key provided');
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'No API key provided',
      hint: 'Please provide an API key in the `apikey` header or query parameter',
      receivedHeaders: Object.keys(req.headers),
      receivedQuery: Object.keys(req.query),
      timestamp: new Date().toISOString()
    });
  }
  
  // Normalize API key (remove extra whitespace and quotes)
  const normalizedApiKey = apiKey.toString().trim().replace(/^["']|["']$/g, '');
  
  // Check if the API key is valid
  const isKeyValid = HARDCODED_API_KEYS.includes(normalizedApiKey);
  
  console.log('\nAPI Key Validation:');
  console.log('- Normalized API Key:', JSON.stringify(normalizedApiKey));
  console.log('- Is key valid?', isKeyValid);
  
  // If the API key is invalid
  if (!isKeyValid) {
    // Log additional debug information
    const keyDetails = {
      length: normalizedApiKey.length,
      first5: normalizedApiKey.substring(0, 5),
      last5: normalizedApiKey.substring(normalizedApiKey.length - 5),
      charCodes: Array.from(normalizedApiKey).map(c => c.charCodeAt(0))
    };
    
    console.error('❌ Invalid API key. Key details:', keyDetails);
    
    return res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'Invalid API key',
      hint: 'Please check your API key and try again',
      debug: process.env.NODE_ENV === 'development' ? {
        receivedKey: normalizedApiKey,
        receivedKeyLength: normalizedApiKey.length,
        validKeys: HARDCODED_API_KEYS,
        keyDetails: keyDetails
      } : undefined,
      timestamp: new Date().toISOString()
    });
  }
  
  // If the API key is valid, proceed to the next middleware
  console.log('✅ API Key validated successfully');
  next();
};
