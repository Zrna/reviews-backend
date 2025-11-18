const express = require('express');

const AuthController = require('../controllers/AuthController');
const { registerValidator, loginValidator } = require('../middlewares/validators');

const router = express.Router();

/**
 * @swagger
 * /register:
 *  post:
 *    tags:
 *      - auth
 *    summary: Register user
 *    description: Register user
 *    requestBody:
 *      description: Register user
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *                example: example@email.com
 *              password:
 *                type: string
 *                example: abc123
 *              firstName:
 *                type: string
 *                example: John
 *              lastName:
 *                type: string
 *                example: Smith
 *    responses:
 *      201:
 *        description: User created
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 *              example: "User registered"
 *      409:
 *        description: Email already registered
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: This email is already registered
 *      422:
 *        description: Error message `Password can't be empty` or `Email can't be empty` or `First name can't be empty` or `Last name can't be empty`
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: Password can't be empty
 *      500:
 *        description: User registration failed
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: some error message
 */
router.post('/register', registerValidator, AuthController.auth_register);

/**
 * @swagger
 * /login:
 *  post:
 *    tags:
 *      - auth
 *    summary: Login user
 *    description: Login user
 *    requestBody:
 *      description: Login user
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *                example: example@email.com
 *              password:
 *                type: string
 *                example: abc123
 *    responses:
 *      200:
 *        description: User logged in - JWT token
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                accessToken:
 *                  type: string
 *                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ6cm5hQGdtYWlsLmNvbSIsImlhdCI6MTYxODczNDc1Nn0.mPoLKTFGB-rgfp5RhjkQynfOB75O2jUkS5ijZRzIjGU'
 *      401:
 *        description: Wrong username and password combination
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: 'Wrong username and password combination'
 *      404:
 *        description: User does not exist
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: 'User does not exist'
 */
router.post('/login', loginValidator, AuthController.auth_login);

/**
 *
 * @swagger
 * /logout:
 *  post:
 *    tags:
 *      - auth
 *    summary: Logout user
 *    description: Logout user
 */
router.post('/logout', AuthController.auth_logout);

module.exports = router;
