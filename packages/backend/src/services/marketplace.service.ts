import { db } from '../db';

class MarketplaceService {
  /**
   * Get total count of orders
   */
  async getTotalOrdersCount(): Promise<number> {
    const result = await db('marketplace_orders').count('id as count').first();
    return result?.count ? Number(result.count) : 0;
  }

  /**
   * Get popular items statistics
   * @param limit Number of top items to retrieve
   */
  async getPopularItemsStats(limit: number = 5): Promise<any[]> {
    // This query gets the most viewed or purchased items
    return db('marketplace_listings')
      .select(
        'marketplace_listings.id',
        'marketplace_listings.title',
        'marketplace_listings.price',
        'marketplace_listings.item_type',
        'marketplace_listings.item_id',
        db.raw('COUNT(marketplace_views.id) as view_count'),
        db.raw('COUNT(marketplace_orders.id) as order_count')
      )
      .leftJoin('marketplace_views', 'marketplace_listings.id', 'marketplace_views.listing_id')
      .leftJoin('marketplace_orders', 'marketplace_listings.id', 'marketplace_orders.listing_id')
      .groupBy('marketplace_listings.id')
      .orderByRaw('(COUNT(marketplace_views.id) + COUNT(marketplace_orders.id) * 5) DESC')
      .limit(limit);
  }

  /**
   * Get order details by ID
   * @param orderId Order ID
   */
  async getOrderById(orderId: number): Promise<any> {
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
  }

  /**
   * Get orders with pagination
   * @param page Page number
   * @param limit Items per page
   * @param filters Optional filters
   */
  async getOrders(page: number = 1, limit: number = 20, filters: any = {}): Promise<{ orders: any[], total: number }> {
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
  }
}

export default new MarketplaceService();