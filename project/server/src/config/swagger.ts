import swaggerJsdoc from 'swagger-jsdoc';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { version } = require('../../package.json');

// Swagger definition with all API endpoints and detailed documentation
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'News Aggregator API',
    version: version,
    description: 'API documentation for the News Aggregator application. This API provides endpoints for managing news articles, user authentication, and content categorization.',
    contact: {
      name: 'API Support',
      email: 'support@news-aggregator.com',
      url: 'https://news-aggregator.com/support'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
    termsOfService: 'https://news-aggregator.com/terms',
  },
  servers: [
    {
      url: 'http://localhost:5001',
      description: 'Development server',
    },
    {
      url: 'https://api.news-aggregator.com/v1',
      description: 'Production server',
    },
    {
      url: 'https://staging.news-aggregator.com/v1',
      description: 'Staging server',
    }
  ],
  tags: [
    {
      name: 'Auth',
      description: 'User authentication and authorization',
      externalDocs: {
        description: 'Authentication guide',
        url: 'https://docs.news-aggregator.com/authentication',
      },
    },
    {
      name: 'Users',
      description: 'User management and profile operations',
      externalDocs: {
        description: 'User management guide',
        url: 'https://docs.news-aggregator.com/users',
      },
    },
    {
      name: 'Articles',
      description: 'News articles management and retrieval',
      externalDocs: {
        description: 'Articles API reference',
        url: 'https://docs.news-aggregator.com/articles',
      },
    },
    {
      name: 'Categories',
      description: 'Article categories and classification',
      externalDocs: {
        description: 'Categories guide',
        url: 'https://docs.news-aggregator.com/categories',
      },
    },
    {
      name: 'Search',
      description: 'Search functionality across articles and content',
      externalDocs: {
        description: 'Search API reference',
        url: 'https://docs.news-aggregator.com/search',
      },
    },
    {
      name: 'System',
      description: 'System health and maintenance endpoints',
    },
  ],
  security: [
    {
      apiKeyAuth: [],
    },
    {
      bearerAuth: [],
    },
  ],
  components: {
    securitySchemes: {
      apiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
        description: 'API key for accessing public endpoints',
      },
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token for authentication',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string', example: 'Error Type' },
          message: { type: 'string', example: 'Error description' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          role: { type: 'string', enum: ['user', 'admin'] },
          is_verified: { type: 'boolean' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      Article: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          content: { type: 'string' },
          summary: { type: 'string' },
          author: { type: 'string' },
          source_url: { type: 'string', format: 'uri' },
          published_at: { type: 'string', format: 'date-time' },
        },
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
          name: { type: 'string', example: 'Thể thao' },
          slug: { type: 'string', example: 'the-thao' },
          description: { type: 'string', example: 'Tin tức thể thao trong và ngoài nước' },
          is_active: { type: 'boolean', example: true },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          page: { 
            type: 'integer', 
            example: 1, 
            description: 'Trang hiện tại',
            minimum: 1 
          },
          limit: { 
            type: 'integer', 
            example: 10, 
            description: 'Số lượng item mỗi trang',
            minimum: 1,
            maximum: 100 
          },
          total: { 
            type: 'integer', 
            example: 50, 
            description: 'Tổng số item' 
          },
          totalPages: { 
            type: 'integer', 
            example: 5, 
            description: 'Tổng số trang' 
          },
          hasNext: { 
            type: 'boolean', 
            example: true, 
            description: 'Có trang tiếp theo không' 
          },
          hasPrev: { 
            type: 'boolean', 
            example: false, 
            description: 'Có trang trước không' 
          },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: 'Unauthorized - Authentication credentials were missing or incorrect',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              error: 'Unauthorized',
              message: 'Authentication credentials were missing or incorrect',
            },
          },
        },
      },
      Forbidden: {
        description: 'Forbidden - Insufficient permissions',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              error: 'Forbidden',
              message: 'Insufficient permissions to access this resource',
            },
          },
        },
      },
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              error: 'Not Found',
              message: 'The requested resource was not found',
            },
          },
        },
      },
      ValidationError: {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              success: false,
              error: 'ValidationError',
              message: 'Input data is invalid'
            }
          }
        }
      },
      InternalServerError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              success: false,
              error: 'InternalServerError',
              message: 'An unexpected error occurred'
            }
          }
        }
      },
    },
  },
  paths: {
    // ===== AUTH ENDPOINTS =====
    '/api/v1/auth/verify-register-otp': {
      post: {
        tags: ['Auth'],
        summary: 'Xác thực OTP khi đăng ký',
        description: 'Verify the OTP sent to user\'s email during registration',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'otpToken'],
                properties: {
                  email: {
                    type: 'string',
                    format: 'email',
                    description: 'User\'s email address',
                    example: 'user@example.com'
                  },
                  otpToken: {
                    type: 'string',
                    description: 'OTP token received via email',
                    example: '235318'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'OTP verification successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'OTP verified successfully' },
                    user: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Invalid OTP or missing required fields',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                },
                example: {
                  success: false,
                  error: 'Bad Request',
                  message: 'Invalid or expired OTP'
                }
              }
            }
          },
          '404': {
            description: 'User not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },

    // ===== HEALTH CHECK =====
    '/api/v1/health': {
      get: {
        tags: ['System'],
        summary: 'Kiểm tra sức khỏe hệ thống',
        description: 'Check if the API is running',
        responses: {
          '200': {
            description: 'API is running',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    timestamp: { type: 'string', format: 'date-time' },
                    environment: { type: 'string', example: 'development' },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ===== AUTH ENDPOINTS =====
    '/api/v1/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Đăng ký người dùng mới',
        description: 'Creates a new user account with the provided email and password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  name: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string' },
                    user: {
                      $ref: '#/components/schemas/User',
                    },
                  },
                },
              },
            },
          },
          '400': {
            $ref: '#/components/responses/ValidationError',
          },
          '409': {
            description: 'User already exists',
            $ref: '#/components/schemas/Error',
          },
          '500': {
            $ref: '#/components/responses/InternalServerError',
          },
        },
      },
    },

    '/api/v1/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Đăng nhập người dùng',
        description: 'Authenticate user with email and password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    accessToken: { type: 'string' },
                    refreshToken: { type: 'string' },
                    user: {
                      $ref: '#/components/schemas/User',
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Invalid credentials',
            $ref: '#/components/schemas/Error',
          },
        },
      },
    },

    // ===== USER ENDPOINTS =====
    '/api/v1/users/me': {
      get: {
        tags: ['Users'],
        summary: 'Lấy thông tin người dùng hiện tại',
        description: 'Lấy thông tin chi tiết của người dùng hiện tại đang đăng nhập',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'User information retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    user: {
                      $ref: '#/components/schemas/User',
                    },
                  },
                },
              },
            },
          },
          '401': {
            $ref: '#/components/responses/Unauthorized',
          },
        },
      },
    },

    '/api/v1/users': {
      get: {
        tags: ['Users'],
        summary: 'Lấy danh sách người dùng',
        description: 'Lấy danh sách tất cả người dùng với phân trang (chỉ admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: 'Số trang',
            schema: { type: 'integer', default: 1, minimum: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Số lượng người dùng mỗi trang',
            schema: { type: 'integer', default: 10, minimum: 1, maximum: 100 },
          },
        ],
        responses: {
          '200': {
            description: 'Danh sách người dùng',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/User' },
                    },
                    pagination: { $ref: '#/components/schemas/Pagination' },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
      post: {
        tags: ['Users'],
        summary: 'Tạo người dùng mới',
        description: 'Tạo tài khoản người dùng mới',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'user@example.com' },
                  password: { type: 'string', minLength: 8, example: 'password123' },
                  full_name: { type: 'string', example: 'Nguyễn Văn A' },
                  role: { type: 'string', enum: ['user', 'admin'], default: 'user' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Người dùng được tạo thành công',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '409': {
            description: 'Email đã tồn tại',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: {
                  success: false,
                  error: 'Conflict',
                  message: 'Email already exists',
                },
              },
            },
          },
        },
      },
    },

    '/api/v1/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Lấy thông tin người dùng theo ID',
        description: 'Lấy thông tin chi tiết của một người dùng cụ thể',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID của người dùng',
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '200': {
            description: 'Thông tin người dùng',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      put: {
        tags: ['Users'],
        summary: 'Cập nhật thông tin người dùng',
        description: 'Cập nhật thông tin của một người dùng',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID của người dùng',
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  full_name: { type: 'string', example: 'Nguyễn Văn B' },
                  password: { type: 'string', minLength: 8 },
                  role: { type: 'string', enum: ['user', 'admin'] },
                  is_active: { type: 'boolean' },
                  avatar_url: { type: 'string', format: 'uri' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Cập nhật thành công',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Xóa người dùng',
        description: 'Xóa một người dùng (chỉ admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID của người dùng',
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '204': {
            description: 'Xóa thành công',
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    '/api/v1/users/change-password': {
      post: {
        tags: ['Users'],
        summary: 'Đổi mật khẩu',
        description: 'Thay đổi mật khẩu của người dùng hiện tại',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                  currentPassword: { type: 'string', description: 'Mật khẩu hiện tại' },
                  newPassword: { type: 'string', minLength: 8, description: 'Mật khẩu mới' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Đổi mật khẩu thành công',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Password updated successfully' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Mật khẩu hiện tại không đúng',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: {
                  success: false,
                  error: 'Bad Request',
                  message: 'Current password is incorrect',
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    // ===== ARTICLE ENDPOINTS =====
    '/api/v1/articles': {
      get: {
        tags: ['Articles'],
        summary: 'Lấy tất cả bài viết',
        description: 'Lấy danh sách tất cả bài viết với phân trang',
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: 'Số trang',
            schema: { type: 'integer', default: 1, minimum: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Số lượng bài viết mỗi trang',
            schema: { type: 'integer', default: 10, minimum: 1, maximum: 100 },
          },
          {
            name: 'category',
            in: 'query',
            description: 'Lọc theo danh mục',
            schema: { type: 'string' },
          },
          {
            name: 'sort',
            in: 'query',
            description: 'Sắp xếp theo',
            schema: { 
              type: 'string', 
              enum: ['created_at', 'published_at', 'title'],
              default: 'published_at'
            },
          },
          {
            name: 'order',
            in: 'query',
            description: 'Thứ tự sắp xếp',
            schema: { 
              type: 'string', 
              enum: ['asc', 'desc'],
              default: 'desc'
            },
          },
        ],
        responses: {
          '200': {
            description: 'Danh sách bài viết',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Article',
                      },
                    },
                    pagination: { $ref: '#/components/schemas/Pagination' },
                  },
                },
              },
            },
          },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },

    // ===== SEARCH ENDPOINTS =====
    '/api/v1/search': {
      get: {
        tags: ['Search'],
        summary: 'Tìm kiếm bài viết',
        description: 'Tìm kiếm bài viết theo từ khóa với các bộ lọc và phân trang',
        parameters: [
          {
            name: 'q',
            in: 'query',
            description: 'Từ khóa tìm kiếm',
            required: true,
            schema: { type: 'string', example: 'thể thao' },
          },
          {
            name: 'category',
            in: 'query',
            description: 'Lọc theo danh mục',
            schema: { type: 'string', example: 'the-thao' },
          },
          {
            name: 'page',
            in: 'query',
            description: 'Số trang',
            schema: { type: 'integer', default: 1, minimum: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Số lượng kết quả mỗi trang',
            schema: { type: 'integer', default: 10, minimum: 1, maximum: 100 },
          },
          {
            name: 'sort',
            in: 'query',
            description: 'Sắp xếp theo',
            schema: { 
              type: 'string', 
              enum: ['relevance', 'published_at', 'created_at'],
              default: 'relevance'
            },
          },
        ],
        responses: {
          '200': {
            description: 'Kết quả tìm kiếm',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Article',
                      },
                    },
                    pagination: { $ref: '#/components/schemas/Pagination' },
                    query: { type: 'string', example: 'thể thao' },
                    totalResults: { type: 'integer', example: 25 },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },

    // ===== CATEGORY ENDPOINTS =====
    '/api/v1/categories': {
      get: {
        tags: ['Categories'],
        summary: 'Lấy danh sách danh mục',
        description: 'Lấy tất cả danh mục bài viết',
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: 'Số trang',
            schema: { type: 'integer', default: 1, minimum: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Số lượng danh mục mỗi trang',
            schema: { type: 'integer', default: 10, minimum: 1, maximum: 100 },
          },
        ],
        responses: {
          '200': {
            description: 'Danh sách danh mục',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Category' },
                    },
                    pagination: {
                      type: 'object',
                      properties: {
                        page: { type: 'integer', example: 1 },
                        limit: { type: 'integer', example: 10 },
                        total: { type: 'integer', example: 20 },
                        totalPages: { type: 'integer', example: 2 },
                      },
                    },
                  },
                },
              },
            },
          },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
      post: {
        tags: ['Categories'],
        summary: 'Tạo danh mục mới',
        description: 'Tạo một danh mục bài viết mới (chỉ admin)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'slug'],
                properties: {
                  name: { type: 'string', example: 'Thể thao' },
                  slug: { type: 'string', example: 'the-thao' },
                  description: { type: 'string', example: 'Tin tức thể thao' },
                  is_active: { type: 'boolean', default: true },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Danh mục được tạo thành công',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Category' },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '409': {
            description: 'Slug đã tồn tại',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: {
                  success: false,
                  error: 'Conflict',
                  message: 'Category with this slug already exists',
                },
              },
            },
          },
        },
      },
    },

    '/api/v1/categories/{id}': {
      get: {
        tags: ['Categories'],
        summary: 'Lấy thông tin danh mục theo ID',
        description: 'Lấy thông tin chi tiết của một danh mục cụ thể',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID của danh mục',
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '200': {
            description: 'Thông tin danh mục',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Category' },
                  },
                },
              },
            },
          },
          '404': { $ref: '#/components/responses/NotFound' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
      put: {
        tags: ['Categories'],
        summary: 'Cập nhật danh mục',
        description: 'Cập nhật thông tin của một danh mục (chỉ admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID của danh mục',
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Thể thao cập nhật' },
                  slug: { type: 'string', example: 'the-thao-cap-nhat' },
                  description: { type: 'string', example: 'Tin tức thể thao cập nhật' },
                  is_active: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Cập nhật thành công',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Category' },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' },
          '409': {
            description: 'Slug đã tồn tại',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: {
                  success: false,
                  error: 'Conflict',
                  message: 'Category with this slug already exists',
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Categories'],
        summary: 'Xóa danh mục',
        description: 'Xóa một danh mục (chỉ admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID của danh mục',
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '204': {
            description: 'Xóa thành công',
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },

    '/api/v1/auth/verify-otp': {
      post: {
        tags: ['Auth'],
        summary: 'Xác thực OTP Supabase',
        description: 'Xác thực mã OTP được gửi qua email bằng Supabase',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'token'],
                properties: {
                  email: { type: 'string', format: 'email', description: 'Email người dùng' },
                  token: { type: 'string', description: 'Mã OTP nhận được qua email' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Xác thực OTP thành công',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Xác thực OTP thành công!' },
                    data: { type: 'object' }
                  }
                }
              }
            }
          },
          '400': {
            description: 'OTP không hợp lệ hoặc đã hết hạn',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: {
                  success: false,
                  message: 'OTP không hợp lệ hoặc đã hết hạn',
                  error: 'Invalid or expired OTP'
                }
              }
            }
          },
          '500': {
            $ref: '#/components/responses/InternalServerError'
          }
        }
      }
    },
  },
};

// Options for the swagger docs
const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: ['./src/routes/*.ts'],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(options);

// Cấu hình giao diện Swagger UI
const swaggerUiOptions = {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'News Aggregator API',
  swaggerOptions: {
    docExpansion: 'none',
    filter: true,
    showRequestDuration: true,
  },
};

export { swaggerSpec as default, swaggerSpec, swaggerUiOptions };
