const { sign } = require('jsonwebtoken');

const TOKEN_EXPIRATION = '15d';
const TOKEN_REFRESH_THRESHOLD = 7 * 24 * 60 * 60; // 7 days in seconds. When to trigger sliding session refresh
const COOKIE_MAX_AGE = 15 * 24 * 60 * 60 * 1000; // 15 days in milliseconds

const createAccessToken = user => {
  const accessToken = sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.TOKEN_SECRET,
    {
      expiresIn: TOKEN_EXPIRATION,
    }
  );

  return accessToken;
};

module.exports = {
  createAccessToken,
  TOKEN_EXPIRATION,
  TOKEN_REFRESH_THRESHOLD,
  COOKIE_MAX_AGE,
};
