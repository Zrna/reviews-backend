import { Request } from 'express';

// TODO: Can this be removed? We can just use req.userId directly in controllers, but this is a bit cleaner and abstracts away the auth middleware dependency.
/**
 * Get the authenticated user's ID from the request.
 * Relies on validateToken middleware having set req.userId.
 * Throws if called on an unauthenticated request.
 */
export const getUserIdFromRequest = (req: Request): number => {
  if (!req.userId) {
    throw new Error('User ID not found on request. Is the auth middleware applied?');
  }
  return req.userId;
};
