const { User, Review } = require('../models');
const { getUserIdFromRequest } = require('../utils/user');

const get_account = async (req, res, next) => {
  try {
    const userId = getUserIdFromRequest(req);

    const user = await User.findOne({
      where: {
        id: userId,
      },
    });

    const { id, email, firstName, lastName, createdAt, updatedAt } = user.dataValues;

    return res.status(200).json({
      id,
      email,
      firstName,
      lastName,
      createdAt,
      updatedAt,
    });
  } catch (err) {
    next(err);
  }
};

const update_account = async (req, res, next) => {
  try {
    const userId = getUserIdFromRequest(req);

    const { firstName, lastName } = req.body;

    await User.update(
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      },
      {
        where: {
          id: userId,
        },
      }
    );

    const user = await User.findOne({
      where: {
        id: userId,
      },
    });

    const { id, email, firstName: updatedFirstName, lastName: updatedLastName, createdAt, updatedAt } = user.dataValues;

    return res.status(200).json({
      id,
      email,
      firstName: updatedFirstName,
      lastName: updatedLastName,
      createdAt,
      updatedAt,
    });
  } catch (err) {
    next(err);
  }
};

const delete_account = async (req, res, next) => {
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
    next(err);
  }
};

module.exports = {
  get_account,
  update_account,
  delete_account,
};
