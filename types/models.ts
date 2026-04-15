import { Optional } from 'sequelize';

export interface UserAttributes {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserCreationAttributes = Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'>;

export type ReviewType = 'movie' | 'tv' | 'podcast' | 'youtube' | 'other';

export interface ReviewAttributes {
  id: number;
  userId: number;
  mediaId: number | null;
  name: string;
  type: ReviewType;
  review: string;
  rating: number | null;
  url: string | null;
  watchAgain: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ReviewCreationAttributes = Optional<
  ReviewAttributes,
  'id' | 'mediaId' | 'rating' | 'url' | 'watchAgain' | 'createdAt' | 'updatedAt'
>;

export interface MediaAttributes {
  id: number;
  name: string;
  img: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

export type MediaCreationAttributes = Optional<MediaAttributes, 'id' | 'createdAt' | 'updatedAt'>;

export type GenreMediaType = 'movie' | 'tv' | 'podcast';

export interface GenreAttributes {
  id: number;
  tmdbId: number | null;
  mediaType: GenreMediaType;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export type GenreCreationAttributes = Optional<GenreAttributes, 'id' | 'tmdbId' | 'createdAt' | 'updatedAt'>;

export interface MediaGenreAttributes {
  id: number;
  mediaId: number;
  genreId: number;
  createdAt: Date;
  updatedAt: Date;
}

export type MediaGenreCreationAttributes = Optional<MediaGenreAttributes, 'id' | 'createdAt' | 'updatedAt'>;
