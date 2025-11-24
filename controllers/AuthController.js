const bcrypt = require('bcrypt');

const { User } = require('../models');
const { createAccessToken, COOKIE_MAX_AGE } = require('../utils/token');

const auth_register = async (req, res, next) => {
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

    await User.create({
      email: email.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      password: hashPassword,
    });

    const user = await User.findOne({
      where: { email },
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
    next(error);
  }
};

const auth_login = async (req, res, next) => {
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

    const dbPassword = user.dataValues.password;
    const match = await bcrypt.compare(password, dbPassword);

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
    next(error);
  }
};

const auth_logout = async (req, res) => {
  res.clearCookie('access-token');

  return res.status(200).json('Logged out successfully');
};

module.exports = {
  auth_login,
  auth_register,
  auth_logout,
};
