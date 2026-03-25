import fs from 'fs';
import swaggerAutogen from 'swagger-autogen';

const swaggerAutogenInstance = swaggerAutogen({ openapi: '3.0.0' });

const doc = {
  info: {
    title: 'Reviews API',
    version: '1.2.0',
    description: 'API for managing movie and TV show reviews',
  },
  host: process.env.NODE_ENV === 'production' ? 'your-domain.com' : 'localhost:5001',
  schemes: process.env.NODE_ENV === 'production' ? ['https'] : ['http'],
  consumes: ['application/json'],
  produces: ['application/json'],
  tags: [
    {
      name: 'Auth',
      description: 'Authentication endpoints',
    },
    {
      name: 'User',
      description: 'User account management',
    },
    {
      name: 'Reviews',
      description: 'Review CRUD operations',
    },
    {
      name: 'Recommendations',
      description: 'Get recommendations from TMDB',
    },
    {
      name: 'Status',
      description: 'Health check endpoint',
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'access-token',
        description: 'JWT token stored in HTTP-only cookie (for web)',
      },
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token in Authorization header (for mobile)',
      },
    },
  },
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./index.ts'];

interface SwaggerEndpoint {
  tags?: string[];
  responses: Record<string, unknown>;
}

interface SwaggerData {
  paths: Record<string, Record<string, SwaggerEndpoint>>;
  components?: Record<string, unknown>;
}

interface RouteDefinition {
  status: string;
  description: string;
  schema: Record<string, unknown>;
  extra?: Record<string, unknown>;
}

