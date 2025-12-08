const express = require('express');

const db = require('../models');
const packageJson = require('../package.json');

const router = express.Router();

const startTime = Date.now();

/**
 * @swagger
 * /status:
 *  get:
 *    tags:
 *      - status
 *    summary: Status check endpoint
 *    description: Returns application status, database connectivity, uptime, and version
 *    responses:
 *      200:
 *        description: Application is healthy
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: string
 *                  example: healthy
 *                uptime:
 *                  type: string
 *                  example: 2h 15m 30s
 *                version:
 *                  type: string
 *                  example: 1.0.0
 *                database:
 *                  type: object
 *                  properties:
 *                    status:
 *                      type: string
 *                      example: connected
 *                timestamp:
 *                  type: string
 *                  example: 2025-12-08T10:30:00.000Z
 *      503:
 *        description: Service unavailable - database connection failed
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: string
 *                  example: unhealthy
 *                database:
 *                  type: object
 *                  properties:
 *                    status:
 *                      type: string
 *                      example: disconnected
 *                    error:
 *                      type: string
 *                      example: Connection refused
 */
router.get('/status', async (req, res) => {
  const uptime = Date.now() - startTime;
  const hours = Math.floor(uptime / (1000 * 60 * 60));
  const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((uptime % (1000 * 60)) / 1000);
  const uptimeString = `${hours}h ${minutes}m ${seconds}s`;

  try {
    // Test database connectivity
    await db.sequelize.authenticate();

    return res.status(200).json({
      status: 'healthy',
      uptime: uptimeString,
      version: packageJson.version,
      database: {
        status: 'connected',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(503).json({
      status: 'unhealthy',
      uptime: uptimeString,
      version: packageJson.version,
      database: {
        status: 'disconnected',
        error: error.message,
      },
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;
