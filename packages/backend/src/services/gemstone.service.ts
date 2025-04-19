import { models } from '../db'; // Import models object
import { Op } from 'sequelize'; // Keep Op import
import { GemstoneModel } from '../db/models/gemstone.model'; // Import the model type if needed elsewhere

// Remove Gemstone model definition (it's now in db/models/gemstone.model.ts)
// Remove interface GemstoneAttributes (moved)
// Remove export interface GemstoneModel (moved)
// Remove const Gemstone = sequelize.define... (moved)
// Remove export { Gemstone }; (no longer defined here)

class GemstoneService {
  /**
   * Get total count of gemstones
   */
  async getTotalCount(): Promise<number> {
    // Use the imported model
    return await models.Gemstone.count();
  }

  /**
   * Find a gemstone by ID
   * @param id Gemstone ID
   */
  async findById(id: number): Promise<GemstoneModel | null> {
    // Use the imported model
    return await models.Gemstone.findByPk(id);
  }

  /**
   * Get gemstones with pagination
   * @param page Page number
   * @param limit Items per page
   * @param filters Optional filters
   */
  async getGemstones(page: number = 1, limit: number = 20, filters: any = {}): Promise<{ gemstones: GemstoneModel[]; total: number }> {
    const offset = (page - 1) * limit;

    // Build query with filters
    const whereClause: any = {};

    if (filters.type) {
      whereClause.type = filters.type;
    }

    if (filters.minCarat) {
      whereClause.carat = {
        ...whereClause.carat,
        [Op.gte]: filters.minCarat // Use Op directly
      };
    }

    if (filters.maxCarat) {
      whereClause.carat = {
        ...whereClause.carat,
        [Op.lte]: filters.maxCarat // Use Op directly
      };
    }

    // Get total count and results
    // Use the imported model
    const { count, rows } = await models.Gemstone.findAndCountAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    return {
      gemstones: rows,
      total: count
    };
  }
}

export default new GemstoneService();