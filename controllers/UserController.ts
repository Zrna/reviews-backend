import { NextFunction, Request, Response } from 'express';

import { Review, User } from '../models';
import { getUserIdFromRequest } from '../utils/user';

const get_account = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserIdFromRequest(req);

    const user = await User.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { id, email, firstName, lastName, createdAt, updatedAt } = user;

    return res.status(200).json({
      id,
      email,
      firstName,
      lastName,
      createdAt,
      updatedAt,
    });
  } catch (err) {
    return next(err);
  }
};

const update_account = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserIdFromRequest(req);

    const { firstName, lastName } = req.body;

    const user = await User.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    });

    const { id, email, firstName: updatedFirstName, lastName: updatedLastName, createdAt, updatedAt } = user;

    return res.status(200).json({
      id,
      email,
      firstName: updatedFirstName,
      lastName: updatedLastName,
      createdAt,
      updatedAt,
    });
  } catch (err) {
    return next(err);
  }
};

const delete_account = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserIdFromRequest(req);

    await User.destroy({
      where: {
        id: userId,
      },
    });

    await Review.destroy({
      where: {
        userId,
      },
    });

    return res.status(200).cookie('access-token', '', { maxAge: 1 }).json(true);
  } catch (err) {
    return next(err);
  }
};

export { delete_account, get_account, update_account };
