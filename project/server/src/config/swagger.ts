import swaggerJsdoc from 'swagger-jsdoc';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { version } = require('../../package.json');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'News Aggregator API',
      version: version,
      description: 'API documentation for the News Aggregator application',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:5001',
        description: 'Development server',
      },
      {
        url: 'https://your-production-url.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Nhập JWT token của bạn vào đây. Ví dụ: Bearer abc123...',
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'API key để xác thực yêu cầu',
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Không có quyền truy cập hoặc token không hợp lệ',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  error: { type: 'string', example: 'Không được phép truy cập' },
                },
              },
            },
          },
        },
        NotFound: {
          description: 'Không tìm thấy tài nguyên',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  error: { type: 'string', example: 'Không tìm thấy tài nguyên' },
                },
              },
            },
          },
        },
        ValidationError: {
          description: 'Dữ liệu không hợp lệ',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  error: { type: 'string', example: 'Dữ liệu không hợp lệ' },
                  details: {
                    type: 'object',
                    additionalProperties: {
                      type: 'string',
                      example: 'Thông báo lỗi chi tiết',
                    },
                  },
                },
              },
            },
          },
        },
      },
      schemas: {
        Article: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the article',
            },
            title: {
              type: 'string',
              description: 'Tiêu đề bài viết',
            },
            content: {
              type: 'string',
              description: 'Nội dung bài viết (có thể chứa HTML)',
            },
            excerpt: {
              type: 'string',
              description: 'Tóm tắt ngắn nội dung bài viết',
            },
            slug: {
              type: 'string',
              description: 'URL-friendly version of the title for SEO',
            },
            image_url: {
              type: 'string',
              format: 'uri',
              description: 'URL hình ảnh đại diện của bài viết',
              nullable: true,
            },
            source_url: {
              type: 'string',
              format: 'uri',
              description: 'URL gốc của bài viết (nếu lấy từ nguồn bên ngoài)',
            },
            source_name: {
              type: 'string',
              description: 'Tên nguồn bài viết (ví dụ: VnExpress, Tuổi Trẻ)',
            },
            category: {
              type: 'string',
              description: 'Danh mục chính của bài viết',
            },
            category_slug: {
              type: 'string',
              description: 'URL-friendly version of the category name',
            },
            published_at: {
              type: 'string',
              format: 'date-time',
              description: 'Thời gian xuất bản bài viết',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Thời gian tạo bản ghi trong hệ thống',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Thời gian cập nhật lần cuối',
              nullable: true,
            },
            author: {
              type: 'string',
              description: 'Tác giả bài viết',
              nullable: true,
            },
            status: {
              type: 'string',
              enum: ['draft', 'published', 'archived'],
              default: 'published',
              description: 'Trạng thái bài viết',
            },
            view_count: {
              type: 'integer',
              default: 0,
              description: 'Số lượt xem bài viết',
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Các từ khóa liên quan đến bài viết',
            },
          },
          required: ['title', 'content', 'category', 'source_name'],
          example: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            title: 'Tiêu đề bài viết mẫu',
            content: '<p>Nội dung bài viết mẫu với HTML</p>',
            excerpt: 'Tóm tắt nội dung bài viết mẫu',
            slug: 'tieu-de-bai-viet-mau',
            image_url: 'https://example.com/image.jpg',
            source_url: 'https://example.com/original-article',
            source_name: 'VnExpress',
            category: 'Thời sự',
            category_slug: 'thoi-su',
            published_at: '2023-06-25T10:00:00Z',
            created_at: '2023-06-25T09:00:00Z',
            updated_at: '2023-06-25T09:30:00Z',
            author: 'Nguyễn Văn A',
            status: 'published',
            view_count: 100,
            tags: ['thoitiet', 'nangnong', 'mua'],
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            total: {
              type: 'integer',
              description: 'Tổng số mục',
              example: 100,
            },
            page: {
              type: 'integer',
              description: 'Trang hiện tại',
              example: 1,
            },
            limit: {
              type: 'integer',
              description: 'Số mục mỗi trang',
              example: 10,
            },
            totalPages: {
              type: 'integer',
              description: 'Tổng số trang',
              example: 10,
            },
            hasNextPage: {
              type: 'boolean',
              description: 'Có trang tiếp theo không',
              example: true,
            },
            hasPrevPage: {
              type: 'boolean',
              description: 'Có trang trước đó không',
              example: false,
            },
          },
          required: ['total', 'page', 'limit', 'totalPages', 'hasNextPage', 'hasPrevPage'],
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              description: 'Thông báo lỗi',
              example: 'Thông báo lỗi chi tiết',
            },
            code: {
              type: 'string',
              description: 'Mã lỗi (nếu có)',
              example: 'NOT_FOUND',
              nullable: true,
            },
            details: {
              type: 'object',
              description: 'Chi tiết lỗi bổ sung',
              nullable: true,
              additionalProperties: true,
            },
          },
          required: ['success', 'error'],
        },
      },
      security: [
        {
          bearerAuth: [],
        },
        {
          apiKeyAuth: [],
        },
      ],
      tags: [
        {
          name: 'Articles',
          description: 'Operations about articles',
        },
        {
          name: 'Auth',
          description: 'Authentication operations',
        },
        {
          name: 'Categories',
          description: 'News categories operations',
        },
        {
          name: 'Search',
          description: 'Search operations',
        },
      ],
    },
    apis: [
      './src/routes/*.ts',
      './src/routes/*.js',
      './src/controllers/*.ts',
      './src/controllers/*.js',
      {
        name: 'Categories',
        description: 'News categories operations',
      },
      {
        name: 'Search',
        description: 'Search operations',
      },
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/routes/*.js',
    './src/controllers/*.ts',
    './src/controllers/*.js',
  ],
};

const specs = swaggerJsdoc(options);

export default specs;
