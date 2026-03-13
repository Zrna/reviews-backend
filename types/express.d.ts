import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    id: string;
    userId?: number;
    authenticated?: boolean;
    pagination?: {
      page: number;
      pageSize: number;
      offset: number;
    };
  }
}
