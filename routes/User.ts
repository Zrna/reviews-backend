import { Router } from 'express';

import * as UserController from '../controllers/UserController';
import { validateToken } from '../middlewares/token';
import { updateAccountValidator } from '../middlewares/validators';

const router = Router();

router.use(validateToken);

// #swagger.tags = ['User']
// #swagger.summary = 'Get user account data'
// #swagger.description = 'Returns authenticated user account information'
/* #swagger.security = [{ "cookieAuth": [] }, { "bearerAuth": [] }] */
/* #swagger.responses[200] = {
      description: 'User account data',
      content: {
        "application/json": {
          schema: { $ref: "#/definitions/User" }
        }
      }
    }
*/
router.get('/api/account', UserController.get_account);

// #swagger.tags = ['User']
// #swagger.summary = 'Update user account'
// #swagger.security = [{ "cookieAuth": [] }, { "bearerAuth": [] }]
/**
 * @swagger
 * /api/account:
 *  put:
 *    tags:
 *      - account
 *    summary: Account update
 *    description: Required `access-token` in cookies
 *    requestBody:
 *      description: Update user's account data
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              firstName:
 *                type: string
 *                example: Luka
 *              lastName:
 *                type: string
 *                example: Zrnic Updated
 *    responses:
 *      200:
 *        description: User account data updated
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                id:
 *                  type: number
 *                  example: 1
 *                email:
 *                  type: string
 *                  example: zrna@gmail.com
 *                firstName:
 *                  type: string
 *                  example: Luka
 *                lastName:
 *                  type: string
 *                  example: Zrnic Updated
 *                createdAt:
 *                  type: string
 *                  example: 2021-04-18T10:02:07.000Z
 *                updatedAt:
 *                  type: string
 *                  example: 2021-04-27T20:00:00.000Z
 *      401:
 *        description: No `access-token` in cookies
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: Access token is missing
 *      500:
 *        description: Account data update error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: Something went wrong with updating the account data.
 */
router.put('/api/account', updateAccountValidator, UserController.update_account);

// #swagger.tags = ['User']
// #swagger.summary = 'Delete user account'
// #swagger.security = [{ "cookieAuth": [] }, { "bearerAuth": [] }]
/**
 * @swagger
 * /api/account:
 *  delete:
 *    tags:
 *      - account
 *    summary: Account delete
 *    description: Required `access-token` in cookies
 *    responses:
 *      200:
 *        description: Account deleted - returns `true`
 *      401:
 *        description: No `access-token` in cookies
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: Access token is missing
 *      500:
 *        description: Server Error
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  example: Something went wrong with deleting account with id {userId}
 */
router.delete('/api/account', UserController.delete_account);

export = router;
