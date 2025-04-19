import { sequelize, models } from '../db';
import { Op } from 'sequelize';

// First, let's make sure we have a Jewelry model
// If you don't have a Jewelry model yet, you would need to create it in your db/models directory

class JewelryService {
  /**
   * Get total count of jewelry items
   */
  async getTotalCount(): Promise<number> {
    // Assuming you have a Jewelry model, if not, you'll need to create it
    return models.Jewelry?.count() || 0;
  }

  /**
   * Find jewelry item by ID
   * @param id Jewelry ID
   */
  async findById(id: number): Promise<any> {
    return models.Jewelry?.findByPk(id);
  }

  /**
   * Get jewelry items with pagination
   * @param page Page number
   * @param limit Items per page
   * @param filters Optional filters
   */
  async getJewelryItems(page: number = 1, limit: number = 20, filters: any = {}): Promise<{ items: any[]; total: number }> {
    const offset = (page - 1) * limit;
    
    // Build query with filters
    const whereClause: any = {};
    
    // Apply filters if provided
    if (filters.type) {
      whereClause.type = filters.type;
    }
    
    if (filters.material) {
      whereClause.material = filters.material;
    }
    
    if (filters.minPrice || filters.maxPrice) {
      whereClause.price = {};
      if (filters.minPrice) {
        whereClause.price[Op.gte] = filters.minPrice;
      }
      if (filters.maxPrice) {
        whereClause.price[Op.lte] = filters.maxPrice;
      }
    }
    
    // Get total count and paginated results
    const { count, rows } = await models.Jewelry?.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['created_at', 'DESC']]
    }) || { count: 0, rows: [] };
    
    return {
      items: rows,
      total: count
    };
  }

  /**
   * Get jewelry items with associated gemstones
   * @param jewelryId Jewelry ID
   */
  async getJewelryGemstones(jewelryId: number): Promise<any[]> {
    return models.Jewelry?.findByPk(jewelryId, {
      include: [{
        model: models.Gemstone,
        through: {
          attributes: ['position']
        }
      }]
    }).then(jewelry => jewelry?.Gemstones || []);
  }
}

export default new JewelryService();