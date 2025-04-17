import { Request, Response, NextFunction } from 'express';
import { logger } from '../../utils/logger';
import { config } from '../../config/environment';

// Custom error class
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    isOperational: boolean = true,
    stack: string = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Not Found error handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(404, `Resource not found - ${req.originalUrl}`);
  next(error);
};

// Global error handler
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = err;
  let statusCode = 500;
  let message = 'Internal Server Error';
  
  // If error is instance of AppError, use its properties
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  }
  
  // Log error
  if (statusCode >= 500) {
    logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${statusCode}, Message:: ${message}`, {
      stack: err.stack,
      error: err
    });
  } else {
    logger.warn(`[${req.method}] ${req.path} >> StatusCode:: ${statusCode}, Message:: ${message}`);
  }
  
  // Send error response
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  });
};