swaggerAutogenInstance(outputFile, endpointsFiles, doc).then(result => {
  if (!result) {
    console.log('Generated: false');
    return;
  }

  const { success, data } = result;
  console.log(`Generated: ${success}`);

  if (success) {
    const swaggerData = data as unknown as SwaggerData;

    // Add schema definitions directly to avoid meta-processing
    if (!swaggerData.components) swaggerData.components = {};
    swaggerData.components.schemas = {
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          firstName: { type: 'string', example: 'John' },
          lastName: { type: 'string', example: 'Doe' },
          email: { type: 'string', example: 'john@example.com' },
          createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
          updatedAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        },
      },
      Review: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          userId: { type: 'integer', example: 1 },
          mediaId: { type: 'integer', example: 1, nullable: true },
          name: { type: 'string', example: 'Breaking Bad' },
          review: { type: 'string', example: 'Amazing series!' },
          rating: { type: 'integer', example: 5, nullable: true },
          url: { type: 'string', example: 'https://www.imdb.com/title/tt0903747/', nullable: true },
          watchAgain: { type: 'boolean', example: true },
          createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
          updatedAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
          media: {
            type: 'object',
            nullable: true,
            properties: {
              img: { type: 'string', example: 'https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg' },
            },
          },
        },
      },
      ReviewInput: {
        type: 'object',
        required: ['name', 'review'],
        properties: {
          name: { type: 'string', example: 'Breaking Bad' },
          review: { type: 'string', example: 'Amazing series!' },
          rating: { type: 'integer', example: 5, minimum: 1, maximum: 5 },
          url: { type: 'string', example: 'https://www.imdb.com/title/tt0903747/' },
          watchAgain: { type: 'boolean', example: true },
        },
      },
      ReviewUpdate: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Breaking Bad' },
          review: { type: 'string', example: 'Updated review text' },
          rating: { type: 'integer', example: 4, minimum: 1, maximum: 5 },
          url: { type: 'string', example: 'https://www.imdb.com/title/tt0903747/' },
          watchAgain: { type: 'boolean', example: false },
        },
      },
      RegisterInput: {
        type: 'object',
        required: ['firstName', 'lastName', 'email', 'password'],
        properties: {
          firstName: { type: 'string', example: 'John' },
          lastName: { type: 'string', example: 'Doe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          password: { type: 'string', format: 'password', example: 'password123' },
        },
      },
      LoginInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          password: { type: 'string', format: 'password', example: 'password123' },
        },
      },
      UpdateAccountInput: {
        type: 'object',
        required: ['firstName', 'lastName'],
        properties: {
          firstName: { type: 'string', example: 'John' },
          lastName: { type: 'string', example: 'Doe' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Error message' },
          message: { type: 'string', example: 'Additional error details' },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'email' },
                message: { type: 'string', example: 'Invalid email format' },
              },
            },
          },
          stack: { type: 'string', example: 'Error: ...' },
        },
        required: ['error'],
      },
      ValidationErrorResponse: {
        type: 'object',
        properties: {
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                msg: { type: 'string', example: 'Validation error message' },
                param: { type: 'string', example: 'fieldName' },
                location: { type: 'string', example: 'body' },
              },
            },
          },
        },
      },
      StatusResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'healthy' },
          uptime: { type: 'string', example: '2h 15m 30s' },
          version: { type: 'string', example: '1.2.0' },
          database: {
            type: 'object',
            properties: {
              status: { type: 'string', example: 'connected' },
            },
          },
          timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          message: { type: 'string', example: 'User registered' },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        },
      },
      RecommendationResponse: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'the night agent' },
          type: { type: 'string', example: 'tv show' },
          genre: { type: 'array', items: { type: 'string' }, example: ['action', 'thriller'] },
          img: {
            type: 'object',
            nullable: true,
            properties: {
              img: { type: 'string', example: 'https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg' },
            },
          },
        },
      },
      GroupedReviewsResponse: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            rating: { type: 'integer', nullable: true, example: 5 },
            reviews: { type: 'array', items: { $ref: '#/components/schemas/Review' } },
            totalRecords: { type: 'integer', example: 28 },
          },
        },
      },
      PaginatedReviewsResponse: {
        type: 'object',
        properties: {
          data: { type: 'array', items: { $ref: '#/components/schemas/Review' } },
          totalRecords: { type: 'integer', example: 42 },
          page: { type: 'integer', example: 1 },
          pageSize: { type: 'integer', example: 20 },
          totalPages: { type: 'integer', example: 3 },
        },
      },
      PaginatedRatingReviewsResponse: {
        type: 'object',
        properties: {
          rating: { type: 'integer', nullable: true, example: 5 },
          data: { type: 'array', items: { $ref: '#/components/schemas/Review' } },
          totalRecords: { type: 'integer', example: 28 },
          page: { type: 'integer', example: 1 },
          pageSize: { type: 'integer', example: 20 },
          totalPages: { type: 'integer', example: 2 },
        },
      },
    };

    // ─── Helpers ────────────────────────────────────────────────────────────────

    const errorRef = { $ref: '#/components/schemas/ErrorResponse' };
    const validationRef = { $ref: '#/components/schemas/ValidationErrorResponse' };

    const errorResponse = (description: string) => ({
      description,
      content: { 'application/json': { schema: errorRef } },
    });

    const validationResponse = (description = 'Validation error') => ({
      description,
      content: { 'application/json': { schema: validationRef } },
    });

    const jsonResponse = (description: string, schema: Record<string, unknown>) => ({
      description,
      content: { 'application/json': { schema } },
    });

    // Public routes that do not require bearer/cookie auth
    const PUBLIC_PATHS = new Set(['/register', '/login', '/logout', '/status']);

    const applyDefaultResponses = (path: string, method: string, endpoint: SwaggerEndpoint): void => {
      const isPublic = PUBLIC_PATHS.has(path);
      const hasPathParam = path.includes('{');

      if (!isPublic) {
        endpoint.responses['401'] =
          endpoint.responses['401'] || errorResponse('Unauthorized - token missing or invalid');
      }

      if ((method === 'post' || method === 'put') && !isPublic) {
        endpoint.responses['400'] = endpoint.responses['400'] || validationResponse();
      }

      if (hasPathParam) {
        endpoint.responses['404'] = endpoint.responses['404'] || errorResponse('Resource not found');
      }

      if (method === 'post' && !isPublic) {
        endpoint.responses['409'] = endpoint.responses['409'] || errorResponse('Resource already exists');
      }
    };

    // ─── Route-specific success (2xx) response schemas ───────────────────────
    const ROUTE_SUCCESS: Record<string, RouteDefinition> = {
      'post /register': {
        status: '201',
        description: 'User created successfully',
        schema: { $ref: '#/components/schemas/AuthResponse' },
        extra: { 404: errorResponse('User not found after creation') },
      },
      'post /login': {
        status: '200',
        description: 'Login successful',
        schema: { $ref: '#/components/schemas/LoginResponse' },
        extra: {
          401: errorResponse('Invalid credentials'),
          404: errorResponse('User not found'),
        },
      },
      'post /logout': {
        status: '200',
        description: 'Logout successful',
        schema: { type: 'string', example: 'Logged out successfully' },
      },
      'get /api/account': {
        status: '200',
        description: 'User account data',
        schema: { $ref: '#/components/schemas/User' },
      },
      'put /api/account': {
        status: '200',
        description: 'Account updated successfully',
        schema: { $ref: '#/components/schemas/User' },
      },
      'delete /api/account': {
        status: '200',
        description: 'Account deleted successfully',
        schema: { type: 'boolean', example: true },
      },
      'get /api/reviews': {
        status: '200',
        description: 'Paginated list of user reviews',
        schema: { $ref: '#/components/schemas/PaginatedReviewsResponse' },
      },
      'post /api/reviews': {
        status: '201',
        description: 'Review created successfully',
        schema: { $ref: '#/components/schemas/Review' },
      },
      'get /api/reviews/{id}': {
        status: '200',
        description: 'Review details',
        schema: { $ref: '#/components/schemas/Review' },
      },
      'put /api/reviews/{id}': {
        status: '200',
        description: 'Review updated successfully',
        schema: { $ref: '#/components/schemas/Review' },
      },
      'delete /api/reviews/{id}': {
        status: '200',
        description: 'Review deleted successfully',
        schema: { type: 'boolean', example: true },
      },
      'get /api/reviews/latest': {
        status: '200',
        description: 'Latest reviews',
        schema: {
          type: 'object',
          properties: {
            data: { type: 'array', items: { $ref: '#/components/schemas/Review' } },
            totalRecords: { type: 'integer', example: 5 },
          },
        },
      },
      'get /api/reviews/grouped-by-ratings': {
        status: '200',
        description: 'Reviews grouped by rating',
        schema: { $ref: '#/components/schemas/GroupedReviewsResponse' },
        extra: { 422: errorResponse('Invalid rating parameter') },
      },
      'get /api/reviews/grouped-by-ratings/{rating}': {
        status: '200',
        description: 'Paginated reviews for specific rating',
        schema: { $ref: '#/components/schemas/PaginatedRatingReviewsResponse' },
        extra: { 422: errorResponse('Invalid rating parameter (must be 0-5)') },
      },
      'get /api/recommendation': {
        status: '200',
        description: 'Random recommendation',
        schema: { $ref: '#/components/schemas/RecommendationResponse' },
      },
      'get /status': {
        status: '200',
        description: 'Application is healthy',
        schema: { $ref: '#/components/schemas/StatusResponse' },
        extra: {
          503: jsonResponse('Service unavailable', {
            type: 'object',
            properties: {
              status: { type: 'string', example: 'unhealthy' },
              uptime: { type: 'string', example: '2h 15m 30s' },
              version: { type: 'string', example: '1.2.0' },
              database: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'disconnected' },
                  error: { type: 'string', example: 'Connection refused' },
                },
              },
              timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
            },
          }),
        },
      },
    };

    // ─── Apply to all paths ───────────────────────────────────────────────────
    for (const path in swaggerData.paths) {
      for (const method in swaggerData.paths[path]) {
        const endpoint = swaggerData.paths[path][method];

        // Auto-assign tags based on path
        if (!endpoint.tags || endpoint.tags.length === 0) {
          if (path.includes('/register') || path.includes('/login') || path.includes('/logout')) {
            endpoint.tags = ['Auth'];
          } else if (path.includes('/account')) {
            endpoint.tags = ['User'];
          } else if (path.includes('/reviews')) {
            endpoint.tags = ['Reviews'];
          } else if (path.includes('/recommendation')) {
            endpoint.tags = ['Recommendations'];
          } else if (path.includes('/status')) {
            endpoint.tags = ['Status'];
          }
        }

        if (!endpoint.responses) endpoint.responses = {};

        // Apply route-specific success schema and any extra responses
        const key = `${method} ${path}`;
        const routeDef = ROUTE_SUCCESS[key];
        if (routeDef) {
          endpoint.responses[routeDef.status] = jsonResponse(routeDef.description, routeDef.schema);
          if (routeDef.extra) {
            Object.assign(endpoint.responses, routeDef.extra);
          }
        }

        // Apply convention-based error responses (fills gaps only, won't overwrite)
        applyDefaultResponses(path, method, endpoint);
      }
    }
    fs.writeFileSync(outputFile, JSON.stringify(swaggerData, null, 2));
    console.log('Swagger documentation generated successfully!');
    console.log('View at: http://localhost:5001/api-docs');
  }
});
