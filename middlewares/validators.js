const { body, param, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg, // Return first error message for consistency with existing API
    });
  }

  next();
};

// Auth validators
const registerValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage("Email can't be empty")
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('firstName').trim().notEmpty().withMessage("First name can't be empty"),
  body('lastName').trim().notEmpty().withMessage("Last name can't be empty"),
  body('password')
    .notEmpty()
    .withMessage("Password can't be empty")
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors,
];

const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage("Email can't be empty")
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password').notEmpty().withMessage("Password can't be empty"),
  handleValidationErrors,
];

// User validators
const updateAccountValidator = [
  body('firstName').trim().notEmpty().withMessage("First name can't be empty"),
  body('lastName').trim().notEmpty().withMessage("Last name can't be empty"),
  handleValidationErrors,
];

// Review validators
const createReviewValidator = [
  body('name').trim().notEmpty().withMessage("Name can't be empty"),
  body('review').trim().notEmpty().withMessage("Review can't be empty"),
  body('url').optional({ checkFalsy: true }).trim(),
  body('rating').optional({ checkFalsy: true }).isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('watchAgain').optional({ checkFalsy: true }).isBoolean().withMessage('Watch again must be a boolean'),
  handleValidationErrors,
];

const updateReviewValidator = [
  param('id').isInt().withMessage('Review ID must be a valid number').toInt(),
  body('name').optional().trim().notEmpty().withMessage("Name can't be empty"),
  body('review').optional().trim().notEmpty().withMessage("Review can't be empty"),
  body('url').optional({ checkFalsy: true }).trim(),
  body('rating')
    .optional({ checkFalsy: true })
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5')
    .toInt(),
  body('watchAgain').optional({ checkFalsy: true }).isBoolean().withMessage('Watch again must be a boolean'),
  handleValidationErrors,
];

const reviewIdValidator = [
  param('id').isInt().withMessage('Review ID must be a valid number').toInt(),
  handleValidationErrors,
];

module.exports = {
  registerValidator,
  loginValidator,
  updateAccountValidator,
  createReviewValidator,
  updateReviewValidator,
  reviewIdValidator,
};
