// Load environment variables first
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import apiRouter from './routes/index.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = join(process.cwd(), '.env');
console.log('Loading environment from:', envPath);
const result = dotenv.config({ path: envPath, override: true });

if (result.error) {
  console.error('Error loading .env file:', result.error);
  process.exit(1);
}

// Log loaded environment variables (for debugging)
console.log('Environment variables loaded:', {
  NODE_ENV: process.env.NODE_ENV,
  SUPABASE_URL: process.env.SUPABASE_URL ? '***' : 'Not set',
  PORT: process.env.PORT
});

// Import other dependencies
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec, swaggerUiOptions } from './config/swagger.js';
import { createClient } from '@supabase/supabase-js';
import { startCrawler, stopCrawler } from './crawler.js';
import { startScheduler as startArticleScheduler } from './scheduler.js';
import authRouter from './routes/auth.js';
import { apiKeyAuth } from './middleware/apiKeyAuth.js';
import fs from 'fs';

// Setup logging to file
const logStream = fs.createWriteStream(join(process.cwd(), 'server.log'), { flags: 'a' });
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

console.log = (...args) => {
  const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ');
  logStream.write(`[${new Date().toISOString()}] [INFO] ${message}\n`);
  originalConsoleLog(...args);
};

console.error = (...args) => {
  const message = args.map(arg => arg instanceof Error ? arg.stack : typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ');
  logStream.write(`[${new Date().toISOString()}] [ERROR] ${message}\n`);
  originalConsoleError(...args);
};

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Import kiểu dữ liệu mở rộng
import './types/express.d.js';

// Check required environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error(`❌ Lỗi: Thiếu các biến môi trường bắt buộc: ${missingEnvVars.join(', ')}`);
    process.exit(1);
}

console.log('✅ Đã tải cấu hình môi trường thành công');

// Tăng giới hạn số lượng listeners
process.setMaxListeners(50);

// Handle MaxListenersExceededWarning
process.on('warning', (warning) => {
  if (warning.name === 'MaxListenersExceededWarning') {
    console.warn('⚠️ Cảnh báo MaxListeners:', warning.message);
  }
});

// Environment variables already loaded above

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5001;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https://validator.swagger.io"
      ],
      fontSrc: [
        "'self'",
        "data:",
        "https://fonts.gstatic.com"
      ],
      connectSrc: [
        "'self'",
        "https://validator.swagger.io"
      ]
    },
  },
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// CORS configuration - Simplified
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5001',
  'https://your-production-domain.com',
  'https://www.your-frontend-domain.com',
];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow all origins in development
    if (process.env.NODE_ENV !== 'production' || !origin || allowedOrigins.includes(origin)) {
      console.log('Allowing CORS for origin:', origin || 'undefined (development mode)');
      return callback(null, true);
    }
    console.log('Blocked by CORS:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'apikey',
    'x-api-key',
    'Accept',
    'Origin'
  ],
  credentials: true,
  optionsSuccessStatus: 204,
  exposedHeaders: [
    'Content-Range',
    'X-Total-Count',
    'X-Request-Id',
    'X-Response-Time',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset'
  ]
};

// Apply CORS middleware with options
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight for all routes

// Add security headers and handle preflight requests
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Set CORS headers
  if (origin && (process.env.NODE_ENV !== 'production' || allowedOrigins.includes(origin))) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, apikey, x-api-key, Accept, Origin');
    return res.status(204).end();
  }
  
  next();
});

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau.'
});

// Apply rate limiter to all API routes
app.use('/api', limiter);

// Log Swagger spec for debugging
const swaggerSpecObj = swaggerSpec as any;
console.log('Swagger spec tags:', swaggerSpecObj.definition?.tags?.map((t: any) => t.name));
console.log('Swagger spec paths:', Object.keys(swaggerSpecObj.definition?.paths || {}));

// Swagger documentation
app.use('/api-docs', 
  swaggerUi.serve, 
  swaggerUi.setup(swaggerSpec, {
    ...swaggerUiOptions,
    customCss: '.swagger-ui .topbar { display: none }',
    customfavIcon: '/favicon.ico',
    customSiteTitle: 'News Aggregator API Documentation'
  })
);

