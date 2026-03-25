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

export interface ReviewAttributes {
  id: number;
  userId: number;
  mediaId: number | null;
  name: string;
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
  createdAt: Date;
  updatedAt: Date;
}

export type MediaCreationAttributes = Optional<MediaAttributes, 'id' | 'createdAt' | 'updatedAt'>;
