import { Request, Response, NextFunction } from 'express';

// Middleware xác thực API key
export const apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
  console.log('\n=== API Key Middleware ===');
  console.log('Request URL:', req.originalUrl);
  console.log('Request Method:', req.method);
  
  // Danh sách API key hợp lệ (trong môi trường thực tế nên lưu trong biến môi trường)
  const HARDCODED_API_KEYS = ['news_app_12345_secure_key_67890'];
  
  // Lấy API key từ các nguồn khác nhau (header hoặc query param)
  const apiKey = 
    (req.headers['x-api-key'] as string) ||
    (req.headers['apikey'] as string) ||
    (req.query.apikey as string) ||
    (req.query.apiKey as string) ||
    (req.query.API_KEY as string);
  
  console.log('\nAPI Key from request (raw):', JSON.stringify(apiKey));
  console.log('Valid API keys (hardcoded):', JSON.stringify(HARDCODED_API_KEYS));
  
  // Nếu không có API key
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
  
  // Chuẩn hóa API key (loại bỏ khoảng trắng thừa và dấu ngoặc kép)
  const normalizedApiKey = apiKey.toString().trim().replace(/^["']|["']$/g, '');
  
  // Kiểm tra API key có hợp lệ không
  const isKeyValid = HARDCODED_API_KEYS.includes(normalizedApiKey);
  
  console.log('\nAPI Key Validation:');
  console.log('- Normalized API Key:', JSON.stringify(normalizedApiKey));
  console.log('- Is key valid?', isKeyValid);
  
  // Nếu API key không hợp lệ
  if (!isKeyValid) {
    // Log thêm thông tin debug
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
  
  // Nếu API key hợp lệ, chuyển sang middleware tiếp theo
  console.log('✅ API Key validated successfully');
  next();
};
