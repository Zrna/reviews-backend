import { Request } from 'express';

/**
 * Get the authenticated user's ID from the request.
 * Relies on validateToken middleware having set req.userId.
 */
export const getUserIdFromRequest = (req: Request): number | undefined => {
  return req.userId;
};
