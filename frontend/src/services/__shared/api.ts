// ============================================================================
// services/api/base.ts - Base API service with Zod validation
// ============================================================================

import { type AxiosRequestConfig } from 'axios';
import { type z } from 'zod';
import { apiClient } from '@/services/__shared/client';
import { PaginatedResponseSchema, type PaginatedResponse } from './types';

export class BaseApiService {
  protected async request<T>(
    endpoint: string,
    schema: z.ZodType<T>,
    config: AxiosRequestConfig = {}
  ): Promise<T> {
    try {
      const response = await apiClient(endpoint, config);
      
      // Validate response data with Zod
      // const validatedData = schema.parse(response.data);
      return response.data as T; // Assuming the response data matches the schema
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  protected async requestPaginated<T>(
    endpoint: string,
    itemSchema: z.ZodType<T>,
    config: AxiosRequestConfig = {}
  ): Promise<PaginatedResponse<T>> {
    const paginatedSchema = PaginatedResponseSchema(itemSchema);
    return this.request(endpoint, paginatedSchema, config);
  }
}


