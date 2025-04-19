import { db } from '../db';

class ProfessionalService {
  /**
   * Get count of pending professional verifications
   */
  async getPendingVerificationsCount(): Promise<number> {
    const result = await db('professional_verifications')
      .where('status', 'pending')
      .count('id as count')
      .first();
    return result?.count ? Number(result.count) : 0;
  }

  /**
   * Find professional profile by user ID
   * @param userId User ID
   */
  async findByUserId(userId: number): Promise<any> {
    return db('professional_profiles').where({ user_id: userId }).first();
  }

  /**
   * Get professional verification by ID
   * @param verificationId Verification ID
   */
  async getVerificationById(verificationId: number): Promise<any> {
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
  }

  /**
   * Approve professional verification
   * @param verificationId Verification ID
   * @param adminId ID of admin approving the verification
   * @param notes Optional approval notes
   */
  async approveVerification(verificationId: number, adminId: number, notes?: string): Promise<boolean> {
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
  }

  /**
   * Reject professional verification
   * @param verificationId Verification ID
   * @param adminId ID of admin rejecting the verification
   * @param reasons Rejection reasons
   */
  async rejectVerification(verificationId: number, adminId: number, reasons: string): Promise<boolean> {
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
  }
}

export default new ProfessionalService();