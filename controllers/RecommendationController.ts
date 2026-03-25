import { NextFunction, Request, Response } from 'express';

import recommendationsData from '../data/recommendations.json';
import * as MediaController from './MediaController';

interface Recommendation {
  id: number;
  name: string | number;
  type: string;
  genre: string[];
}

const get_recommendation = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const randomIndex = Math.floor(Math.random() * recommendationsData.length);
    const recommendation = recommendationsData[randomIndex] as Recommendation;

    const img = await MediaController.get_media_by_name_from_database(String(recommendation.name).toLowerCase());

    return res.status(200).json({
      ...recommendation,
      img,
    });
  } catch (err) {
    return next(err);
  }
};

export { get_recommendation };
