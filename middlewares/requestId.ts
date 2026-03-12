import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';

/**
 * Middleware that assigns a unique request ID to each incoming request.
 * - Uses the client-provided X-Request-ID header if present (for distributed tracing)
 * - Otherwise generates a new UUID v4 via Node's built-in crypto module
 * - Attaches the ID to req.id and sets it on the response header
 */
const requestId = (req: Request, res: Response, next: NextFunction) => {
  const id = (req.headers['x-request-id'] as string) || crypto.randomUUID();

  req.id = id;
  res.setHeader('X-Request-ID', id);

  next();
};

export { requestId };
