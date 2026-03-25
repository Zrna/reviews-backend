import { Router } from 'express';

import * as RecommendationController from '../controllers/RecommendationController';
import { validateToken } from '../middlewares/token';

const router = Router();

router.use(validateToken);

// #swagger.tags = ['Recommendations']
// #swagger.summary = 'Get movie/show recommendations from TMDB'
// #swagger.description = 'Fetches recommendations based on search query'
/* #swagger.security = [{ "cookieAuth": [] }, { "bearerAuth": [] }] */
/* #swagger.parameters['name'] = {
      in: 'query',
      description: 'Movie or show name to search for',
      required: true,
      type: 'string'
    }
*/

router.get('/api/recommendation', RecommendationController.get_recommendation);

export default router;
