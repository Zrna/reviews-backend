const express = require('express');

const ReviewController = require('../controllers/ReviewController');
const { validateToken } = require('../middlewares/token');
const {
  createReviewValidator,
  updateReviewValidator,
  reviewIdValidator,
  paginationValidator,
} = require('../middlewares/validators');

const router = express.Router();

router.use(validateToken);

// #swagger.tags = ['Reviews']
// #swagger.summary = 'Get all user reviews'
// #swagger.security = [{ "cookieAuth": [] }, { "bearerAuth": [] }]
router.get('/api/reviews', paginationValidator, ReviewController.get_all_reviews);

// #swagger.tags = ['Reviews']
// #swagger.summary = 'Get latest reviews'
// #swagger.security = [{ "cookieAuth": [] }, { "bearerAuth": [] }]
router.get('/api/reviews/latest', ReviewController.get_latest_reviews);

// #swagger.tags = ['Reviews']
// #swagger.summary = 'Get reviews grouped by ratings'
// #swagger.security = [{ "cookieAuth": [] }, { "bearerAuth": [] }]
router.get('/api/reviews/grouped-by-ratings', ReviewController.get_reviews_grouped_by_ratings);

router.get(
  '/api/reviews/grouped-by-ratings/:rating',
  paginationValidator,
  ReviewController.get_reviews_grouped_by_ratings
);

// #swagger.tags = ['Reviews']
// #swagger.summary = 'Create a new review'
// #swagger.security = [{ "cookieAuth": [] }, { "bearerAuth": [] }]
router.post('/api/reviews', createReviewValidator, ReviewController.create_review);

// #swagger.tags = ['Reviews']
// #swagger.summary = 'Get review by ID'
// #swagger.security = [{ "cookieAuth": [] }, { "bearerAuth": [] }]
router.get('/api/reviews/:id', reviewIdValidator, ReviewController.get_review_by_id);

// #swagger.tags = ['Reviews']
// #swagger.summary = 'Update review by ID'
// #swagger.security = [{ "cookieAuth": [] }, { "bearerAuth": [] }]
router.put('/api/reviews/:id', updateReviewValidator, ReviewController.update_review_by_id);

// #swagger.tags = ['Reviews']
// #swagger.summary = 'Delete review by ID'
// #swagger.security = [{ "cookieAuth": [] }, { "bearerAuth": [] }]
router.delete('/api/reviews/:id', reviewIdValidator, ReviewController.delete_review_by_id);

module.exports = router;
