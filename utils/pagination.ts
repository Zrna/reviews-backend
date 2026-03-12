import { PaginationMeta } from '../types/api';

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
