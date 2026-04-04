import dotenv from 'dotenv';
dotenv.config();

import { validateEnv } from './utils/validateEnv';

// Validate environment variables before starting the application
validateEnv();

import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';
import fs from 'fs';
import pinoHttp from 'pino-http';
import swaggerUI from 'swagger-ui-express';

import { errorHandler } from './middlewares/errorHandler';
import { apiLimiter } from './middlewares/rateLimiter';
import { requestId } from './middlewares/requestId';
import { sequelize } from './models';
import authRoutes from './routes/Auth';
import recommendationRoutes from './routes/Recommendation';
import reviewRoutes from './routes/Review';
import statusRoutes from './routes/Status';
import userRoutes from './routes/User';
import { logger } from './utils/logger';

const PORT = process.env.PORT || 5001;
const app = express();

sequelize
  .authenticate()
  .then(() => logger.info('Database connected'))
  .catch((error: unknown) => logger.error(error, 'Database connection error'));

// Load auto-generated Swagger documentation
let swaggerDocument: Record<string, unknown> | null;
try {
  swaggerDocument = JSON.parse(fs.readFileSync('./swagger-output.json', 'utf8'));
} catch (error) {
  logger.warn('Swagger documentation not found. Run: npm run swagger');
  logger.warn('API docs will not be available at /api-docs');
  swaggerDocument = null;
}

if (swaggerDocument) {
  // Swagger UI at /api-docs
  app.use(
    '/api-docs',
    swaggerUI.serve,
    swaggerUI.setup(swaggerDocument, {
      swaggerOptions: {
        docExpansion: 'none', // Keep all sections collapsed by default
        defaultModelsExpandDepth: 3,
        defaultModelExpandDepth: 3,
      },
    })
  );

  // Raw JSON spec at /api-docs/swagger.json for openapi-typescript
  app.get('/api-docs/swagger.json', (_req: Request, res: Response) => {
    res.json(swaggerDocument);
  });
}

// Assign a unique request ID to every incoming request
app.use(requestId);

// Enable gzip compression for all responses
app.use(compression());

app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: ['http://localhost:3000'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// HTTP request logging via pino-http (after body parsers so req.body is available)
app.use(
  pinoHttp({
    logger,
    customLogLevel: (_req, res, err) => {
      if (err || res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
    customProps: (req: Request) => ({
      requestId: req.id,
      userId: req.userId || 'anonymous',
    }),
    serializers: {
      req(req) {
        req.body = req.raw.body;
        return req;
      },
    },
    customSuccessMessage: (req, res) => `${req.method} ${req.url} ${res.statusCode}`,
    customErrorMessage: (req, res) => `${req.method} ${req.url} ${res.statusCode}`,
  })
);

// Apply rate limiting to all routes
app.use(apiLimiter);

// Status check endpoint - no authentication required
app.use(statusRoutes);

app.use(authRoutes);
app.use(userRoutes);
app.use(reviewRoutes);
app.use(recommendationRoutes);

app.all('/{*any}', (req: Request, res: Response) => {
  return res.status(404).send({
    error: 'Route Not Found',
    requestId: req.id,
  });
});

// Global error handler - must be last
app.use(errorHandler);

const server = app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

// eslint-disable-next-line no-undef
server.on('error', (error: NodeJS.ErrnoException) => {
  logger.error(error, `Cannot listen on PORT: ${PORT}`);
});
