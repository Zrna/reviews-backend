const express = require('express');

const RecommendationController = require('../controllers/RecommendationController');
const { validateToken } = require('../middlewares/token');

const router = express.Router();

router.use(validateToken);

// #swagger.tags = ['Recommendations']
// #swagger.summary = 'Get movie/show recommendations from OMDB'
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

module.exports = router;
