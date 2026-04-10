import axios from 'axios';

import { Media } from '../models';
import { ReviewAttributes } from '../types/models';
import { logger } from '../utils/logger';

const get_media_by_name_from_database = async (name: ReviewAttributes['name'], type?: string) => {
  try {
    logger.info(`Searching for media in database with name: ${name}${type ? `, type: ${type}` : ''}`);

    return await Media.findOne({
      where: {
        name: name.toLowerCase(),
        ...(type && { type }),
      },
    });
  } catch (err) {
    logger.error(`Error fetching media from database for name: ${name}`);
    console.error('Error:', err);
    return null;
  }
};

const TMDB_API_SEARCH_ENDPOINTS = {
  movie: 'search/movie',
  tv: 'search/tv',
  multi: 'search/multi',
};

const get_media_by_name_from_api = async (name: ReviewAttributes['name'], type: string) => {
  try {
    const headers = { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` };
    const params = { query: name };

    const specificEndpoint = type === 'movie' ? TMDB_API_SEARCH_ENDPOINTS.movie : TMDB_API_SEARCH_ENDPOINTS.tv;

    logger.info(`Fetching media from TMDB API (${specificEndpoint}) for name: ${name}`);
    let response = await axios.get(`https://api.themoviedb.org/3/${specificEndpoint}`, { params, headers });

    let firstResult = response.data.results?.[0];

    if (!firstResult) {
      logger.info(
        `No results from ${specificEndpoint}, falling back to ${TMDB_API_SEARCH_ENDPOINTS.multi} for name: ${name}`
      );
      response = await axios.get(`https://api.themoviedb.org/3/${TMDB_API_SEARCH_ENDPOINTS.multi}`, {
        params,
        headers,
      });
      firstResult = response.data.results?.[0];
    }

    if (!firstResult) {
      logger.warn(`No results found in TMDB API for name: ${name}`);
      return null;
    }

    const imagePath = firstResult.backdrop_path || firstResult.poster_path;
    if (!imagePath) {
      logger.warn(`No image found in TMDB API for name: ${name}`);
      return null;
    }

    // Use media_type from TMDB response if available (from search/multi), otherwise use the requested type
    const mediaType = firstResult.media_type || type;

    const result = await Media.create({
      name: name.toLowerCase(),
      img: `https://image.tmdb.org/t/p/original${imagePath}`,
      type: mediaType,
    });

    return result;
  } catch (err) {
    logger.error(`Error fetching media from TMDB API for name: ${name}`);
    console.error('Error:', err);
    return null;
  }
};

export { get_media_by_name_from_api, get_media_by_name_from_database };
