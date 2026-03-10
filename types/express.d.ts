import 'express';

declare module 'express' {
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
