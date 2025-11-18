const express = require('express');

const ReviewController = require('../controllers/ReviewController');
const { validateToken } = require('../middlewares/token');
const { createReviewValidator, updateReviewValidator, reviewIdValidator } = require('../middlewares/validators');

const router = express.Router();

router.use(validateToken);

/**
 * @swagger
 * definitions:
 *  ReviewResponse:
 *    type: object
 *    properties:
 *      id:
 *        type: number
 *        description: review id
 *        example: 1
 *      userId:
 *        type: numner
 *        description: user id
 *        example: 1
 *      imageId:
 *        type: numner
 *        description: user id
 *        example: 1
 *      name:
 *        type: string
 *        description: review name
 *        example: Batman
 *      review:
 *        type: string
 *        description: review
 *        example: Great movie
 *      rating:
 *        type: ['null', number]
 *        description: rating
 *        example: 4
 *      url:
 *        type: ['null', string]
 *        description: url
 *        example: https://www.youtube.com/watch?v=-FZ-pPFAjYY
 *      watchAgain:
 *        type: boolean
 *        description: would watch again or recommend
 *        example: true
 *      image:
 *        type: ['null', object]
 *        description: review poster fetched from OMDB and saved to our database in `base64` form
 *        example: { img: "base64 string" }
 *      createdAt:
 *        type: string
 *        description: date of creation
 *        example: 2021-05-07T22:00:00.798Z
 *      updatedAt:
 *        type: string
 *        description: update date
 *        example: 2021-05-15T20:26:39.798Z
 *  ReviewForbidden:
 *    type: object
 *    properties:
 *      error:
 *        type: string
 *        example: Forbidden
 *  ReviewNotFound:
 *    type: object
 *    properties:
 *      error:
 *        type: string
 *        example: Review with id {id} not found
 *  ReviewServerError:
 *    type: object
 *    properties:
 *      error:
 *        type: string
 *        example: some error message
 */

/**
 * @swagger
 * /api/reviews:
 *  get:
 *    tags:
 *      - reviews
 *    summary: Get all user's reviews
 *    description: Get all user's reviews based on `access-token` from cookies
 *    responses:
 *      200:
 *        description: User's reviews
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                data:
 *                  type: array
 *                  items: object
 *                  example: [
 *                    {
 *                      "id": 1,
 *                      "userId": 1,
 *                      "imageId": null,
 *                      "name": "Bad Boys",
 *                      "review": "Good Movie",
 *                      "rating": 5,
 *                      "url": "https://www.youtube.com/watch?v=Xm12NSa8jsM",
 *                      "watchAgain": false,
 *                      "image": null,
 *                      "createdAt": "2021-05-07T09:05:21.000Z",
 *                      "updatedAt": "2021-05-07T09:05:21.000Z"
 *                    },
 *                    {
 *                      "id": 2,
 *                      "userId": 1,
 *                      "imageId": 1,
 *                      "name": "Batman",
 *                      "review": "Not bad",
 *                      "rating": null,
 *                      "url": null,
 *                      "watchAgain": true,
 *                      "image": {
 *                        "img": "base64 string"
 *                      },
 *                      "createdAt": "2021-05-07T09:06:02.000Z",
 *                      "updatedAt": "2021-05-07T09:06:02.000Z"
 *                    },
 *                  ]
 *                totalRecords:
 *                  type: number
 *                  example: 2
 *      500:
 *        description: Some error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/ReviewServerError'
 */
router.get('/api/reviews', ReviewController.get_all_reviews);

/**
 * @swagger
 * /api/reviews/latest:
 *  get:
 *    tags:
 *      - reviews
 *    summary: Get latest user's reviews
 *    description: Get latest 5 user's reviews
 *    responses:
 *      200:
 *        description: User's reviews
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                data:
 *                  type: array
 *                  items: object
 *                  example: [
 *                    {
 *                      "id": 1,
 *                      "userId": 1,
 *                      "imageId": null,
 *                      "name": "Bad Boys",
 *                      "review": "Good Movie",
 *                      "rating": 5,
 *                      "url": "https://www.youtube.com/watch?v=Xm12NSa8jsM",
 *                      "watchAgain": false,
 *                      "image": null,
 *                      "createdAt": "2021-05-07T09:05:21.000Z",
 *                      "updatedAt": "2021-05-07T09:05:21.000Z"
 *                    },
 *                    {
 *                      "id": 2,
 *                      "userId": 1,
 *                      "imageId": 1,
 *                      "name": "Batman",
 *                      "review": "Not bad",
 *                      "rating": null,
 *                      "url": null,
 *                      "watchAgain": true,
 *                      "image": {
 *                        "img": "base64 string"
 *                      },
 *                      "createdAt": "2021-05-07T09:06:02.000Z",
 *                      "updatedAt": "2021-05-07T09:06:02.000Z"
 *                    },
 *                  ]
 *                totalRecords:
 *                  type: number
 *                  example: 2
 *      500:
 *        description: Some error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/ReviewServerError'
 */
