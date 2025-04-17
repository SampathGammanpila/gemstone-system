import { BaseRepository } from './base.repository';
import { RoughStone, RoughStoneImage } from '../../types/database-types';
import { db } from '../index';

export class RoughStoneRepository extends BaseRepository<RoughStone> {
  constructor() {
    super('rough_stones');
  }

  /**
   * Find a rough stone by its unique ID (not the UUID primary key)
   * @param uniqueId - Unique identifier of the rough stone
   * @returns Promise with the rough stone or undefined if not found
   */
  async findByUniqueId(uniqueId: string): Promise<RoughStone | undefined> {
    return this.findOneByField('unique_id', uniqueId);
  }

  /**
   * Get a rough stone with all its details (joined with related tables)
   * @param id - Rough stone ID
   * @returns Promise with the rough stone details or null if not found
   */
  async getRoughStoneWithDetails(id: string): Promise<any | null> {
    const roughStone = await db('rough_stones as rs')
      .leftJoin('gemstone_families as gf', 'rs.gemstone_family_id', 'gf.id')
      .leftJoin('colors as c', 'rs.color_id', 'c.id')
      .leftJoin('mining_locations as ml', 'rs.origin_id', 'ml.id')
      .leftJoin('users as u', 'rs.owner_id', 'u.id')
      .leftJoin('users as v', 'rs.verified_by', 'v.id')
      .where('rs.id', id)
      .select(
        'rs.*',
        'gf.name as gemstone_family_name',
        'gf.category as gemstone_category',
        'c.name as color_name',
        'c.display_name as color_display_name',
        'c.hex_code as color_hex_code',
        'ml.name as origin_name',
        'ml.country as origin_country',
        db.raw('CONCAT(u.first_name, \' \', u.last_name) as owner_name'),
        db.raw('CONCAT(v.first_name, \' \', v.last_name) as verifier_name')
      )
      .first();
    
    if (!roughStone) {
      return null;
    }
    
    // Get rough stone images
    const images = await db('rough_stone_images')
      .where('rough_stone_id', id)
      .orderBy([
        { column: 'is_primary', order: 'desc' },
        { column: 'display_order', order: 'asc' }
      ]);
    
    return {
      ...roughStone,
      images
    };
  }

  /**
   * Create a rough stone with images
   * @param roughStoneData - Rough stone data
   * @param images - Array of image data
   * @returns Promise with created rough stone and images
   */
  async createRoughStoneWithImages(
    roughStoneData: Partial<RoughStone>,
    images: Partial<RoughStoneImage>[] = []
  ): Promise<{ roughStone: RoughStone; images: RoughStoneImage[] }> {
    return db.transaction(async (trx) => {
      // Insert rough stone
      const [roughStone] = await trx('rough_stones')
        .insert(roughStoneData)
        .returning('*');
      
      const createdImages: RoughStoneImage[] = [];
      
      // Insert images if provided
      if (images.length > 0) {
        const imageData = images.map(img => ({
          ...img,
          rough_stone_id: roughStone.id
        }));
        
        createdImages.push(...await trx('rough_stone_images')
          .insert(imageData)
          .returning('*'));
      }
      
      return { roughStone, images: createdImages };
    });
  }

  /**
   * Update rough stone images
   * @param roughStoneId - Rough stone ID
   * @param images - Array of new or updated images
   * @param deleteOthers - Whether to delete images not in the provided array
   * @returns Promise with updated images
   */
  async updateRoughStoneImages(
    roughStoneId: string,
    images: (Partial<RoughStoneImage> & { id?: string })[], 
    deleteOthers = false
  ): Promise<RoughStoneImage[]> {
    return db.transaction(async (trx) => {
      const result: RoughStoneImage[] = [];
      
      // Handle each image
      for (const image of images) {
        if (image.id) {
          // Update existing image
          const [updated] = await trx('rough_stone_images')
            .where({ id: image.id, rough_stone_id: roughStoneId })
            .update({
              image_url: image.image_url,
              is_primary: image.is_primary,
              display_order: image.display_order
            })
            .returning('*');
          
          if (updated) {
            result.push(updated);
          }
        } else {
          // Insert new image
          const [created] = await trx('rough_stone_images')
            .insert({
              ...image,
              rough_stone_id: roughStoneId
            })
            .returning('*');
          
          result.push(created);
        }
      }
      
      // Delete other images if requested
      if (deleteOthers) {
        const imageIds = images
          .filter(img => img.id)
          .map(img => img.id);
        
        await trx('rough_stone_images')
          .where('rough_stone_id', roughStoneId)
          .whereNotIn('id', imageIds)
          .delete();
      }
      
      return result;
    });
  }

