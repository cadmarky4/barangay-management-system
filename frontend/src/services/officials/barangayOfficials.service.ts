// ===========================================================================================
// services/officials/barangayOfficials.service.ts - Barangay officials service implementation
// ===========================================================================================

// External dependencies
import { z } from 'zod';

// Base service and shared types
import { BaseApiService } from '../__shared/api';
import { 
  ApiResponseSchema, 
  PaginatedResponseSchema,
  type PaginatedResponse 
} from '../__shared/types';

// Domain types and schemas
import type { 
  BarangayOfficial, 
  BarangayOfficialFormData, 
  BarangayOfficialParams,
  BarangayOfficialStatistics,
} from './barangayOfficials.types';
import { 
  BarangayOfficialFormDataSchema, 
  BarangayOfficialParamsSchema, 
  BarangayOfficialSchema, 
  BarangayOfficialStatisticsSchema 
} from './barangayOfficials.types';

export class BarangayOfficialsService extends BaseApiService {
  /**
   * Get all barangay officials with filters
   */
  async getBarangayOfficials(params: BarangayOfficialParams = {}): Promise<PaginatedResponse<BarangayOfficial>> {
    // Validate input parameters using schema (you'll need to create BarangayOfficialFiltersSchema)
    const validatedParams = BarangayOfficialParamsSchema.parse(params);
    
    // Build query string
    const searchParams = new URLSearchParams();
    Object.entries(validatedParams).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const paginatedSchema = PaginatedResponseSchema(BarangayOfficialSchema);
    
    return this.request(
      `/barangay-officials?${searchParams.toString()}`,
      paginatedSchema,
      { method: 'GET' }
    );
  }

  /**
   * Get a specific barangay official by ID
   */
  async getBarangayOfficial(id: string): Promise<BarangayOfficial> {
    if (!id) {
      throw new Error('Invalid barangay official ID');
    }

    const responseSchema = ApiResponseSchema(BarangayOfficialSchema);
    
    const response = await this.request(
      `/barangay-officials/${id}`,
      responseSchema,
      { method: 'GET' }
    );

    if (!response.data) {
      throw new Error('Barangay official not found');
    }

    return response.data;
  }

  /**
   * Create a new barangay official
   */
  async createBarangayOfficial(data: BarangayOfficialFormData): Promise<BarangayOfficial> {
    // Validate input data
    const validatedData = BarangayOfficialFormDataSchema.parse(data);

    const responseSchema = ApiResponseSchema(BarangayOfficialSchema);
    
    const response = await this.request(
      '/barangay-officials',
      responseSchema,
      {
        method: 'POST',
        data: validatedData,
      }
    );

    if (!response.data) {
      throw new Error('Failed to create barangay official');
    }

    return response.data;
  }

  /**
   * Update an existing barangay official
   */
  async updateBarangayOfficial(id: string, data: BarangayOfficialFormData): Promise<BarangayOfficial> {
    if (!id) {
      throw new Error('Invalid barangay official ID');
    }

    // Validate input data
    const validatedData = BarangayOfficialFormDataSchema.parse(data);
    
    const responseSchema = ApiResponseSchema(BarangayOfficialSchema);
    
    const response = await this.request(
      `/barangay-officials/${id}`,
      responseSchema,
      {
        method: 'PUT',
        data: validatedData,
      }
    );

    if (!response.data) {
      throw new Error('Failed to update barangay official');
    }

    return response.data;
  }

  /**
   * Delete a barangay official
   */

  async deleteBarangayOfficial(id: string): Promise<void> {
    if (!id) {
      throw new Error('Invalid barangay official ID');
    }

    const responseSchema = ApiResponseSchema(z.any());

    await this.request(
      `/barangay-officials/${id}`, 
      responseSchema,
      { method: 'DELETE', }
    );
  }

  /**
   * Get barangay officials statistics
   */
  async getStatistics(): Promise<BarangayOfficialStatistics> {
    const responseSchema = ApiResponseSchema(BarangayOfficialStatisticsSchema);
    
    const response = await this.request(
      '/barangay-officials/statistics',
      responseSchema,
      { method: 'GET' }
    );

    if (!response.data) {
      throw new Error('Failed to get statistics');
    }

    return response.data;
  }

  async searchBarangayOfficials(searchTerm: string, limit = 10): Promise<BarangayOfficial[]> {
    if (!searchTerm.trim()) return [];

    const paginatedSchema = PaginatedResponseSchema(BarangayOfficialSchema);

    const response = await this.request(
      `/barangay-officials?search=${encodeURIComponent(searchTerm)}&per_page=${limit}`,
      paginatedSchema,
      { method: 'GET' }
    );

    return response.data;
  }

//   // checks if a resident is already a registered barangay official
//   async isAlreadyOfficial(residentId: string): Promise<number> {
//     if (!residentId || typeof residentId !== 'string') {
//       throw new Error('Invalid resident ID: ID must be a non-empty string');
//     }

//     try {
//       const responseSchema = ApiResponseSchema(z.number());

//       const response = await this.request(
//         `/barangay-officials/check-duplicate`,
//         responseSchema,
//         { 
//           method: 'POST',
//           data: { residentId }
//         }
//       );

//       if (!response.data && response.data !== 0) {
//         throw new Error('Server returned invalid response format');
//       }

//       return response.data;
//     } catch (error) {
//       if (error instanceof Error) {
//         throw new Error(`Failed to check official status: ${error.message}`);
//       }
//       throw new Error('An unexpected error occurred while checking official status');
//     }
//   }
// }

  // checks if a resident is already a registered barangay official
  async isAlreadyOfficial(residentId: string): Promise<number> {
    if (!residentId || typeof residentId !== 'string') {
      throw new Error('Invalid resident ID: ID must be a non-empty string');
    }

    try {
      const responseSchema = ApiResponseSchema(z.number());

      const response = await this.request(
        `/barangay-officials/check-duplicate`,
        responseSchema,
        { 
          method: 'POST',
          data: { residentId }
        }
      );

      if (!response.data && response.data !== 0) {
        throw new Error('Server returned invalid response format');
      }

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to check official status: ${error.message}`);
      }
      throw new Error('An unexpected error occurred while checking official status');
    }
  }
}

// Create singleton instance
export const barangayOfficialsService = new BarangayOfficialsService();