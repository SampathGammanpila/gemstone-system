import { Request, Response, NextFunction } from 'express';
import { db } from '../../db';
import { logger } from '../../utils/logger';

/**
 * Interface for audit log entry
 */
interface AuditLogEntry {
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: any;
  ip_address: string;
  user_agent?: string;
}

/**
 * Middleware to log audit events
 * @param action - Action being performed
 * @param entityType - Type of entity being affected
 * @param getEntityId - Function to extract entity ID from request
 * @param getDetails - Function to extract additional details from request
 * @returns middleware function
 */
export const auditLog = (
  action: string,
  entityType: string,
  getEntityId?: (req: Request) => string | undefined,
  getDetails?: (req: Request, res: Response) => any
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Store original end function
    const originalEnd = res.end;
    
    // Override end function to log after response is sent
    res.end = function (this: Response, ...args: any[]): any {
      // Restore original end function
      res.end = originalEnd;
      
      // Call original end function
      const result = originalEnd.apply(this, args);
      
      // Create audit log entry
      try {
        const auditEntry: AuditLogEntry = {
          user_id: req.userId,
          action,
          entity_type: entityType,
          entity_id: getEntityId ? getEntityId(req) : undefined,
          details: getDetails ? getDetails(req, res) : undefined,
          ip_address: req.ip || req.socket.remoteAddress || '',
          user_agent: req.headers['user-agent']
        };
        
        // Log audit entry to database
        db('audit_logs')
          .insert(auditEntry)
          .then(() => {
            logger.debug(`Audit log created: ${action} on ${entityType}`);
          })
          .catch(error => {
            logger.error('Failed to create audit log', error);
          });
      } catch (error) {
        logger.error('Error in audit logging', error);
      }
      
      return result;
    };
    
    next();
  };
};

// Predefined audit actions
export const AuditActions = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  LOGIN: 'login',
  LOGOUT: 'logout',
  REGISTER: 'register',
  VERIFY: 'verify',
  APPROVE: 'approve',
  REJECT: 'reject',
  TRANSFER: 'transfer',
  PUBLISH: 'publish',
  UNPUBLISH: 'unpublish',
  UPLOAD: 'upload'
};

// Predefined entity types
export const EntityTypes = {
  USER: 'user',
  ROLE: 'role',
  GEMSTONE: 'gemstone',
  ROUGH_STONE: 'rough_stone',
  JEWELRY: 'jewelry',
  PROFESSIONAL: 'professional',
  CERTIFICATE: 'certificate',
  DOCUMENT: 'document',
  LISTING: 'listing',
  ORDER: 'order'
};