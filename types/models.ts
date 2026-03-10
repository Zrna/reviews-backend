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
  imageId: number | null;
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
  'id' | 'imageId' | 'rating' | 'url' | 'watchAgain' | 'createdAt' | 'updatedAt'
>;

export interface ImageAttributes {
  id: number;
  name: string;
  img: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ImageCreationAttributes = Optional<ImageAttributes, 'id' | 'createdAt' | 'updatedAt'>;
