import { get, post, put, patch, del } from './api.service';
import { ApiResponse } from '@types/api.types';
import { GemstoneType } from '@types/gemstone.types';

interface GetGemstoneResponse extends ApiResponse {
  data: {
    gemstone: GemstoneType;
  };
}

interface GetGemstonesResponse extends ApiResponse {
  data: {
    gemstones: GemstoneType[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export const gemstoneService = {
  /**
   * Get all gemstones with filtering
   * @param page - Page number
   * @param limit - Gemstones per page
   * @param filters - Filter parameters
   * @returns Promise with gemstones and pagination
   */
  getGemstones: (
    page: number = 1,
    limit: number = 10,
    filters: Record<string, any> = {}
  ) => {
    const params = {
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    };

    return get<GetGemstonesResponse>('/gemstones', { params });
  },

  /**
   * Get gemstone by ID
   * @param id - Gemstone ID
   * @returns Promise with gemstone data
   */
  getGemstoneById: (id: string) => {
    return get<GetGemstoneResponse>(`/gemstones/${id}`);
  },

  /**
   * Get gemstone by unique ID
   * @param uniqueId - Gemstone unique ID
   * @returns Promise with gemstone data
   */
  getGemstoneByUniqueId: (uniqueId: string) => {
    return get<GetGemstoneResponse>(`/gemstones/unique/${uniqueId}`);
  },

  /**
   * Create new gemstone
   * @param gemstoneData - Gemstone data
   * @returns Promise with created gemstone
   */
  createGemstone: (gemstoneData: Partial<GemstoneType>) => {
    return post<GetGemstoneResponse>('/gemstones', gemstoneData);
  },

  /**
   * Update gemstone
   * @param id - Gemstone ID
   * @param gemstoneData - Gemstone data to update
   * @returns Promise with updated gemstone
   */
  updateGemstone: (id: string, gemstoneData: Partial<GemstoneType>) => {
    return put<GetGemstoneResponse>(`/gemstones/${id}`, gemstoneData);
  },

  /**
   * Delete gemstone
   * @param id - Gemstone ID
   * @returns Promise with success status
   */
  deleteGemstone: (id: string) => {
    return del<ApiResponse>(`/gemstones/${id}`);
  },

  /**
   * Upload gemstone images
   * @param id - Gemstone ID
   * @param formData - Form data with image files
   * @returns Promise with updated gemstone
   */
  uploadGemstoneImages: (id: string, formData: FormData) => {
    return post<GetGemstoneResponse>(`/gemstones/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Delete gemstone image
   * @param gemstoneId - Gemstone ID
   * @param imageId - Image ID
   * @returns Promise with success status
   */
  deleteGemstoneImage: (gemstoneId: string, imageId: string) => {
    return del<ApiResponse>(`/gemstones/${gemstoneId}/images/${imageId}`);
  },

  /**
   * Get user's gemstone drafts
   * @returns Promise with draft gemstones
   */
  getGemstonesDrafts: () => {
    return get<GetGemstonesResponse>('/gemstones/drafts');
  },

  /**
   * Save gemstone as draft
   * @param draftData - Draft gemstone data
   * @returns Promise with saved draft
   */
  saveGemstoneAsDraft: (draftData: Partial<GemstoneType>) => {
    return post<ApiResponse>('/gemstones/drafts', draftData);
  },

  /**
   * Update gemstone draft
   * @param draftId - Draft ID
   * @param draftData - Draft gemstone data to update
   * @returns Promise with updated draft
   */
  updateGemstonesDraft: (draftId: string, draftData: Partial<GemstoneType>) => {
    return put<ApiResponse>(`/gemstones/drafts/${draftId}`, draftData);
  },

  /**
   * Convert draft to gemstone
   * @param draftId - Draft ID
   * @param additionalData - Additional gemstone data
   * @returns Promise with created gemstone
   */
  convertDraftToGemstone: (draftId: string, additionalData: Partial<GemstoneType> = {}) => {
    return post<GetGemstoneResponse>(`/gemstones/drafts/${draftId}/convert`, additionalData);
  },

  /**
   * Delete gemstone draft
   * @param draftId - Draft ID
   * @returns Promise with success status
   */
  deleteGemstonesDraft: (draftId: string) => {
    return del<ApiResponse>(`/gemstones/drafts/${draftId}`);
  },

  /**
   * Get user's gemstones
   * @param page - Page number
   * @param limit - Gemstones per page
   * @returns Promise with user's gemstones
   */
  getUserGemstones: (page: number = 1, limit: number = 10) => {
    return get<GetGemstonesResponse>('/gemstones/user', {
      params: { page, limit },
    });
  },

  /**
   * Publish gemstone to marketplace
   * @param gemstoneId - Gemstone ID
   * @param marketplaceData - Marketplace listing data
   * @returns Promise with published gemstone
   */
  publishGemstone: (gemstoneId: string, marketplaceData: any) => {
    return post<ApiResponse>(`/gemstones/${gemstoneId}/publish`, marketplaceData);
  },

  /**
   * Unpublish gemstone from marketplace
   * @param gemstoneId - Gemstone ID
   * @returns Promise with unpublished gemstone
   */
  unpublishGemstone: (gemstoneId: string) => {
    return post<ApiResponse>(`/gemstones/${gemstoneId}/unpublish`);
  },

  /**
   * Generate certificate for gemstone
   * @param gemstoneId - Gemstone ID
   * @returns Promise with certificate data
   */
  generateCertificate: (gemstoneId: string) => {
    return post<ApiResponse>(`/gemstones/${gemstoneId}/certificate`);
  },

  /**
   * Transfer gemstone ownership
   * @param gemstoneId - Gemstone ID
   * @param transferData - Transfer data
   * @returns Promise with transfer result
   */
  transferGemstone: (gemstoneId: string, transferData: { recipient_id: string; notes?: string }) => {
    return post<ApiResponse>(`/gemstones/${gemstoneId}/transfer`, transferData);
  },

  /**
   * Get gemstone ownership history
   * @param gemstoneId - Gemstone ID
   * @returns Promise with ownership history
   */
  getGemstoneOwnershipHistory: (gemstoneId: string) => {
    return get<ApiResponse>(`/gemstones/${gemstoneId}/history`);
  },

  /**
   * Get similar gemstones
   * @param gemstoneId - Gemstone ID
   * @param limit - Number of similar gemstones to get
   * @returns Promise with similar gemstones
   */
  getSimilarGemstones: (gemstoneId: string, limit: number = 5) => {
    return get<GetGemstonesResponse>(`/gemstones/${gemstoneId}/similar`, {
      params: { limit },
    });
  },
  
  /**
   * Search gemstones
   * @param query - Search query
   * @param page - Page number
   * @param limit - Gemstones per page
   * @param filters - Additional filters
   * @returns Promise with search results
   */
  searchGemstones: (
    query: string,
    page: number = 1,
    limit: number = 10,
    filters: Record<string, any> = {}
  ) => {
    const params = {
      q: query,
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    };

    return get<GetGemstonesResponse>('/gemstones/search', { params });
  },
};