import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

/**
 * Validation middleware
 * Uses express-validator to validate request data
 * @param validations Array of validation chains
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Run all validators
    await Promise.all(validations.map(validation => validation.run(req)));
    
    // Check if there are validation errors
    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      // No errors, continue
      next();
      return;
    }
    
    // Format errors for response
    const formattedErrors = errors.array().map(error => {
      // Handle different ValidationError structures
      // For express-validator v7
      if ('path' in error) {
        return {
          field: error.path,
          message: error.msg
        };
      }
      
      // For older express-validator versions (fallback)
      if ('param' in error) {
        return {
          field: error.param,
          message: error.msg
        };
      }
      
      // Last resort fallback
      return {
        field: typeof error.type === 'string' ? error.type : 'unknown',
        message: error.msg
      };
    });
    
    // Send validation error response
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors,
    });
  };
};

/**
 * Sanitize request data
 * Removes unwanted fields from request body
 * @param allowedFields Array of allowed field names
 */
export const sanitizeBody = (allowedFields: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.body || typeof req.body !== 'object') {
      // If no body or not an object, continue
      next();
      return;
    }
    
    // Filter out unwanted fields
    const sanitizedBody: Record<string, any> = {};
    
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        sanitizedBody[field] = req.body[field];
      }
    }
    
    // Replace request body with sanitized version
    req.body = sanitizedBody;
    
    next();
  };
};

/**
 * Sanitize query parameters
 * Removes unwanted fields from query params
 * @param allowedParams Array of allowed parameter names
 */
export const sanitizeQuery = (allowedParams: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.query || typeof req.query !== 'object') {
      // If no query params or not an object, continue
      next();
      return;
    }
    
    // Filter out unwanted parameters
    const sanitizedQuery: Record<string, any> = {};
    
    for (const param of allowedParams) {
      if (req.query[param] !== undefined) {
        sanitizedQuery[param] = req.query[param];
      }
    }
    
    // Replace request query with sanitized version
    req.query = sanitizedQuery;
    
    next();
  };
};

export default {
  validate,
  sanitizeBody,
  sanitizeQuery,
};