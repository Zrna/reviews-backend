import { sign } from 'jsonwebtoken';

export const TOKEN_EXPIRATION = '15d';
export const TOKEN_REFRESH_THRESHOLD = 7 * 24 * 60 * 60; // 7 days in seconds. When to trigger sliding session refresh
export const COOKIE_MAX_AGE = 15 * 24 * 60 * 60 * 1000; // 15 days in milliseconds

export const createAccessToken = (user: { id: number; email: string }): string => {
  const accessToken = sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.TOKEN_SECRET!,
    {
      expiresIn: TOKEN_EXPIRATION,
    }
  );

  return accessToken;
};
