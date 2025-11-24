const { verify, sign } = require('jsonwebtoken');
const { TOKEN_EXPIRATION, TOKEN_REFRESH_THRESHOLD, COOKIE_MAX_AGE } = require('../utils/token');

const validateToken = (req, res, next) => {
  // Support both cookie-based (web) and Bearer token (mobile) authentication
  let accessToken = req.cookies['access-token'];

  // If no cookie, check Authorization header for Bearer token (mobile clients)
  if (!accessToken && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      accessToken = parts[1];
    }
  }

  if (!accessToken) {
    return res.status(401).json({
      error: 'Access token is missing',
    });
  }

  try {
    const decodedToken = verify(accessToken, process.env.TOKEN_SECRET);

    if (decodedToken) {
      req.authenticated = true;
      req.userId = decodedToken.id; // Store user ID for controllers

      // Sliding session: Refresh token if it expires in less than 7 days
      const now = Math.floor(Date.now() / 1000); // Current time in seconds
      const timeUntilExpiry = decodedToken.exp - now;

      if (timeUntilExpiry < TOKEN_REFRESH_THRESHOLD) {
        // Create new token with fresh 15-day expiration
        const newToken = sign(
          {
            id: decodedToken.id,
            email: decodedToken.email,
          },
          process.env.TOKEN_SECRET,
          {
            expiresIn: TOKEN_EXPIRATION,
          }
        );

        // Set cookie for web clients
        res.cookie('access-token', newToken, {
          maxAge: COOKIE_MAX_AGE,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });

        // Send new token in response header for mobile clients
        res.setHeader('X-New-Token', newToken);
      }

      return next();
    }
  } catch (error) {
    // Handle expired tokens specifically
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token has expired. Please login again.',
      });
    }

    // Handle invalid tokens
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token. Please login again.',
      });
    }

    // Other token validation errors
    return res.status(401).json({
      error: 'Token validation failed',
    });
  }
};

module.exports = {
  validateToken,
};
