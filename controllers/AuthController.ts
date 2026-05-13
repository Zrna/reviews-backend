import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';

import { User } from '../models';
import { COOKIE_MAX_AGE, createAccessToken } from '../utils/token';

const googleOAuthClient = new OAuth2Client();

const auth_register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, firstName, lastName, password } = req.body;

    const emailExist = await User.findOne({
      where: {
        email: email.trim(),
      },
    });

    if (emailExist) {
      return res.status(409).json({
        error: 'This email is already registered',
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email: email.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      password: hashPassword,
    });

    const accessToken = createAccessToken(user);

    res.cookie('access-token', accessToken, {
      maxAge: COOKIE_MAX_AGE,
      // httpOnly: true, // if active, can't read cookie from the frontend
      secure: process.env.NODE_ENV === 'production', // only send over HTTPS in production
      sameSite: 'lax', // CSRF protection while allowing cross-site GET requests
    });

    return res.status(201).json({
      accessToken,
      message: 'User registered',
    });
  } catch (error) {
    return next(error);
  }
};

const auth_login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: {
        email: email.trim(),
      },
    });

    if (!user) {
      return res.status(404).json({
        error: 'User does not exist',
      });
    }

    if (!user.password) {
      return res.status(401).json({
        error: 'This account uses social sign-in. Please continue with your provider.',
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        error: 'Wrong email and password combination',
      });
    }

    const accessToken = createAccessToken(user);

    res.cookie('access-token', accessToken, {
      maxAge: COOKIE_MAX_AGE,
      // httpOnly: true, // if active, can't read cookie from the frontend
      secure: process.env.NODE_ENV === 'production', // only send over HTTPS in production
      sameSite: 'lax', // CSRF protection while allowing cross-site GET requests
    });

    return res.status(200).json({ accessToken });
  } catch (error) {
    return next(error);
  }
};

const auth_google = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idToken } = req.body;

    const audience = process.env.GOOGLE_OAUTH_CLIENT_IDS!.split(',').map(id => id.trim());

    let payload;
    try {
      const ticket = await googleOAuthClient.verifyIdToken({ idToken, audience });
      payload = ticket.getPayload();
    } catch {
      return res.status(401).json({ error: 'Invalid Google ID token' });
    }

    if (!payload || !payload.sub || !payload.email) {
      return res.status(401).json({ error: 'Invalid Google ID token' });
    }

    if (payload.email_verified !== true) {
      return res.status(401).json({ error: 'Google account email is not verified' });
    }

    const email = payload.email;
    const sub = payload.sub;

    let user = await User.findOne({
      where: { authProvider: 'google', providerSub: sub },
    });

    if (!user) {
      user = await User.findOne({ where: { email } });

      if (user) {
        if (user.authProvider === 'local') {
          user.authProvider = 'google';
          user.providerSub = sub;
          await user.save();
        } else if (user.authProvider === 'google' && user.providerSub !== sub) {
          return res.status(409).json({ error: 'Account inconsistency for this email' });
        } else if (user.authProvider !== 'google') {
          return res.status(409).json({ error: 'Email already linked to another sign-in method' });
        }
      } else {
        const fallbackFirstName = email.split('@')[0];
        user = await User.create({
          email,
          firstName: payload.given_name || fallbackFirstName,
          lastName: payload.family_name || '',
          authProvider: 'google',
          providerSub: sub,
          password: null,
        });
      }
    }

    const accessToken = createAccessToken(user);

    res.cookie('access-token', accessToken, {
      maxAge: COOKIE_MAX_AGE,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return res.status(200).json({ accessToken });
  } catch (error) {
    return next(error);
  }
};

const auth_logout = async (_req: Request, res: Response) => {
  res.clearCookie('access-token');

  return res.status(200).json('Logged out successfully');
};

export { auth_google, auth_login, auth_logout, auth_register };