  /**
   * Search rough stones with various filters
   * @param options - Search options
   * @returns Promise with rough stones and total count
   */
  async searchRoughStones(options: {
    page?: number;
    limit?: number;
    owner_id?: string;
    gemstone_family_id?: number;
    color_id?: number;
    min_weight?: number;
    max_weight?: number;
    origin_id?: number;
    is_public?: boolean;
    is_draft?: boolean;
    is_verified?: boolean;
    search_term?: string;
    sort_by?: string;
    sort_dir?: 'asc' | 'desc';
  }): Promise<{ roughStones: any[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      owner_id,
      gemstone_family_id,
      color_id,
      min_weight,
      max_weight,
      origin_id,
      is_public,
      is_draft,
      is_verified,
      search_term,
      sort_by = 'created_at',
      sort_dir = 'desc'
    } = options;
    
    const offset = (page - 1) * limit;
    
    // Start building query
    const query = db('rough_stones as rs')
      .leftJoin('gemstone_families as gf', 'rs.gemstone_family_id', 'gf.id')
      .leftJoin('colors as c', 'rs.color_id', 'c.id')
      .leftJoin('mining_locations as ml', 'rs.origin_id', 'ml.id')
      .select(
        'rs.*',
        'gf.name as gemstone_family_name',
        'c.name as color_name',
        'c.display_name as color_display_name',
        'c.hex_code as color_hex_code',
        'ml.name as origin_name',
        'ml.country as origin_country'
      );
    
    // Apply filters
    if (owner_id) {
      query.where('rs.owner_id', owner_id);
    }
    
    if (gemstone_family_id) {
      query.where('rs.gemstone_family_id', gemstone_family_id);
    }
    
    if (color_id) {
      query.where('rs.color_id', color_id);
    }
    
    if (min_weight !== undefined) {
      query.where('rs.weight_carats', '>=', min_weight);
    }
    
    if (max_weight !== undefined) {
      query.where('rs.weight_carats', '<=', max_weight);
    }
    
    if (origin_id) {
      query.where('rs.origin_id', origin_id);
    }
    
    if (is_public !== undefined) {
      query.where('rs.is_public', is_public);
    }
    
    if (is_draft !== undefined) {
      query.where('rs.is_draft', is_draft);
    }
    
    if (is_verified !== undefined) {
      query.where('rs.is_verified', is_verified);
    }
    
    // Apply search term if provided
    if (search_term) {
      query.where(function() {
        this.whereRaw('rs.unique_id ILIKE ?', [`%${search_term}%`])
          .orWhereRaw('gf.name ILIKE ?', [`%${search_term}%`])
          .orWhereRaw('c.name ILIKE ?', [`%${search_term}%`])
          .orWhereRaw('c.display_name ILIKE ?', [`%${search_term}%`])
          .orWhereRaw('ml.name ILIKE ?', [`%${search_term}%`])
          .orWhereRaw('ml.country ILIKE ?', [`%${search_term}%`])
          .orWhereRaw('rs.notes ILIKE ?', [`%${search_term}%`]);
      });
    }
    
    // Get total count for pagination
    const countQuery = query.clone();
    const totalResult = await countQuery.count({ count: '*' }).first();
    const total = Number(totalResult?.count) || 0;
    
    // Apply sorting and pagination
    query.orderBy(`rs.${sort_by}`, sort_dir)
      .limit(limit)
      .offset(offset);
    
    // Execute query
    const roughStones = await query;
    
    // Get primary image for each rough stone
    const roughStoneIds = roughStones.map(rs => rs.id);
    const images = await db('rough_stone_images')
      .whereIn('rough_stone_id', roughStoneIds)
      .where('is_primary', true);
    
    // Map images to rough stones
    const imageMap = new Map();
    images.forEach(img => {
      imageMap.set(img.rough_stone_id, img);
    });
    
    // Add primary image to each rough stone
    const roughStonesWithImages = roughStones.map(rs => ({
      ...rs,
      primary_image: imageMap.get(rs.id) || null
    }));
    
    return {
      roughStones: roughStonesWithImages,
      total
    };
  }

  /**
   * Generate a unique ID for a new rough stone
   * @returns Promise with unique ID
   */
  async generateUniqueId(): Promise<string> {
    // Generate a prefix for rough stones - RS (Rough Stone)
    const prefix = 'RS';
    
    // Get current date components for the ID
    const now = new Date();
    const year = now.getFullYear().toString().substr(2); // Last 2 digits of year
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    
    // Get the count of rough stones created today to create a unique sequence
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const count = await db('rough_stones')
      .where('created_at', '>=', today)
      .count('id as count')
      .first();
    
    const sequence = (Number(count?.count) + 1).toString().padStart(4, '0');
    
    // Generate a random 3-character alphanumeric suffix
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding confusing chars like 0, O, 1, I
    let suffix = '';
    for (let i = 0; i < 3; i++) {
      suffix += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    // Combine all parts to create the unique ID
    const uniqueId = `${prefix}${year}${month}${sequence}${suffix}`;
    
    // Verify the ID doesn't already exist (extremely unlikely but possible)
    const exists = await this.findByUniqueId(uniqueId);
    
    if (exists) {
      // Recursive call in the unlikely event of a collision
      return this.generateUniqueId();
    }
    
    return uniqueId;
  }

  /**
   * Verify a rough stone
   * @param roughStoneId - Rough stone ID
   * @param verifierId - Verifier's user ID
   * @returns Promise with updated rough stone
   */
  async verifyRoughStone(roughStoneId: string, verifierId: string): Promise<RoughStone | undefined> {
    return this.update(roughStoneId, {
      is_verified: true,
      verified_by: verifierId,
      verified_at: new Date()
    });
  }

  /**
   * Get cut gemstones derived from this rough stone
   * @param roughStoneId - Rough stone ID
   * @returns Promise with array of derived gemstones
   */
  async getDerivedGemstones(roughStoneId: string): Promise<any[]> {
    return db('gemstones as g')
      .leftJoin('gemstone_families as gf', 'g.gemstone_family_id', 'gf.id')
      .leftJoin('cut_shapes as cs', 'g.cut_shape_id', 'cs.id')
      .where('g.rough_stone_id', roughStoneId)
      .select(
        'g.id',
        'g.unique_id',
        'g.weight_carats',
        'gf.name as gemstone_family_name',
        'cs.name as cut_shape_name',
        'g.created_at'
      );
  }
}