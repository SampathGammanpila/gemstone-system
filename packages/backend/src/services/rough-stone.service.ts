import { models, sequelize } from '../db';
import { QueryTypes } from 'sequelize';

interface CountResult {
  count: number | string;
}

class RoughStoneService {
  /**
   * Get total count of rough stones
   */
  async getTotalCount(): Promise<number> {
    const result = await sequelize.query<CountResult>(
      'SELECT COUNT(*) as count FROM rough_stones',
      { type: QueryTypes.SELECT }
    );
    return result[0]?.count ? Number(result[0].count) : 0;
  }

  /**
   * Find a rough stone by ID
   * @param id Rough stone ID
   */
  async findById(id: number): Promise<any> {
    return models.Gemstone.findOne({ where: { id, type: 'rough' } });
  }

  /**
   * Get rough stones with pagination
   * @param page Page number
   * @param limit Items per page
   * @param filters Optional filters
   */
  async getRoughStones(page: number = 1, limit: number = 20, filters: any = {}): Promise<{ roughStones: any[]; total: number }> {
    const offset = (page - 1) * limit;
    
    // Build where clause with filters
    const whereClause: any = { type: 'rough' };
    
    if (filters.type) {
      whereClause.subType = filters.type;
    }
    
    if (filters.minWeight) {
      whereClause.weight = { ...whereClause.weight, $gte: filters.minWeight };
    }
    
    if (filters.maxWeight) {
      whereClause.weight = { ...whereClause.weight, $lte: filters.maxWeight };
    }
    
    // Get total count (for pagination)
    const total = await models.Gemstone.count({ where: whereClause });
    
    // Get paginated results
    const roughStones = await models.Gemstone.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
    
    return {
      roughStones,
      total
    };
  }
}

export default new RoughStoneService();