router.get('/api/reviews/latest', ReviewController.get_latest_reviews);

/**
 * @swagger
 * /api/reviews/grouped-by-ratings:
 *  get:
 *    tags:
 *      - reviews
 *    summary: Get reviews grouped by ratings
 *    description: Get reviews grouped by ratings (5, 4, 3, 2, 1, null). Pass the `count` in query (e.g. `/grouped-by-ratings?count=20`) to get specific number of reviews. Default is 10
 *    responses:
 *      200:
 *        description: User's reviews
 *        content:
 *          application/json:
 *            schema:
 *               type: array
 *               items: object
 *               example: [
 *                {
 *                  "rating": 5,
 *                  "reviews": [
 *                   {
 *                    "id": 2,
 *                    "userId": 1,
 *                    "imageId": 1,
 *                    "name": "Billions",
 *                    "review": "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
 *                    "rating": 5,
 *                    "url": "https://www.hbomax.com/hr/en/series/urn:hbo:series:GYSYN2AYfO8LCwwEAAAId",
 *                    "watchAgain": true,
 *                    "image": {
 *                      "img": "base64 string"
 *                    },
 *                    "createdAt": "2023-11-28T11:07:37.000Z",
 *                    "updatedAt": "2024-07-26T14:27:03.000Z",
 *                   },
 *                   {
 *                    "id": 13,
 *                    "userId": 1,
 *                    "imageId": null,
 *                    "name": "Peaky Blinders",
 *                    "review": "Iconic serie!!\n\nI watched it 3 times, and I can watch it more 30 times :D\nDefinitely a recommendation!!",
 *                    "rating": 5,
 *                    "url": "https://www.netflix.com/title/80002479",
 *                    "watchAgain": true,
 *                    "image": null,
 *                    "createdAt": "2023-12-16T13:09:46.000Z",
 *                    "updatedAt": "2023-12-17T11:49:41.000Z",
 *                   }
 *                 ]
 *                },
 *                {
 *                  "rating": 4,
 *                  "reviews": []
 *                },
 *                {
 *                  "rating": 3,
 *                  "reviews": []
 *                },
 *                {
 *                  "rating": 2,
 *                  "reviews": []
 *                },
 *                {
 *                  "rating": 1,
 *                  "reviews": [
 *                   {
 *                    "id": 14,
 *                    "userId": 1,
 *                    "imageId": null,
 *                    "name": "blablablabla1123",
 *                    "review": "blablabla",
 *                    "rating": 1,
 *                    "url": null,
 *                    "watchAgain": false,
 *                    "image": null,
 *                    "createdAt": "2023-12-17T10:45:23.000Z",
 *                    "updatedAt": "2023-12-17T11:48:46.000Z",
 *                   }
 *                 ]
 *                },
 *                {
 *                  "rating": null,
 *                  "reviews": []
 *                }
 *               ]
 *      500:
 *        description: Some error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/ReviewServerError'
 */
router.get('/api/reviews/grouped-by-ratings', ReviewController.get_reviews_grouped_by_ratings);

/**
 * @swagger
 * /api/reviews/grouped-by-ratings/:rating:
 *  get:
 *    tags:
 *      - reviews
 *    summary: Get reviews grouped by provided rating
 *    description: Get reviews grouped by provided rating (5, 4, 3, 2, 1, 0). Pass the `count` in query (e.g. `/grouped-by-ratings/5?count=20`) to get  specific number of reviews. Default is 10
 *    parameters:
 *      - in: path
 *        name: ratng
 *        schema:
 *          type: integer
 *        description: If `0` (zero) is passed, it will return reviews with no rating (`null` value). If value that is not a number is passed, it will return error.
 *        example: 5
 *    responses:
 *      200:
 *        description: User's reviews with provided rating
 *        content:
 *          application/json:
 *            schema:
 *               type: array
 *               items: object
 *               example: [
 *                {
 *                  "rating": 5,
 *                  "reviews": [
 *                   {
 *                    "id": 2,
 *                    "userId": 1,
 *                    "imageId": 1,
 *                    "name": "Billions",
 *                    "review": "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
 *                    "rating": 5,
 *                    "url": "https://www.hbomax.com/hr/en/series/urn:hbo:series:GYSYN2AYfO8LCwwEAAAId",
 *                    "watchAgain": true,
 *                    "image": {
 *                      "img": "base64 string"
 *                    },
 *                    "createdAt": "2023-11-28T11:07:37.000Z",
 *                    "updatedAt": "2024-07-26T14:27:03.000Z",
 *                   },
 *                   {
 *                    "id": 13,
 *                    "userId": 1,
 *                    "imageId": 1,
 *                    "name": "Peaky Blinders",
 *                    "review": "Iconic serie!!\n\nI watched it 3 times, and I can watch it more 30 times :D\nDefinitely a recommendation!!",
 *                    "rating": 5,
 *                    "url": "https://www.netflix.com/title/80002479",
 *                    "watchAgain": true,
 *                    "image": {
 *                      "img": "base64 string"
 *                    },
 *                    "createdAt": "2023-12-16T13:09:46.000Z",
 *                    "updatedAt": "2023-12-17T11:49:41.000Z",
 *                   }
 *                 ]
 *                }
 *               ]
 *      422:
 *        description: Message `Rating must be a number` or `Rating must be between 0 and 5`
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: Rating must be between 0 and 5
 *      500:
 *        description: Some error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/ReviewServerError'
 */
