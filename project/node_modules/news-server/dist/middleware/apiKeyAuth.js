const API_KEYS = (process.env.API_KEYS || '').split(',').map(key => key.trim());
export const apiKeyAuth = (req, res, next) => {
    // Lấy API key từ header hoặc query parameter
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;
    // Kiểm tra nếu không có API key
    if (!apiKey) {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized',
            message: 'No API key provided',
            hint: 'Please provide an API key in the `x-api-key` header or `apiKey` query parameter'
        });
    }
    // Kiểm tra API key hợp lệ
    if (!API_KEYS.includes(apiKey)) {
        return res.status(403).json({
            success: false,
            error: 'Forbidden',
            message: 'Invalid API key',
            hint: 'Please check your API key and try again'
        });
    }
    // API key hợp lệ, tiếp tục xử lý request
    next();
};
