const { Review, Image } = require('../models');
const { getUserIdFromRequest } = require('../utils/user');
const { getPlatformOrMediaUrl } = require('../utils/platforms');

const ImageController = require('./ImageController');

const get_all_reviews = async (req, res, next) => {
  try {
    const userId = getUserIdFromRequest(req);

    const reviews = await Review.findAll({
      where: {
        userId,
      },
      order: [['updatedAt', 'DESC']],
      include: [
        {
          model: Image,
          as: 'image',
          attributes: ['img'], // Only select the 'img' attribute
        },
      ],
    });

    return res.status(200).json({
      data: reviews,
      totalRecords: reviews.length,
    });
  } catch (err) {
    next(err);
  }
};

const get_latest_reviews = async (req, res, next) => {
  try {
    const userId = getUserIdFromRequest(req);

    const reviews = await Review.findAll({
      where: {
        userId,
      },
      order: [['createdAt', 'DESC']],
      limit: 5,
      include: [
        {
          model: Image,
          as: 'image',
          attributes: ['img'],
        },
      ],
    });

    return res.status(200).json({
      data: reviews,
      totalRecords: reviews.length,
    });
  } catch (err) {
    next(err);
  }
};

const get_reviews_grouped_by_ratings = async (req, res, next) => {
  const userId = getUserIdFromRequest(req);
  const count = req.query.count ? parseInt(req.query.count) : 10;
  const rating = req.params.rating ? parseInt(req.params.rating) : null;
  let ratings;

  if (isNaN(rating)) {
    return res.status(422).json({
      error: 'Rating must be a number',
    });
  }

  if (isNaN(count)) {
    return res.status(422).json({
      error: 'Count must be a number',
    });
  }

  if (typeof rating === 'number') {
    if (rating < 0 || rating > 5) {
      return res.status(422).json({
        error: 'Rating must be between 0 and 5',
      });
    } else if (rating === 0) {
      ratings = [null];
    } else {
      ratings = [rating];
    }
  } else {
    ratings = [5, 4, 3, 2, 1, null];
  }

  try {
    const groupedReviews = await Promise.all(
      ratings.map(async rating => {
        const reviews = await Review.findAll({
          where: {
            userId,
            rating,
          },
          limit: count,
          order: [
            ['rating', 'DESC'],
            ['updatedAt', 'DESC'],
          ],
          include: [
            {
              model: Image,
              as: 'image',
              attributes: ['img'],
            },
          ],
        });

        return {
          rating,
          reviews,
        };
      })
    );

    return res.status(200).json(groupedReviews);
  } catch (err) {
    next(err);
  }
};

const create_review = async (req, res, next) => {
  try {
    const userId = getUserIdFromRequest(req);

    const { name: reqName, rating, review: reqReview, url: reqUrl, watchAgain } = req.body;

    const name = reqName && reqName.trim();
    const review = reqReview && reqReview.trim();
    const url = reqUrl && reqUrl.trim() && getPlatformOrMediaUrl(reqUrl);

    if (!name) {
      return res.status(422).json({
        error: "Name can't be empty",
      });
    }

    if (!review) {
      return res.status(422).json({
        error: "Review can't be empty",
      });
    }

    const reviewExist = await Review.findOne({
      where: {
        userId,
        name,
      },
    });

    if (reviewExist) {
      return res.status(409).json({
        error: `Review for '${name}' already exists`,
      });
    }

    const dbImg = await ImageController.get_image_by_name_from_database(name);
    let imageId = null;

    if (dbImg) {
      imageId = dbImg.id;
    } else {
      const newDbImage = await ImageController.get_image_by_name_from_api(name);

      if (newDbImage) {
        imageId = newDbImage.id;
      }
    }

    const newReview = await Review.create({
      name,
      rating,
      review,
      url,
      userId,
      watchAgain: watchAgain ?? false,
      imageId,
    });

    return res.status(201).json(newReview);
  } catch (err) {
    next(err);
  }
};

const get_review_by_id = async (req, res, next) => {
  try {
    const userId = getUserIdFromRequest(req);
    const reviewId = req.params.id;

    const review = await Review.findOne({
      where: {
        id: reviewId,
        userId,
      },
      include: [
        {
          model: Image,
          as: 'image',
          attributes: ['img'],
        },
      ],
    });

    if (!review) {
      return res.status(404).json({
        error: 'Review not found',
      });
    }

    if (review.userId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
      });
    }

    return res.status(200).json(review);
  } catch (err) {
    next(err);
  }
};

const update_review_by_id = async (req, res, next) => {
  try {
    const userId = getUserIdFromRequest(req);
    const reviewId = req.params.id;

    const { rating, review: reqReview, url: reqUrl, watchAgain } = req.body;
    const review = reqReview && reqReview.trim();
    const url = reqUrl && reqUrl.trim() && getPlatformOrMediaUrl(reqUrl);

    if (!review) {
      return res.status(422).json({
        error: "Review can't be empty",
      });
    }

    await Review.update(
      {
        rating,
        review,
        url,
        watchAgain,
      },
      {
        where: {
          userId,
          id: reviewId,
        },
      }
    );

    const updatedReview = await Review.findOne({
      where: {
        id: reviewId,
      },
      include: [
        {
          model: Image,
          as: 'image',
          attributes: ['img'],
        },
      ],
    });

    if (!updatedReview) {
      return res.status(404).json({
        error: 'Review not found',
      });
    }

    if (updatedReview.userId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
      });
    }

    return res.status(200).json(updatedReview);
  } catch (err) {
    next(err);
  }
};

const delete_review_by_id = async (req, res, next) => {
  try {
    const userId = getUserIdFromRequest(req);
    const reviewId = req.params.id;

    await Review.destroy({
      where: {
        id: reviewId,
        userId,
      },
    });

    return res.status(200).json(true);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  create_review,
  delete_review_by_id,
  get_all_reviews,
  get_review_by_id,
  update_review_by_id,
  get_latest_reviews,
  get_reviews_grouped_by_ratings,
};
