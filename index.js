require('dotenv').config();

const { validateEnv } = require('./utils/validateEnv');

// Validate environment variables before starting the application
validateEnv();

const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');
const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const swaggerUI = require('swagger-ui-express');

const db = require('./models');
const { errorHandler } = require('./middlewares/errorHandler');
const { apiLimiter } = require('./middlewares/rateLimiter');
const statusRoutes = require('./routes/Status');
const authRoutes = require('./routes/Auth');
const userRoutes = require('./routes/User');
const reviewRoutes = require('./routes/Review');
const recommendationRoutes = require('./routes/Recommendation');

const PORT = process.env.PORT || 5001;
const app = express();

db.sequelize
  .authenticate()
  .then(() => console.log('Database connected'))
  .catch(error => console.log('Database connection error:', error));

// Load auto-generated Swagger documentation
let swaggerDocument;
try {
  swaggerDocument = JSON.parse(fs.readFileSync('./swagger-output.json', 'utf8'));
} catch (error) {
  console.warn('⚠️  Swagger documentation not found. Run: npm run swagger');
  console.warn('   API docs will not be available at /api-docs');
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
  app.get('/api-docs/swagger.json', (req, res) => {
    res.json(swaggerDocument);
  });
}

// Add request logging - logs when request starts and completes
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  // Log when request arrives (immediate)
  app.use((req, res, next) => {
    console.log(`→ ${req.method} ${req.url}`);
    next();
  });
  // Log when request completes (with timing)
  app.use(morgan('dev'));
}

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

// Apply rate limiting to all routes
app.use(apiLimiter);

// Status check endpoint - no authentication required
app.use(statusRoutes);

app.use(authRoutes);
app.use(userRoutes);
app.use(reviewRoutes);
app.use(recommendationRoutes);

app.use('*', (_, res) => {
  return res.status(404).send({
    error: 'Route Not Found',
  });
});

// Global error handler - must be last
app.use(errorHandler);

app.listen(PORT, error => {
  if (error) return console.log(`Cannot listen on PORT: ${PORT}`);
  console.log(`Server is running on port ${PORT}`);
});
