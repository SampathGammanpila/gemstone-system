import { Knex } from 'knex';
import { db } from '../index';

/**
 * Base repository class that provides common database operations
 * @template T - Entity type
 * @template I - Id type (string for UUID, number for numeric IDs)
 */
export abstract class BaseRepository<T, I = string> {
  protected readonly tableName: string;
  protected readonly db: Knex;

  constructor(tableName: string) {
    this.tableName = tableName;
    this.db = db;
  }

  /**
   * Find all records in the table
   * @param limit - Optional limit on number of records to return
   * @param offset - Optional offset for pagination
   * @returns Promise with array of entities
   */
  async findAll(limit?: number, offset?: number): Promise<T[]> {
    const query = this.db(this.tableName);
    
    if (limit !== undefined) {
      query.limit(limit);
    }
    
    if (offset !== undefined) {
      query.offset(offset);
    }
    
    return query;
  }

  /**
   * Find a single record by ID
   * @param id - Record ID
   * @returns Promise with the entity or undefined if not found
   */
  async findById(id: I): Promise<T | undefined> {
    return this.db(this.tableName)
      .where({ id })
      .first();
  }

  /**
   * Find records by a specific field value
   * @param field - Field name
   * @param value - Field value
   * @returns Promise with array of matching entities
   */
  async findByField(field: keyof T, value: any): Promise<T[]> {
    return this.db(this.tableName)
      .where({ [field]: value });
  }

  /**
   * Find a single record by a specific field value
   * @param field - Field name
   * @param value - Field value
   * @returns Promise with the entity or undefined if not found
   */
  async findOneByField(field: keyof T, value: any): Promise<T | undefined> {
    return this.db(this.tableName)
      .where({ [field]: value })
      .first();
  }

  /**
   * Create a new record
   * @param data - The data to insert
   * @returns Promise with the inserted entity
   */
  async create(data: Partial<T>): Promise<T> {
    const [result] = await this.db(this.tableName)
      .insert(data)
      .returning('*');
    
    return result;
  }

  /**
   * Update a record
   * @param id - Record ID
   * @param data - The data to update
   * @returns Promise with the updated entity
   */
  async update(id: I, data: Partial<T>): Promise<T | undefined> {
    const [result] = await this.db(this.tableName)
      .where({ id })
      .update({
        ...data,
        updated_at: new Date(),
      })
      .returning('*');
    
    return result;
  }

  /**
   * Delete a record
   * @param id - Record ID
   * @returns Promise with the number of deleted rows
   */
  async delete(id: I): Promise<number> {
    return this.db(this.tableName)
      .where({ id })
      .delete();
  }

  /**
   * Check if a record exists
   * @param id - Record ID
   * @returns Promise with boolean indicating if the record exists
   */
  async exists(id: I): Promise<boolean> {
    const result = await this.db(this.tableName)
      .where({ id })
      .count({ count: '*' })
      .first();
    
    return result?.count > 0;
  }

  /**
   * Count the number of records in the table
   * @param whereClause - Optional where clause
   * @returns Promise with the count
   */
  async count(whereClause?: Partial<T>): Promise<number> {
    const query = this.db(this.tableName);
    
    if (whereClause) {
      query.where(whereClause);
    }
    
    const result = await query.count({ count: '*' }).first();
    return Number(result?.count) || 0;
  }

  /**
   * Perform a transaction
   * @param callback - Function to execute within the transaction
   * @returns Promise with the transaction result
   */
  async transaction<R>(callback: (trx: Knex.Transaction) => Promise<R>): Promise<R> {
    return this.db.transaction(callback);
  }
}