router.get('/api/reviews/grouped-by-ratings/:rating', ReviewController.get_reviews_grouped_by_ratings);

/**
 * @swagger
 * /api/reviews:
 *  post:
 *    tags:
 *      - reviews
 *    summary: Create review
 *    description: Required `access-token` in cookies
 *    requestBody:
 *      description: Review that will be added to the database. Rating can be `number` or `null`, URL can be `string` or `null`
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *                example: Batman
 *              review:
 *                type: string
 *                example: Great movie
 *              rating:
 *                type: ['null', number]
 *                example: 5
 *              url:
 *                type: ['null', string]
 *                example: https://www.youtube.com/watch?v=-FZ-pPFAjYY
 *              watchAgain:
 *                type: boolean
 *                example: true
 *    responses:
 *      201:
 *        description: Review created
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/ReviewResponse'
 *      409:
 *        description: Review for the movie already exists
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: Review for 'Batman' already exists
 *      422:
 *        description: Two types `Name can't be empty` or `Review can't be empty`
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: Name can't be empty
 *      500:
 *        description: Some error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/ReviewServerError'
 */
router.post('/api/reviews', createReviewValidator, ReviewController.create_review);

/**
 * @swagger
 * /api/reviews/{id}:
 *  get:
 *    tags:
 *      - reviews
 *    summary: Get review by id
 *    description: Get review by `id` from URL params
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: integer
 *        required: true
 *        description: Review id
 *        example: 1
 *    responses:
 *      200:
 *        description: Review
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/ReviewResponse'
 *      403:
 *        description: Forbidden - `userId` from cookies and `review.userId` are not the same
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/ReviewForbidden'
 *      404:
 *        description: Review not found
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/ReviewNotFound'
 *      500:
 *        description: Some error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/ReviewServerError'
 */
router.get('/api/reviews/:id', reviewIdValidator, ReviewController.get_review_by_id);

/**
 * @swagger
 * /api/reviews/{id}:
 *  put:
 *    tags:
 *      - reviews
 *    summary: Update review by id
 *    description: Update review by id. Rating can be `number` or `null`, URL can be `string` or `null`
 *    consumes:
 *      - application/json
 *    produces:
 *      - application/json
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: integer
 *        required: true
 *        description: review id
 *        example: 1
 *      - in: body
 *        name: body
 *        required: true
 *        description: body object
 *        schema:
 *          type: object
 *          properties:
 *            review:
 *              type: string
 *              example: Great movie
 *            rating:
 *              type: ['null', number]
 *              example: 4
 *            url:
 *              type: ['null', string]
 *              example: https://www.netflix.com/us/title/80002479
 *            watchAgain:
 *              type: boolean
 *              example: true
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              review:
 *                type: string
 *                example: Great movie
 *              rating:
 *                type: number
 *                example: 4
 *              url:
 *                type: string
 *                example: https://www.netflix.com/us/title/80002479
 *              watchAgain:
 *                type: boolean
 *                example: true
 *    responses:
 *      200:
 *        description: Updated success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/ReviewResponse'
 *      403:
 *        description: Forbidden - `userId` from cookies and `review.userId` are not the same
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/ReviewForbidden'
 *      404:
 *        description: Review not found
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/definitions/ReviewNotFound'
 *      500:
 *        description: Server error
 *        content:
 *          application/json:
 *           schema:
 *             $ref: '#/definitions/ReviewServerError'
 */
router.put('/api/reviews/:id', updateReviewValidator, ReviewController.update_review_by_id);

/**
 * @swagger
 * /api/reviews/{id}:
 *  delete:
 *    tags:
 *      - reviews
 *    summary: Delete review by id
 *    description: Delete review by id
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: integer
 *        required: true
 *        description: review id
 *        example: 1
 *    responses:
 *      200:
 *        description: Returns `true`
 *      500:
 *        description: Server error
 *        content:
 *          application/json:
 *           schema:
 *             $ref: '#/definitions/ReviewServerError'
 */
router.delete('/api/reviews/:id', reviewIdValidator, ReviewController.delete_review_by_id);

module.exports = router;
