import { BaseRepository } from './base.repository';
import { Gemstone, GemstoneImage } from '../../types/database-types';
import { db } from '../index';

export class GemstoneRepository extends BaseRepository<Gemstone> {
  constructor() {
    super('gemstones');
  }

  /**
   * Find a gemstone by its unique ID (not the UUID primary key)
   * @param uniqueId - Unique identifier of the gemstone
   * @returns Promise with the gemstone or undefined if not found
   */
  async findByUniqueId(uniqueId: string): Promise<Gemstone | undefined> {
    return this.findOneByField('unique_id', uniqueId);
  }

  /**
   * Get a gemstone with all its details (joined with related tables)
   * @param id - Gemstone ID
   * @returns Promise with the gemstone details or null if not found
   */
  async getGemstoneWithDetails(id: string): Promise<any | null> {
    const gemstone = await db('gemstones as g')
      .leftJoin('gemstone_families as gf', 'g.gemstone_family_id', 'gf.id')
      .leftJoin('cut_shapes as cs', 'g.cut_shape_id', 'cs.id')
      .leftJoin('colors as c', 'g.color_id', 'c.id')
      .leftJoin('color_grades as cg', 'g.color_grade_id', 'cg.id')
      .leftJoin('clarity_grades as clg', 'g.clarity_grade_id', 'clg.id')
      .leftJoin('mining_locations as ml', 'g.origin_id', 'ml.id')
      .leftJoin('rough_stones as rs', 'g.rough_stone_id', 'rs.id')
      .leftJoin('users as u', 'g.owner_id', 'u.id')
      .where('g.id', id)
      .select(
        'g.*',
        'gf.name as gemstone_family_name',
        'gf.category as gemstone_category',
        'cs.name as cut_shape_name',
        'cs.category as cut_shape_category',
        'c.name as color_name',
        'c.display_name as color_display_name',
        'c.hex_code as color_hex_code',
        'cg.grade as color_grade',
        'clg.grade as clarity_grade',
        'ml.name as origin_name',
        'ml.country as origin_country',
        'rs.unique_id as rough_stone_unique_id',
        db.raw('CONCAT(u.first_name, \' \', u.last_name) as owner_name')
      )
      .first();
    
    if (!gemstone) {
      return null;
    }
    
    // Get gemstone images
    const images = await db('gemstone_images')
      .where('gemstone_id', id)
      .orderBy([
        { column: 'is_primary', order: 'desc' },
        { column: 'display_order', order: 'asc' }
      ]);
    
    return {
      ...gemstone,
      images
    };
  }

  /**
   * Create a gemstone with images
   * @param gemstoneData - Gemstone data
   * @param images - Array of image data
   * @returns Promise with created gemstone and images
   */
  async createGemstoneWithImages(
    gemstoneData: Partial<Gemstone>,
    images: Partial<GemstoneImage>[] = []
  ): Promise<{ gemstone: Gemstone; images: GemstoneImage[] }> {
    return db.transaction(async (trx) => {
      // Insert gemstone
      const [gemstone] = await trx('gemstones')
        .insert(gemstoneData)
        .returning('*');
      
      const createdImages: GemstoneImage[] = [];
      
      // Insert images if provided
      if (images.length > 0) {
        const imageData = images.map(img => ({
          ...img,
          gemstone_id: gemstone.id
        }));
        
        createdImages.push(...await trx('gemstone_images')
          .insert(imageData)
          .returning('*'));
      }
      
      return { gemstone, images: createdImages };
    });
  }

