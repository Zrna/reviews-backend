import axios from 'axios';

import { Media } from '../models';
import { ReviewAttributes } from '../types/models';
import { logger } from '../utils/logger';

const get_media_by_name_from_database = async (name: ReviewAttributes['name']) => {
  try {
    logger.info(`Searching for media in database with name: ${name}`);
    const result = await Media.findOne({
      where: {
        name: name.toLowerCase(),
      },
    });
    return result;
  } catch (err) {
    logger.error(`Error fetching media from database for name: ${name}`);
    console.error('Error:', err);
    return null;
  }
};

const get_media_by_name_from_api = async (name: ReviewAttributes['name']) => {
  try {
    logger.info(`Fetching media from TMDB API for name: ${name}`);
    const response = await axios.get('https://api.themoviedb.org/3/search/multi', {
      params: {
        query: name,
      },
      headers: {
        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
      },
    });

    const firstResult = response.data.results?.[0];
    if (!firstResult) {
      logger.warn(`No results found in TMDB API for name: ${name}`);
      return null;
    }

    const imagePath = firstResult.backdrop_path || firstResult.poster_path;
    if (!imagePath) {
      logger.warn(`No image found in TMDB API for name: ${name}`);
      return null;
    }

    const result = await Media.create({
      name: name.toLowerCase(),
      img: `https://image.tmdb.org/t/p/original${imagePath}`,
    });

    return result;
  } catch (err) {
    logger.error(`Error fetching media from TMDB API for name: ${name}`);
    console.error('Error:', err);
    return null;
  }
};

export { get_media_by_name_from_api, get_media_by_name_from_database };
