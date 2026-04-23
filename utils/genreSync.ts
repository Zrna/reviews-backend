import axios from 'axios';

import { Genre } from '../models';
import { GenreCreationAttributes, GenreMediaType } from '../types/models';
import { logger } from './logger';

interface TMDBGenre {
  id: number;
  name: string;
}

interface TMDBGenreListResponse {
  genres: TMDBGenre[];
}

const TMDB_GENRE_ENDPOINTS: Array<{ url: string; mediaType: GenreMediaType }> = [
  { url: 'https://api.themoviedb.org/3/genre/movie/list', mediaType: 'movie' },
  { url: 'https://api.themoviedb.org/3/genre/tv/list', mediaType: 'tv' },
];

export const syncGenresFromTMDB = async (): Promise<void> => {
  try {
    const headers = { Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}` };

    const rows: GenreCreationAttributes[] = [];

    for (const { url, mediaType } of TMDB_GENRE_ENDPOINTS) {
      const response = await axios.get<TMDBGenreListResponse>(url, { headers });
      const genres = response.data.genres || [];

      for (const g of genres) {
        rows.push({ tmdbId: g.id, mediaType, name: g.name });
      }
    }

    if (rows.length === 0) {
      logger.warn('TMDB returned no genres — skipping sync');
      return;
    }

    const existing = await Genre.findAll({ attributes: ['tmdbId', 'mediaType', 'name'], raw: true });
    const existingByKey = new Map(existing.map(g => [`${g.mediaType}:${g.tmdbId}`, g.name]));

    const changed = rows.filter(r => existingByKey.get(`${r.mediaType}:${r.tmdbId}`) !== r.name);

    if (changed.length === 0) {
      logger.info('TMDB genres unchanged — skipping write');
      return;
    }

    await Genre.bulkCreate(changed, {
      updateOnDuplicate: ['name', 'updatedAt'],
    });

    logger.info(`Synced ${changed.length} genres from TMDB`);
  } catch (err) {
    logger.error(err, 'Failed to sync genres from TMDB');
  }
};
