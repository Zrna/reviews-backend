import { PaginationMeta } from '../types/api';

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_PAGINATION = {
  page: DEFAULT_PAGE,
  pageSize: DEFAULT_PAGE_SIZE,
  offset: 0,
};

interface PaginationInput {
  count: number;
  page: number;
  pageSize: number;
}

export const paginationMeta = ({ count, page, pageSize }: PaginationInput): PaginationMeta => {
  const totalPages = Math.ceil(count / pageSize);

  return {
    totalRecords: count,
    page,
    pageSize,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: totalPages > page,
  };
};
