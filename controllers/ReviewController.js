const { Review, Image } = require('../models');
const { getUserIdFromRequest } = require('../utils/user');
const { getPlatformOrMediaUrl } = require('../utils/platforms');

const ImageController = require('./ImageController');

const get_all_reviews = async (req, res, next) => {
  try {
    const userId = getUserIdFromRequest(req);
    const page = req.query.page || 1;
    const pageSize = req.query.pageSize || 20;
    const offset = (page - 1) * pageSize;

    const { count, rows } = await Review.findAndCountAll({
      where: {
        userId,
      },
      order: [['updatedAt', 'DESC']],
      limit: pageSize,
      offset,
      include: [
        {
          model: Image,
          as: 'image',
          attributes: ['img'],
        },
      ],
    });

    return res.status(200).json({
      data: rows,
      totalRecords: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
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
  const rating = req.params.rating ? parseInt(req.params.rating) : null;

  if (isNaN(rating)) {
    return res.status(422).json({
      error: 'Rating must be a number',
    });
  }

  try {
    // Single rating view — full pagination
    if (typeof rating === 'number') {
      if (rating < 0 || rating > 5) {
        return res.status(422).json({
          error: 'Rating must be between 0 and 5',
        });
      }

      const page = req.query.page || 1;
      const pageSize = req.query.pageSize || 20;
      const offset = (page - 1) * pageSize;
      const ratingValue = rating === 0 ? null : rating;

      const { count, rows } = await Review.findAndCountAll({
        where: { userId, rating: ratingValue },
        limit: pageSize,
        offset,
        order: [['updatedAt', 'DESC']],
        include: [{ model: Image, as: 'image', attributes: ['img'] }],
      });

      return res.status(200).json({
        rating: ratingValue,
        data: rows,
        totalRecords: count,
        page,
        pageSize,
        totalPages: Math.ceil(count / pageSize),
      });
    }

    // Home screen — all rating groups, fixed limit of 10 per group
    const ratings = [5, 4, 3, 2, 1, null];

    const groupedReviews = await Promise.all(
      ratings.map(async ratingValue => {
        const { count, rows } = await Review.findAndCountAll({
          where: { userId, rating: ratingValue },
          limit: 10,
          order: [['updatedAt', 'DESC']],
          include: [{ model: Image, as: 'image', attributes: ['img'] }],
        });

        return {
          rating: ratingValue,
          data: rows,
          totalRecords: count,
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

    const { name, review, rating, url, watchAgain } = req.body;

    const reviewExist = await Review.findOne({
      where: {
        userId,
        name: name.trim(),
      },
    });

    if (reviewExist) {
      return res.status(409).json({
        error: `Review for '${name.trim()}' already exists`,
      });
    }

    const dbImg = await ImageController.get_image_by_name_from_database(name.trim().toLowerCase());
    let imageId = dbImg ? dbImg.id : null;

    if (!imageId) {
      const newDbImage = await ImageController.get_image_by_name_from_api(name.trim());
      imageId = newDbImage ? newDbImage.id : null;
    }

    const newReview = await Review.create({
      name: name.trim(),
      rating: rating || null,
      review: review.trim(),
      url: url ? getPlatformOrMediaUrl(url.trim()) : null,
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
        error: `Review with id ${reviewId} not found`,
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

    const { review, rating, url, watchAgain } = req.body;

    const reviewToUpdate = await Review.findOne({
      where: {
        userId,
        id: reviewId,
      },
    });

    if (!reviewToUpdate) {
      return res.status(404).json({
        error: `Review with id ${reviewId} not found`,
      });
    }

    await Review.update(
      {
        rating: rating !== undefined ? rating : reviewToUpdate.rating,
        review: review ? review.trim() : reviewToUpdate.review,
        url: url ? getPlatformOrMediaUrl(url.trim()) : reviewToUpdate.url,
        watchAgain: watchAgain !== undefined ? watchAgain : reviewToUpdate.watchAgain,
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
