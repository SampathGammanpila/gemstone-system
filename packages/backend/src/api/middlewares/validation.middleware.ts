import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';

interface FormattedError {
  field: string;
  message: string;
}

export const validate = (req: Request, res: Response, next: NextFunction): void | Response => {
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

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors
    });
  }

  next();
};