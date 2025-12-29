import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from './errorHandler.js';
import type { JwtPayload } from '../types/index.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('AUTH_REQUIRED', 'Authentication required', 401);
  }

  const token = authHeader.substring(7);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('AUTH_TOKEN_EXPIRED', 'Access token has expired', 401);
    }
    throw new AppError('AUTH_INVALID_TOKEN', 'Invalid access token', 401);
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    throw new AppError('AUTH_REQUIRED', 'Authentication required', 401);
  }

  if (req.user.role !== 'admin') {
    throw new AppError('AUTH_FORBIDDEN', 'Admin access required', 403);
  }

  next();
}
