import { db } from '../index';
import { 
  GemstoneFamily, 
  CutShape, 
  Color, 
  ColorGrade,
  ClarityGrade,
  MiningLocation
} from '../../types/database-types';

/**
 * Repository for handling reference data such as gemstone families, colors, etc.
 */
export class ReferenceDataRepository {
  /**
   * Get all gemstone families
   * @returns Promise with array of gemstone families
   */
  async getAllGemstoneFamily(): Promise<GemstoneFamily[]> {
    return db('gemstone_families').orderBy('name');
  }

  /**
   * Get gemstone families by category
   * @param category - Category name
   * @returns Promise with array of gemstone families in the category
   */
  async getGemstoneFamiliesByCategory(category: string): Promise<GemstoneFamily[]> {
    return db('gemstone_families')
      .where('category', category)
      .orderBy('name');
  }

  /**
   * Get all gemstone categories with their families
   * @returns Promise with categories and their families
   */
  async getGemstoneCategoriesWithFamilies(): Promise<any[]> {
    const families = await db('gemstone_families')
      .select('*')
      .orderBy(['category', 'name']);
    
    // Group by category
    const categories: Record<string, any> = {};
    families.forEach(family => {
      if (!categories[family.category]) {
        categories[family.category] = {
          category: family.category,
          families: []
        };
      }
      categories[family.category].families.push(family);
    });
    
    return Object.values(categories);
  }

  /**
   * Get all cut shapes
   * @returns Promise with array of cut shapes
   */
  async getAllCutShapes(): Promise<CutShape[]> {
    return db('cut_shapes').orderBy('name');
  }

  /**
   * Get cut shapes by category
   * @param category - Category name
   * @returns Promise with array of cut shapes in the category
   */
  async getCutShapesByCategory(category: string): Promise<CutShape[]> {
    return db('cut_shapes')
      .where('category', category)
      .orderBy('name');
  }

  /**
   * Get all cut shape categories with their shapes
   * @returns Promise with categories and their shapes
   */
  async getCutShapeCategoriesWithShapes(): Promise<any[]> {
    const shapes = await db('cut_shapes')
      .select('*')
      .orderBy(['category', 'name']);
    
    // Group by category
    const categories: Record<string, any> = {};
    shapes.forEach(shape => {
      if (!categories[shape.category]) {
        categories[shape.category] = {
          category: shape.category,
          shapes: []
        };
      }
      categories[shape.category].shapes.push(shape);
    });
    
    return Object.values(categories);
  }

  /**
   * Get all colors
   * @returns Promise with array of colors
   */
  async getAllColors(): Promise<Color[]> {
    return db('colors').orderBy('name');
  }

  /**
   * Get colors by category
   * @param category - Category name
   * @returns Promise with array of colors in the category
   */
  async getColorsByCategory(category: string): Promise<Color[]> {
    return db('colors')
      .where('category', category)
      .orderBy('name');
  }

  /**
   * Get all color categories with their colors
   * @returns Promise with categories and their colors
   */
  async getColorCategoriesWithColors(): Promise<any[]> {
    const colors = await db('colors')
      .select('*')
      .orderBy(['category', 'name']);
    
    // Group by category
    const categories: Record<string, any> = {};
    colors.forEach(color => {
      if (!categories[color.category]) {
        categories[color.category] = {
          category: color.category,
          colors: []
        };
      }
      categories[color.category].colors.push(color);
    });
    
    return Object.values(categories);
  }

  /**
   * Get all color grades
   * @returns Promise with array of color grades
   */
  async getAllColorGrades(): Promise<ColorGrade[]> {
    return db('color_grades').orderBy('grade');
  }

  /**
   * Get all clarity grades
   * @returns Promise with array of clarity grades
   */
  async getAllClarityGrades(): Promise<ClarityGrade[]> {
    return db('clarity_grades').orderBy(['category', 'grade']);
  }

  /**
   * Get clarity grades by category
   * @param category - Category name (Diamond or Colored Stone)
   * @returns Promise with array of clarity grades for the category
   */
  async getClarityGradesByCategory(category: string): Promise<ClarityGrade[]> {
    return db('clarity_grades')
      .where('category', category)
      .orderBy('grade');
  }

