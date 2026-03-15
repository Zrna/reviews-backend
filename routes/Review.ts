import { Router } from 'express';

import * as ReviewController from '../controllers/ReviewController';
import { pagination } from '../middlewares/pagination';
import { validateToken } from '../middlewares/token';
import {
  createReviewValidator,
  paginationValidator,
  reviewIdValidator,
  updateReviewValidator,
} from '../middlewares/validators';

const router = Router();

router.use(validateToken);

// #swagger.tags = ['Reviews']
// #swagger.summary = 'Get all user reviews'
// #swagger.security = [{ "cookieAuth": [] }, { "bearerAuth": [] }]
router.get('/api/reviews', paginationValidator, pagination, ReviewController.get_all_reviews);

// #swagger.tags = ['Reviews']
// #swagger.summary = 'Get latest reviews'
// #swagger.security = [{ "cookieAuth": [] }, { "bearerAuth": [] }]
router.get('/api/reviews/latest', ReviewController.get_latest_reviews);

// #swagger.tags = ['Reviews']
// #swagger.summary = 'Get reviews grouped by ratings'
// #swagger.security = [{ "cookieAuth": [] }, { "bearerAuth": [] }]
router.get('/api/reviews/grouped-by-ratings', ReviewController.get_reviews_grouped_by_ratings);

// #swagger.tags = ['Reviews']
// #swagger.summary = 'Get reviews by rating'
// #swagger.security = [{ "cookieAuth": [] }, { "bearerAuth": [] }]
router.get('/api/reviews/rating/:rating', paginationValidator, pagination, ReviewController.get_reviews_by_rating);

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

export default router;
