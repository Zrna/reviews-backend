require('dotenv').config();

const { validateEnv } = require('./utils/validateEnv');

// Validate environment variables before starting the application
validateEnv();

const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const swaggerOptions = require('./config/swaggerOptions');
const db = require('./models');
const { errorHandler } = require('./middlewares/errorHandler');
const { apiLimiter } = require('./middlewares/rateLimiter');
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

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

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
