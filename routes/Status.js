const express = require('express');

const db = require('../models');
const packageJson = require('../package.json');

const router = express.Router();

const startTime = Date.now();

// #swagger.tags = ['Status']
// #swagger.summary = 'Health check endpoint'
// #swagger.description = 'Returns application status, database connectivity, uptime, and version'
/* #swagger.responses[200] = {
      description: 'Application is healthy',
      content: {
        "application/json": {
          schema: { $ref: "#/definitions/StatusResponse" }
        }
      }
    }
*/
/* #swagger.responses[503] = {
      description: 'Service unavailable - database connection failed',
      content: {
        "application/json": {
          schema: { $ref: "#/definitions/ErrorResponse" }
        }
      }
    }
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
