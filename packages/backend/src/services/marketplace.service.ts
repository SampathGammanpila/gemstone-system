import { db } from '../db';

class MarketplaceService {
  /**
   * Get total count of orders
   */
  async getTotalOrdersCount(): Promise<number> {
    try {
      // Check if the table exists
      const tableExists = await db.schema.hasTable('marketplace_orders');
      if (!tableExists) {
        console.log('marketplace_orders table does not exist');
        return 0;
      }
      
      const result = await db('marketplace_orders').count('id as count').first();
      return result?.count ? Number(result.count) : 0;
    } catch (error) {
      console.error('Error getting total orders count:', error);
      return 0;
    }
  }

  /**
   * Get popular items statistics
   * @param limit Number of top items to retrieve
   */
  async getPopularItemsStats(limit: number = 5): Promise<any[]> {
    try {
      // Check if the tables exist
      const listingsTableExists = await db.schema.hasTable('marketplace_listings');
      const viewsTableExists = await db.schema.hasTable('marketplace_views');
      const ordersTableExists = await db.schema.hasTable('marketplace_orders');
      
      if (!listingsTableExists) {
        console.log('marketplace_listings table does not exist');
        return [];
      }
      
      // Build query based on which tables exist
      let query = db('marketplace_listings')
        .select(
          'marketplace_listings.id',
          'marketplace_listings.title',
          'marketplace_listings.price',
          'marketplace_listings.item_type',
          'marketplace_listings.item_id'
        );
      
      // Add view count if views table exists
      if (viewsTableExists) {
        query = query.leftJoin('marketplace_views', 'marketplace_listings.id', 'marketplace_views.listing_id')
          .select(db.raw('COUNT(marketplace_views.id) as view_count'));
      } else {
        query = query.select(db.raw('0 as view_count'));
      }
      
      // Add order count if orders table exists
      if (ordersTableExists) {
        query = query.leftJoin('marketplace_orders', 'marketplace_listings.id', 'marketplace_orders.listing_id')
          .select(db.raw('COUNT(marketplace_orders.id) as order_count'));
      } else {
        query = query.select(db.raw('0 as order_count'));
      }
      
      // Group by and order
      query = query.groupBy('marketplace_listings.id');
      
      // Order by popularity (views + orders)
      if (viewsTableExists || ordersTableExists) {
        query = query.orderByRaw('(COUNT(marketplace_views.id) + COUNT(marketplace_orders.id) * 5) DESC');
      } else {
        query = query.orderBy('marketplace_listings.id', 'desc');
      }
      
      return query.limit(limit);
    } catch (error) {
      console.error('Error getting popular items stats:', error);
      return [];
    }
  }

  /**
   * Get order details by ID
   * @param orderId Order ID
   */
  async getOrderById(orderId: number): Promise<any> {
    try {
      // Check if the tables exist
      const ordersTableExists = await db.schema.hasTable('marketplace_orders');
      const listingsTableExists = await db.schema.hasTable('marketplace_listings');
      
      if (!ordersTableExists || !listingsTableExists) {
        return null;
      }
      
      return db('marketplace_orders')
        .where('marketplace_orders.id', orderId)
        .join('marketplace_listings', 'marketplace_orders.listing_id', 'marketplace_listings.id')
        .join('users as buyer', 'marketplace_orders.buyer_id', 'buyer.id')
        .join('users as seller', 'marketplace_listings.seller_id', 'seller.id')
        .select(
          'marketplace_orders.*',
          'marketplace_listings.title',
          'marketplace_listings.price',
          'marketplace_listings.item_type',
          'marketplace_listings.item_id',
          'buyer.first_name as buyer_first_name',
          'buyer.last_name as buyer_last_name',
          'seller.first_name as seller_first_name',
          'seller.last_name as seller_last_name'
        )
        .first();
    } catch (error) {
      console.error('Error getting order by ID:', error);
      return null;
    }
  }

  /**
   * Get orders with pagination
   * @param page Page number
   * @param limit Items per page
   * @param filters Optional filters
   */
  async getOrders(page: number = 1, limit: number = 20, filters: any = {}): Promise<{ orders: any[], total: number }> {
    try {
      // Check if the tables exist
      const ordersTableExists = await db.schema.hasTable('marketplace_orders');
      const listingsTableExists = await db.schema.hasTable('marketplace_listings');
      
      if (!ordersTableExists || !listingsTableExists) {
        return { orders: [], total: 0 };
      }
      
      const offset = (page - 1) * limit;
      
      // Build query with filters
      let query = db('marketplace_orders')
        .join('marketplace_listings', 'marketplace_orders.listing_id', 'marketplace_listings.id')
        .join('users as buyer', 'marketplace_orders.buyer_id', 'buyer.id')
        .join('users as seller', 'marketplace_listings.seller_id', 'seller.id')
        .select(
          'marketplace_orders.*',
          'marketplace_listings.title',
          'marketplace_listings.price',
          'marketplace_listings.item_type',
          'marketplace_listings.item_id',
          'buyer.first_name as buyer_first_name',
          'buyer.last_name as buyer_last_name',
          'seller.first_name as seller_first_name',
          'seller.last_name as seller_last_name'
        )
        .orderBy('marketplace_orders.created_at', 'desc');
      
      // Apply filters if provided
      if (filters.status) {
        query = query.where('marketplace_orders.status', filters.status);
      }
      
      if (filters.buyerId) {
        query = query.where('marketplace_orders.buyer_id', filters.buyerId);
      }
      
      if (filters.sellerId) {
        query = query.where('marketplace_listings.seller_id', filters.sellerId);
      }
      
      // Get total count (for pagination)
      const countQuery = query.clone();
      const totalResult = await countQuery.count('marketplace_orders.id as count').first();
      const total = totalResult?.count ? Number(totalResult.count) : 0;
      
      // Get paginated results
      const orders = await query.limit(limit).offset(offset);
      
      return {
        orders,
        total
      };
    } catch (error) {
      console.error('Error getting orders:', error);
      return { orders: [], total: 0 };
    }
  }
}

export default new MarketplaceService();