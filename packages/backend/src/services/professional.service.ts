import { db } from '../db';

class ProfessionalService {
  /**
   * Get count of pending professional verifications
   */
  async getPendingVerificationsCount(): Promise<number> {
    try {
      // First check if the table exists
      const tableExists = await db.schema.hasTable('professional_verifications');
      if (!tableExists) {
        console.log('professional_verifications table does not exist');
        return 0;
      }
      
      const result = await db('professional_verifications')
        .where('status', 'pending')
        .count('id as count')
        .first();
      return result?.count ? Number(result.count) : 0;
    } catch (error) {
      console.error('Error getting pending verification count:', error);
      return 0;
    }
  }

  /**
   * Find professional profile by user ID
   * @param userId User ID
   */
  async findByUserId(userId: number): Promise<any> {
    try {
      // Check if the table exists
      const tableExists = await db.schema.hasTable('professional_profiles');
      if (!tableExists) {
        return null;
      }
      
      return db('professional_profiles').where({ user_id: userId }).first();
    } catch (error) {
      console.error('Error finding professional profile:', error);
      return null;
    }
  }

  /**
   * Get professional verification by ID
   * @param verificationId Verification ID
   */
  async getVerificationById(verificationId: number): Promise<any> {
    try {
      // Check if the tables exist
      const verificationTableExists = await db.schema.hasTable('professional_verifications');
      const profileTableExists = await db.schema.hasTable('professional_profiles');
      
      if (!verificationTableExists || !profileTableExists) {
        return null;
      }
      
      return db('professional_verifications')
        .where('professional_verifications.id', verificationId)
        .join('professional_profiles', 'professional_verifications.profile_id', 'professional_profiles.id')
        .join('users', 'professional_profiles.user_id', 'users.id')
        .select(
          'professional_verifications.*',
          'professional_profiles.specialization',
          'professional_profiles.experience_years',
          'users.first_name',
          'users.last_name',
          'users.email'
        )
        .first();
    } catch (error) {
      console.error('Error getting verification by ID:', error);
      return null;
    }
  }

  /**
   * Get verification requests with pagination
   * @param page Page number
   * @param limit Items per page
   * @param status Filter by status
   */
  async getVerificationRequests(
    page: number = 1, 
    limit: number = 20, 
    status?: string
  ): Promise<{ verifications: any[]; total: number }> {
    try {
      // Check if the tables exist
      const verificationTableExists = await db.schema.hasTable('professional_verifications');
      const profileTableExists = await db.schema.hasTable('professional_profiles');
      
      if (!verificationTableExists || !profileTableExists) {
        return { verifications: [], total: 0 };
      }
      
      const offset = (page - 1) * limit;
      
      // Build query
      let query = db('professional_verifications')
        .join('professional_profiles', 'professional_verifications.profile_id', 'professional_profiles.id')
        .join('users', 'professional_profiles.user_id', 'users.id')
        .select(
          'professional_verifications.*',
          'professional_profiles.specialization',
          'professional_profiles.experience_years',
          'users.first_name',
          'users.last_name',
          'users.email'
        )
        .orderBy('professional_verifications.created_at', 'desc');
      
      // Apply status filter if provided
      if (status) {
        query = query.where('professional_verifications.status', status);
      }
      
      // Get total count (for pagination)
      const countQuery = query.clone();
      const totalResult = await countQuery.count('professional_verifications.id as count').first();
      const total = totalResult?.count ? Number(totalResult.count) : 0;
      
      // Get paginated results
      const verifications = await query.limit(limit).offset(offset);
      
      return {
        verifications,
        total
      };
    } catch (error) {
      console.error('Error getting verification requests:', error);
      return { verifications: [], total: 0 };
    }
  }

  /**
   * Approve professional verification
   * @param verificationId Verification ID
   * @param adminId ID of admin approving the verification
   * @param notes Optional approval notes
   */
  async approveVerification(verificationId: number, adminId: number, notes?: string): Promise<boolean> {
    try {
      // Check if the tables exist
      const verificationTableExists = await db.schema.hasTable('professional_verifications');
      const profileTableExists = await db.schema.hasTable('professional_profiles');
      
      if (!verificationTableExists || !profileTableExists) {
        return false;
      }
      
      const trx = await db.transaction();
      
      try {
        // Update verification status
        await trx('professional_verifications')
          .where('id', verificationId)
          .update({
            status: 'approved',
            admin_id: adminId,
            admin_notes: notes || null,
            updated_at: new Date()
          });
        
        // Get profile ID from verification
        const verification = await trx('professional_verifications')
          .where('id', verificationId)
          .first();
        
        // Update profile verified status
        await trx('professional_profiles')
          .where('id', verification.profile_id)
          .update({
            is_verified: true,
            updated_at: new Date()
          });
        
        // Get user ID from profile
        const profile = await trx('professional_profiles')
          .where('id', verification.profile_id)
          .first();
        
        // Add professional role to user
        const roleId = await trx('roles')
          .where('name', 'professional')
          .first()
          .then(role => role.id);
        
        await trx('user_roles').insert({
          user_id: profile.user_id,
          role_id: roleId,
          created_at: new Date()
        });
        
        await trx.commit();
        return true;
      } catch (error) {
        await trx.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Error approving verification:', error);
      return false;
    }
  }

  /**
   * Reject professional verification
   * @param verificationId Verification ID
   * @param adminId ID of admin rejecting the verification
   * @param reasons Rejection reasons
   */
  async rejectVerification(verificationId: number, adminId: number, reasons: string): Promise<boolean> {
    try {
      // Check if the tables exist
      const verificationTableExists = await db.schema.hasTable('professional_verifications');
      
      if (!verificationTableExists) {
        return false;
      }
      
      const trx = await db.transaction();
      
      try {
        // Update verification status
        await trx('professional_verifications')
          .where('id', verificationId)
          .update({
            status: 'rejected',
            admin_id: adminId,
            admin_notes: reasons,
            updated_at: new Date()
          });
        
        await trx.commit();
        return true;
      } catch (error) {
        await trx.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Error rejecting verification:', error);
      return false;
    }
  }
}

export default new ProfessionalService();