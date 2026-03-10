export interface PaginationMeta {
  totalRecords: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ErrorResponse {
  error: string;
  requestId?: string;
  message?: string;
  details?: unknown[];
  stack?: string;
}

export interface JwtPayload {
  id: number;
  email: string;
  iat: number;
  exp: number;
}
