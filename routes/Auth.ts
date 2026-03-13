import { Router } from 'express';

import * as AuthController from '../controllers/AuthController';
import { loginLimiter, registerLimiter } from '../middlewares/rateLimiter';
import { loginValidator, registerValidator } from '../middlewares/validators';

const router = Router();

// #swagger.tags = ['Auth']
// #swagger.summary = 'Register a new user'
// #swagger.description = 'Creates a new user account. Rate limited to 3 registrations per hour per IP.'
router.post('/register', registerLimiter, registerValidator, AuthController.auth_register);

// #swagger.tags = ['Auth']
// #swagger.summary = 'Login user'
// #swagger.description = 'Authenticates user and returns JWT token. Rate limited to 10 attempts per 15 minutes per IP.'
router.post('/login', loginLimiter, loginValidator, AuthController.auth_login);

// #swagger.tags = ['Auth']
// #swagger.summary = 'Logout user'
// #swagger.description = 'Clears authentication token'
router.post('/logout', AuthController.auth_logout);

export = router;
