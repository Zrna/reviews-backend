import { NextFunction, Request, Response } from 'express';

import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../utils/pagination';

const pagination = (req: Request, _res: Response, next: NextFunction) => {
  const page = Number(req.query.page) || DEFAULT_PAGE;
  const pageSize = Number(req.query.pageSize) || DEFAULT_PAGE_SIZE;
  const offset = (page - 1) * pageSize;

  req.pagination = { page, pageSize, offset };

  next();
};

export { pagination };