// Health check endpoints (no auth required)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Mount the API router (API key validation is handled within the router)
app.use(apiRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to the News API',
    version: '1.0.0',
    documentation: '/api-docs',
    status: 'online',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Lỗi server:', err.stack)
  res.status(500).json({
    error: 'Đã xảy ra lỗi!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Lỗi máy chủ nội bộ'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Không tìm thấy đường dẫn',
    path: req.originalUrl
  })
})

// Increase maximum number of listeners
process.setMaxListeners(20);

// Declare server variable in module scope
let server: ReturnType<typeof app.listen> | null = null;

// Declare global type for stopScheduler
declare global {
  namespace NodeJS {
    interface Global {
      stopScheduler: () => void;
    }
  }
}

// Declare global variable
const globalAny = global as any;

/**
 * Check Supabase connection
 */
async function checkSupabaseConnection() {
  try {
    console.log('🔍 Đang kiểm tra kết nối Supabase...');
    console.log('URL:', supabaseUrl ? '✅ Đã cấu hình' : '❌ Chưa cấu hình');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Thiếu cấu hình Supabase. Vui lòng kiểm tra file .env');
      return false;
    }
    
    // Kiểm tra kết nối đơn giản bằng cách lấy dữ liệu từ bảng articles
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Lỗi khi kiểm tra kết nối Supabase:', error);
      return false;
    }
    
    console.log('✅ Kết nối Supabase thành công');
    return true;
  } catch (error: unknown) {
    console.error('❌ Lỗi kết nối Supabase:');
    console.error('- URL:', supabaseUrl);
    
    if (error instanceof Error) {
      console.error('- Lỗi chi tiết:', error.message);
      
      // Kiểm tra lỗi mạng
      if (error.message && error.message.includes('fetch failed')) {
        console.error('⚠️ Không thể kết nối đến máy chủ Supabase. Vui lòng kiểm tra kết nối mạng.');
      }
    } else {
      console.error('- Lỗi không xác định:', error);
    }
    
    return false;
  }
}

/**
 * Handle graceful shutdown
 */
function gracefulShutdown(signal: string) {
  console.log(`\n🛑 Nhận được tín hiệu ${signal}. Đang dọn dẹp và tắt máy chủ...`);
  
  // Stop crawler
  console.log('🛑 Đang dừng crawler...');
  stopCrawler();
  
  // Dừng scheduler nếu có
  if (globalAny.stopScheduler && typeof globalAny.stopScheduler === 'function') {
    console.log('⏰ Đang dừng scheduler cập nhật bài viết...');
    globalAny.stopScheduler();
  }
  
  // Dừng máy chủ nếu đang chạy
  if (server) {
    server.close((err) => {
      if (err) {
        console.error('❌ Lỗi khi tắt máy chủ:', err);
        process.exit(1);
      }
      
      console.log('✅ Máy chủ đã dừng thành công');
      process.exit(0);
    });
    
    // Đặt timeout để buộc tắt nếu quá lâu
    setTimeout(() => {
      console.error('⏰ Quá thời gian chờ tắt máy chủ, buộc thoát...');
      process.exit(1);
    }, 10000);
  } else {
    console.log('✅ Máy chủ đã dừng');
    process.exit(0);
  }
}

// Start server
async function startServer() {
  try {
    // Check Supabase connection
    await checkSupabaseConnection();
    
    // Khởi động crawler
    console.log('🔄 Đang khởi động crawler...');
    await startCrawler();
    
    // Khởi động scheduler cập nhật bài viết (cập nhật mỗi 30 phút)
    console.log('⏰ Đang khởi động scheduler cập nhật bài viết...');
    const stopScheduler = startArticleScheduler(30);
    
    // Lưu hàm dừng scheduler để sử dụng khi tắt máy chủ
    globalAny.stopScheduler = stopScheduler;
    
    // Khởi động máy chủ
    server = app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    });
    
    // Xử lý các sự kiện tắt máy chủ
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    
    // Xử lý các lỗi không bắt được
    process.on('uncaughtException', (error) => {
      console.error('🚨 Lỗi không xử lý được:', error);
      gracefulShutdown('uncaughtException');
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('🚨 Promise bị từ chối chưa được xử lý:', reason);
      console.error('Promise:', promise);
    });

    return server;
  } catch (error) {
    console.error('❌ Lỗi khi khởi động server:', error);
    process.exit(1);
  }
}

// Start server
startServer().catch(error => {
  console.error('❌ Lỗi nghiêm trọng:', error);
  process.exit(1);
});

export default app