  /**
   * Update gemstone images
   * @param gemstoneId - Gemstone ID
   * @param images - Array of new or updated images
   * @param deleteOthers - Whether to delete images not in the provided array
   * @returns Promise with updated images
   */
  async updateGemstoneImages(
    gemstoneId: string,
    images: (Partial<GemstoneImage> & { id?: string })[], 
    deleteOthers = false
  ): Promise<GemstoneImage[]> {
    return db.transaction(async (trx) => {
      const result: GemstoneImage[] = [];
      
      // Handle each image
      for (const image of images) {
        if (image.id) {
          // Update existing image
          const [updated] = await trx('gemstone_images')
            .where({ id: image.id, gemstone_id: gemstoneId })
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
          const [created] = await trx('gemstone_images')
            .insert({
              ...image,
              gemstone_id: gemstoneId
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
        
        await trx('gemstone_images')
          .where('gemstone_id', gemstoneId)
          .whereNotIn('id', imageIds)
          .delete();
      }
      
      return result;
    });
  }

  /**
   * Search gemstones with various filters
   * @param options - Search options
   * @returns Promise with gemstones and total count
   */
  async searchGemstones(options: {
    page?: number;
    limit?: number;
    owner_id?: string;
    gemstone_family_id?: number;
    cut_shape_id?: number;
    color_id?: number;
    min_weight?: number;
    max_weight?: number;
    origin_id?: number;
    is_public?: boolean;
    is_draft?: boolean;
    search_term?: string;
    sort_by?: string;
    sort_dir?: 'asc' | 'desc';
  }): Promise<{ gemstones: any[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      owner_id,
      gemstone_family_id,
      cut_shape_id,
      color_id,
      min_weight,
      max_weight,
      origin_id,
      is_public,
      is_draft,
      search_term,
      sort_by = 'created_at',
      sort_dir = 'desc'
    } = options;
    
    const offset = (page - 1) * limit;
    
    // Start building query
    const query = db('gemstones as g')
      .leftJoin('gemstone_families as gf', 'g.gemstone_family_id', 'gf.id')
      .leftJoin('cut_shapes as cs', 'g.cut_shape_id', 'cs.id')
      .leftJoin('colors as c', 'g.color_id', 'c.id')
      .leftJoin('color_grades as cg', 'g.color_grade_id', 'cg.id')
      .leftJoin('mining_locations as ml', 'g.origin_id', 'ml.id')
      .select(
        'g.*',
        'gf.name as gemstone_family_name',
        'cs.name as cut_shape_name',
        'c.name as color_name',
        'c.display_name as color_display_name',
        'c.hex_code as color_hex_code',
        'cg.grade as color_grade',
        'ml.name as origin_name',
        'ml.country as origin_country'
      );
    
    // Apply filters
    if (owner_id) {
      query.where('g.owner_id', owner_id);
    }
    
    if (gemstone_family_id) {
      query.where('g.gemstone_family_id', gemstone_family_id);
    }
    
    if (cut_shape_id) {
      query.where('g.cut_shape_id', cut_shape_id);
    }
    
    if (color_id) {
      query.where('g.color_id', color_id);
    }
    
    if (min_weight !== undefined) {
      query.where('g.weight_carats', '>=', min_weight);
    }
    
    if (max_weight !== undefined) {
      query.where('g.weight_carats', '<=', max_weight);
    }
    
    if (origin_id) {
      query.where('g.origin_id', origin_id);
    }
    
    if (is_public !== undefined) {
      query.where('g.is_public', is_public);
    }
    
    if (is_draft !== undefined) {
      query.where('g.is_draft', is_draft);
    }
    
    // Apply search term if provided
    if (search_term) {
      query.where(function() {
        this.whereRaw('g.unique_id ILIKE ?', [`%${search_term}%`])
          .orWhereRaw('gf.name ILIKE ?', [`%${search_term}%`])
          .orWhereRaw('cs.name ILIKE ?', [`%${search_term}%`])
          .orWhereRaw('c.name ILIKE ?', [`%${search_term}%`])
          .orWhereRaw('c.display_name ILIKE ?', [`%${search_term}%`])
          .orWhereRaw('ml.name ILIKE ?', [`%${search_term}%`])
          .orWhereRaw('ml.country ILIKE ?', [`%${search_term}%`])
          .orWhereRaw('g.notes ILIKE ?', [`%${search_term}%`]);
      });
    }
    
    // Get total count for pagination
    const countQuery = query.clone();
    const totalResult = await countQuery.count({ count: '*' }).first();
    const total = Number(totalResult?.count) || 0;
    
    // Apply sorting and pagination
    query.orderBy(`g.${sort_by}`, sort_dir)
      .limit(limit)
      .offset(offset);
    
    // Execute query
    const gemstones = await query;
    
    // Get primary image for each gemstone
    const gemstoneIds = gemstones.map(g => g.id);
    const images = await db('gemstone_images')
      .whereIn('gemstone_id', gemstoneIds)
      .where('is_primary', true);
    
    // Map images to gemstones
    const imageMap = new Map();
    images.forEach(img => {
      imageMap.set(img.gemstone_id, img);
    });
    
    // Add primary image to each gemstone
    const gemstonesWithImages = gemstones.map(g => ({
      ...g,
      primary_image: imageMap.get(g.id) || null
    }));
    
    return {
      gemstones: gemstonesWithImages,
      total
    };
  }

  /**
   * Generate a unique ID for a new gemstone
   * @returns Promise with unique ID
   */
  async generateUniqueId(): Promise<string> {
    // Generate a prefix for gemstones - GS (Gemstone)
    const prefix = 'GS';
    
    // Get current date components for the ID
    const now = new Date();
    const year = now.getFullYear().toString().substr(2); // Last 2 digits of year
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    
    // Get the count of gemstones created today to create a unique sequence
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const count = await db('gemstones')
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
   * Save a gemstone draft
   * @param userId - User ID
   * @param data - Draft data
   * @returns Promise with created draft
   */
  async saveDraft(userId: string, data: Record<string, any>): Promise<any> {
    const [draft] = await db('gemstone_drafts')
      .insert({
        user_id: userId,
        data: data
      })
      .returning('*');
    
    return draft;
  }

  /**
   * Update a gemstone draft
   * @param draftId - Draft ID
   * @param data - Updated draft data
   * @returns Promise with updated draft
   */
  async updateDraft(draftId: string, data: Record<string, any>): Promise<any> {
    const [draft] = await db('gemstone_drafts')
      .where('id', draftId)
      .update({
        data: data,
        updated_at: new Date()
      })
      .returning('*');
    
    return draft;
  }

  /**
   * Get user's draft gemstones
   * @param userId - User ID
   * @returns Promise with user's drafts
   */
  async getUserDrafts(userId: string): Promise<any[]> {
    return db('gemstone_drafts')
      .where('user_id', userId)
      .orderBy('updated_at', 'desc');
  }

  /**
   * Delete a draft
   * @param draftId - Draft ID
   * @returns Promise with number of deleted rows
   */
  async deleteDraft(draftId: string): Promise<number> {
    return db('gemstone_drafts')
      .where('id', draftId)
      .delete();
  }

  /**
   * Convert a draft to a gemstone
   * @param draftId - Draft ID
   * @param additionalData - Additional gemstone data
   * @returns Promise with created gemstone
   */
  async convertDraftToGemstone(draftId: string, additionalData: Partial<Gemstone> = {}): Promise<Gemstone> {
    return db.transaction(async (trx) => {
      // Get the draft
      const draft = await trx('gemstone_drafts')
        .where('id', draftId)
        .first();
      
      if (!draft) {
        throw new Error('Draft not found');
      }
      
      // Generate unique ID if not provided
      const uniqueId = additionalData.unique_id || await this.generateUniqueId();
      
      // Prepare gemstone data
      const gemstoneData = {
        ...draft.data,
        ...additionalData,
        unique_id: uniqueId,
        is_draft: false,
        created_by: draft.user_id,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      // Insert gemstone
      const [gemstone] = await trx('gemstones')
        .insert(gemstoneData)
        .returning('*');
      
      // Delete the draft
      await trx('gemstone_drafts')
        .where('id', draftId)
        .delete();
      
      return gemstone;
    });
  }
}