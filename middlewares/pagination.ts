import { NextFunction, Request, Response } from 'express';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

const pagination = (req: Request, _res: Response, next: NextFunction) => {
  const page = Number(req.query.page) || DEFAULT_PAGE;
  const pageSize = Number(req.query.pageSize) || DEFAULT_PAGE_SIZE;
  const offset = (page - 1) * pageSize;

  req.pagination = { page, pageSize, offset };

  next();
};

export { pagination };
