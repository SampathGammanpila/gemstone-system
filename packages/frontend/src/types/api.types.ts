export interface ApiResponse {
    status: string;
    message?: string;
    data?: any;
    errors?: ApiError[];
  }
  
  export interface ApiError {
    field?: string;
    message: string;
  }
  
  export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }
  
  export interface ApiListResponse<T> extends ApiResponse {
    data: {
      [key: string]: T[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    };
  }
  
  export interface ApiDetailResponse<T> extends ApiResponse {
    data: {
      [key: string]: T;
    };
  }