  /**
   * Get all mining locations
   * @returns Promise with array of mining locations
   */
  async getAllMiningLocations(): Promise<MiningLocation[]> {
    return db('mining_locations').orderBy(['country', 'name']);
  }

  /**
   * Get mining locations by country
   * @param country - Country name
   * @returns Promise with array of mining locations in the country
   */
  async getMiningLocationsByCountry(country: string): Promise<MiningLocation[]> {
    return db('mining_locations')
      .where('country', country)
      .orderBy('name');
  }

  /**
   * Get all countries with their mining locations
   * @returns Promise with countries and their mining locations
   */
  async getCountriesWithMiningLocations(): Promise<any[]> {
    const locations = await db('mining_locations')
      .select('*')
      .orderBy(['country', 'name']);
    
    // Group by country
    const countries: Record<string, any> = {};
    locations.forEach(location => {
      if (!countries[location.country]) {
        countries[location.country] = {
          country: location.country,
          locations: []
        };
      }
      countries[location.country].locations.push(location);
    });
    
    return Object.values(countries);
  }

  /**
   * Search reference data by term
   * @param term - Search term
   * @returns Promise with search results by category
   */
  async searchReferenceData(term: string): Promise<any> {
    const gemstonePromise = db('gemstone_families')
      .whereRaw('name ILIKE ?', [`%${term}%`])
      .orWhereRaw('description ILIKE ?', [`%${term}%`])
      .limit(10);
    
    const cutPromise = db('cut_shapes')
      .whereRaw('name ILIKE ?', [`%${term}%`])
      .orWhereRaw('description ILIKE ?', [`%${term}%`])
      .limit(10);
    
    const colorPromise = db('colors')
      .whereRaw('name ILIKE ?', [`%${term}%`])
      .orWhereRaw('display_name ILIKE ?', [`%${term}%`])
      .limit(10);
    
    const locationPromise = db('mining_locations')
      .whereRaw('name ILIKE ?', [`%${term}%`])
      .orWhereRaw('country ILIKE ?', [`%${term}%`])
      .orWhereRaw('region ILIKE ?', [`%${term}%`])
      .orWhereRaw('locality ILIKE ?', [`%${term}%`])
      .limit(10);
    
    const [gemstones, cuts, colors, locations] = await Promise.all([
      gemstonePromise,
      cutPromise,
      colorPromise,
      locationPromise
    ]);
    
    return {
      gemstones,
      cuts,
      colors,
      locations
    };
  }

  /**
   * Add a new gemstone family
   * @param data - Gemstone family data
   * @returns Promise with created gemstone family
   */
  async addGemstoneFamily(data: Partial<GemstoneFamily>): Promise<GemstoneFamily> {
    const [family] = await db('gemstone_families')
      .insert(data)
      .returning('*');
    
    return family;
  }

  /**
   * Add a new cut shape
   * @param data - Cut shape data
   * @returns Promise with created cut shape
   */
  async addCutShape(data: Partial<CutShape>): Promise<CutShape> {
    const [shape] = await db('cut_shapes')
      .insert(data)
      .returning('*');
    
    return shape;
  }

  /**
   * Add a new color
   * @param data - Color data
   * @returns Promise with created color
   */
  async addColor(data: Partial<Color>): Promise<Color> {
    const [color] = await db('colors')
      .insert(data)
      .returning('*');
    
    return color;
  }

  /**
   * Add a new mining location
   * @param data - Mining location data
   * @returns Promise with created mining location
   */
  async addMiningLocation(data: Partial<MiningLocation>): Promise<MiningLocation> {
    const [location] = await db('mining_locations')
      .insert(data)
      .returning('*');
    
    return location;
  }

  /**
   * Update a gemstone family
   * @param id - Gemstone family ID
   * @param data - Updated data
   * @returns Promise with updated gemstone family
   */
  async updateGemstoneFamily(id: number, data: Partial<GemstoneFamily>): Promise<GemstoneFamily | undefined> {
    const [updated] = await db('gemstone_families')
      .where('id', id)
      .update({
        ...data,
        updated_at: new Date()
      })
      .returning('*');
    
    return updated;
  }

