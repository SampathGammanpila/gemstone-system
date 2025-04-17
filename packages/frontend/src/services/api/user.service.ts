import { get, put, post, patch } from './api.service';
import { ApiResponse } from '@types/api.types';
import { UserType } from '@types/user.types';

interface GetUserResponse extends ApiResponse {
  data: {
    user: UserType;
  };
}

interface GetUsersResponse extends ApiResponse {
  data: {
    users: UserType[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export const userService = {
  /**
   * Get current user profile
   * @returns Promise with user data
   */
  getProfile: () => {
    return get<GetUserResponse>('/users/profile');
  },

  /**
   * Update user profile
   * @param userData - User data to update
   * @returns Promise with updated user data
   */
  updateProfile: (userData: Partial<UserType>) => {
    return put<GetUserResponse>('/users/profile', userData);
  },

  /**
   * Upload profile image
   * @param formData - Form data with image file
   * @returns Promise with updated user data
   */
  uploadProfileImage: (formData: FormData) => {
    return post<ApiResponse>('/users/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Get user by ID (admin only)
   * @param userId - User ID
   * @returns Promise with user data
   */
  getUserById: (userId: string) => {
    return get<GetUserResponse>(`/users/${userId}`);
  },

  /**
   * Get all users (admin only)
   * @param page - Page number
   * @param limit - Users per page
   * @param sort - Sort field
   * @param order - Sort direction
   * @param filter - Filter parameters
   * @returns Promise with users and pagination
   */
  getAllUsers: (
    page: number = 1,
    limit: number = 10,
    sort: string = 'created_at',
    order: 'asc' | 'desc' = 'desc',
    filter: Record<string, any> = {}
  ) => {
    const params = {
      page: page.toString(),
      limit: limit.toString(),
      sort,
      order,
      ...filter,
    };

    return get<GetUsersResponse>('/users', { params });
  },

  /**
   * Create new user (admin only)
   * @param userData - User data to create
   * @returns Promise with created user
   */
  createUser: (userData: Partial<UserType>) => {
    return post<GetUserResponse>('/users', userData);
  },

  /**
   * Update user (admin only)
   * @param userId - User ID
   * @param userData - User data to update
   * @returns Promise with updated user
   */
  updateUser: (userId: string, userData: Partial<UserType>) => {
    return put<GetUserResponse>(`/users/${userId}`, userData);
  },

  /**
   * Delete user (admin only)
   * @param userId - User ID
   * @returns Promise with success status
   */
  deleteUser: (userId: string) => {
    return patch<ApiResponse>(`/users/${userId}/delete`);
  },

  /**
   * Set user active status (admin only)
   * @param userId - User ID
   * @param isActive - Active status
   * @returns Promise with updated status
   */
  setUserActiveStatus: (userId: string, isActive: boolean) => {
    return patch<ApiResponse>(`/users/${userId}/active`, { is_active: isActive });
  },
};