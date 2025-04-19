import { Request, Response, NextFunction } from 'express';
import { ValidationChain, validationResult } from 'express-validator';

/**
 * Validation middleware for admin routes
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
    
    // Format error message
    const errorMessages = errors.array().map(error => {
      return `${error.param}: ${error.msg}`;
    });
    
    // Flash error to user and redirect back
    req.flash('error', errorMessages.join(', '));
    
    // Redirect back to the previous page
    const referer = req.headers.referer || '/admin';
    res.redirect(referer);
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

export default {
  validate,
  sanitizeBody,
};