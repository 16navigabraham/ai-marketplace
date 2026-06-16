import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';
import { ApiResponse } from '@/types';
import { env } from '@/config/env';

export class AppError extends Error {
  constructor(
    public message: string,
    public status: number,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response<ApiResponse<null>>,
  next: NextFunction
) {
  const error = err instanceof AppError ? err : new AppError(err.message, 500);

  const isDev = env.NODE_ENV === 'development';

  // 4xx are expected/client-side (e.g. profile not found on first visit) — log
  // quietly as warnings. Only 5xx are real server problems worth an error.
  const meta = {
    status: error.status,
    code: error.code,
    ...(isDev && { stack: error.stack }),
    path: req.path,
    method: req.method,
  };
  if (error.status >= 500) {
    logger.error(error.message, meta);
  } else {
    logger.warn(error.message, meta);
  }

  res.status(error.status).json({
    success: false,
    error: error.message,
    code: error.code,
  });
}
