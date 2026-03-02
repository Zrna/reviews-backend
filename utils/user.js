/**
 * Get the authenticated user's ID from the request.
 * Relies on validateToken middleware having set req.userId.
 */
const getUserIdFromRequest = req => {
  return req.userId;
};

module.exports = {
  getUserIdFromRequest,
};
