import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.js';
import { env } from '../config/env.js';

export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 400,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    sendError(res, err.code, err.message, err.statusCode, err.details);
    return;
  }

  console.error('Unhandled error:', err);

  const message = env.NODE_ENV === 'production' ? 'Internal server error' : err.message;

  sendError(res, 'INTERNAL_ERROR', message, 500);
}