  /**
   * Update a cut shape
   * @param id - Cut shape ID
   * @param data - Updated data
   * @returns Promise with updated cut shape
   */
  async updateCutShape(id: number, data: Partial<CutShape>): Promise<CutShape | undefined> {
    const [updated] = await db('cut_shapes')
      .where('id', id)
      .update({
        ...data,
        updated_at: new Date()
      })
      .returning('*');
    
    return updated;
  }

  /**
   * Update a color
   * @param id - Color ID
   * @param data - Updated data
   * @returns Promise with updated color
   */
  async updateColor(id: number, data: Partial<Color>): Promise<Color | undefined> {
    const [updated] = await db('colors')
      .where('id', id)
      .update({
        ...data,
        updated_at: new Date()
      })
      .returning('*');
    
    return updated;
  }

  /**
   * Update a mining location
   * @param id - Mining location ID
   * @param data - Updated data
   * @returns Promise with updated mining location
   */
  async updateMiningLocation(id: number, data: Partial<MiningLocation>): Promise<MiningLocation | undefined> {
    const [updated] = await db('mining_locations')
      .where('id', id)
      .update({
        ...data,
        updated_at: new Date()
      })
      .returning('*');
    
    return updated;
  }

  /**
   * Delete a gemstone family
   * @param id - Gemstone family ID
   * @returns Promise with number of deleted rows
   */
  async deleteGemstoneFamily(id: number): Promise<number> {
    return db('gemstone_families')
      .where('id', id)
      .delete();
  }

  /**
   * Delete a cut shape
   * @param id - Cut shape ID
   * @returns Promise with number of deleted rows
   */
  async deleteCutShape(id: number): Promise<number> {
    return db('cut_shapes')
      .where('id', id)
      .delete();
  }

  /**
   * Delete a color
   * @param id - Color ID
   * @returns Promise with number of deleted rows
   */
  async deleteColor(id: number): Promise<number> {
    return db('colors')
      .where('id', id)
      .delete();
  }

  /**
   * Delete a mining location
   * @param id - Mining location ID
   * @returns Promise with number of deleted rows
   */
  async deleteMiningLocation(id: number): Promise<number> {
    return db('mining_locations')
      .where('id', id)
      .delete();
  }

  /**
   * Check if a gemstone family is referenced by any gemstones or rough stones
   * @param id - Gemstone family ID
   * @returns Promise with boolean indicating if the family is referenced
   */
  async isGemstoneFamilyReferenced(id: number): Promise<boolean> {
    const gemstoneCount = await db('gemstones')
      .where('gemstone_family_id', id)
      .count('id as count')
      .first();
    
    const roughStoneCount = await db('rough_stones')
      .where('gemstone_family_id', id)
      .count('id as count')
      .first();
    
    return (Number(gemstoneCount?.count) > 0 || Number(roughStoneCount?.count) > 0);
  }

  /**
   * Check if a cut shape is referenced by any gemstones
   * @param id - Cut shape ID
   * @returns Promise with boolean indicating if the shape is referenced
   */
  async isCutShapeReferenced(id: number): Promise<boolean> {
    const count = await db('gemstones')
      .where('cut_shape_id', id)
      .count('id as count')
      .first();
    
    return Number(count?.count) > 0;
  }

  /**
   * Check if a color is referenced by any gemstones or rough stones
   * @param id - Color ID
   * @returns Promise with boolean indicating if the color is referenced
   */
  async isColorReferenced(id: number): Promise<boolean> {
    const gemstoneCount = await db('gemstones')
      .where('color_id', id)
      .count('id as count')
      .first();
    
    const roughStoneCount = await db('rough_stones')
      .where('color_id', id)
      .count('id as count')
      .first();
    
    return (Number(gemstoneCount?.count) > 0 || Number(roughStoneCount?.count) > 0);
  }

  /**
   * Check if a mining location is referenced by any gemstones or rough stones
   * @param id - Mining location ID
   * @returns Promise with boolean indicating if the location is referenced
   */
  async isMiningLocationReferenced(id: number): Promise<boolean> {
    const gemstoneCount = await db('gemstones')
      .where('origin_id', id)
      .count('id as count')
      .first();
    
    const roughStoneCount = await db('rough_stones')
      .where('origin_id', id)
      .count('id as count')
      .first();
    
    return (Number(gemstoneCount?.count) > 0 || Number(roughStoneCount?.count) > 0);
  }
}