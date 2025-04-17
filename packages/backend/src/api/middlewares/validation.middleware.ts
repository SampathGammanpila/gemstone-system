// src/api/middlewares/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError, ValidationChain } from 'express-validator';
import { AppError } from './error.middleware';

interface FormattedError {
  field: string;
  message: string;
}

/**
 * Validate UUID parameter
 * @param param - Parameter name to validate
 * @returns Middleware function
 */
export const validateUUID = (param: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const uuid = req.params[param];
    
    // Simple UUID v4 regex validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuid || !uuidRegex.test(uuid)) {
      next(new AppError(400, `Invalid ${param} format. Must be a valid UUID.`));
      return;
    }
    
    next();
  };
};

/**
 * Middleware to validate request using express-validator
 * @param validations - Array of validation chains
 * @returns Middleware function
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Execute all validations
    await Promise.all(validations.map(validation => validation.run(req)));
    
    // Check for validation errors
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      const formattedErrors: FormattedError[] = errors.array().map((error: ValidationError) => {
        // Handle both ValidationError types
        if ('path' in error) {
          return {
            field: error.path,
            message: error.msg
          };
        } else {
          // Handle legacy format or alternative format
          return {
            field: (error as any).param || error.type || 'unknown',
            message: error.msg
          };
        }
      });
      
      const errorResponse = {
        status: 'error',
        message: 'Validation failed',
        errors: formattedErrors
      };
      
      res.status(400).json(errorResponse);
      return;
    }
    
    next();
  };
};