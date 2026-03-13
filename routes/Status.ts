import { Request, Response, Router } from 'express';

import { sequelize } from '../models';
import packageJson from '../package.json';

const router = Router();

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
router.get('/status', async (req: Request, res: Response) => {
  const uptime = Date.now() - startTime;
  const hours = Math.floor(uptime / (1000 * 60 * 60));
  const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((uptime % (1000 * 60)) / 1000);
  const uptimeString = `${hours}h ${minutes}m ${seconds}s`;

  try {
    // Test database connectivity
    await sequelize.authenticate();

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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return res.status(503).json({
      status: 'unhealthy',
      uptime: uptimeString,
      version: packageJson.version,
      database: {
        status: 'disconnected',
        error: errorMessage,
      },
      timestamp: new Date().toISOString(),
    });
  }
});

export = router;
