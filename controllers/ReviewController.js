const { Review, Image } = require('../models');
const { getUserIdFromRequest } = require('../utils/user');
const { getPlatformOrMediaUrl } = require('../utils/platforms');

const ImageController = require('./ImageController');

const get_all_reviews = (req, res) => {
  const userId = getUserIdFromRequest(req);

  Review.findAll({
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
  })
    .then(async reviews => {
      return res.status(200).json({
        data: reviews,
        totalRecords: reviews.length,
      });
    })
    .catch(err => {
      return res.status(err.status || 500).json({
        error: err.message || 'Server Error',
      });
    });
};

const get_latest_reviews = (req, res) => {
  const userId = getUserIdFromRequest(req);

  Review.findAll({
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
  })
    .then(async reviews => {
      return res.status(200).json({
        data: reviews,
        totalRecords: reviews.length,
      });
    })
    .catch(err => {
      return res.status(err.status || 500).json({
        error: err.message || 'Server Error',
      });
    });
};

const get_reviews_grouped_by_ratings = async (req, res) => {
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
    return res.status(err.status || 500).json({
      error: err.message || 'Server Error',
    });
  }
};

const create_review = async (req, res) => {
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

  Review.create({
    name,
    rating,
    review,
    url,
    userId,
    watchAgain: watchAgain ?? false,
    imageId,
  })
    .then(review => {
      return res.status(201).json(review);
    })
    .catch(err => {
      return res.status(err.status || 500).json({
        error: err.message || 'Server Error',
      });
    });
};

const get_review_by_id = (req, res) => {
  const userId = getUserIdFromRequest(req);
  const reviewId = req.params.id;

  Review.findOne({
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
  })
    .then(async review => {
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
    })
    .catch(err => {
      return res.status(err.status || 500).json({
        error: err.message || 'Server Error',
      });
    });
};

const update_review_by_id = async (req, res) => {
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

  Review.update(
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
  )
    .then(() => {
      Review.findOne({
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
      })
        .then(async review => {
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
        })
        .catch(err => {
          return res.status(err.status || 404).json({
            error: err.message || 'Review Not Found',
          });
        });
    })
    .catch(err => {
      return res.status(err.status || 500).json({
        error: err.message || 'Server Error',
      });
    });
};

const delete_review_by_id = (req, res) => {
  const userId = getUserIdFromRequest(req);
  const reviewId = req.params.id;

  Review.destroy({
    where: {
      id: reviewId,
      userId,
    },
  })
    .then(() => {
      return res.status(200).json(true);
    })
    .catch(err => {
      return res.status(err.status || 500).json({
        error: err.message || 'Something went wrong with deleting the review',
      });
    });
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
