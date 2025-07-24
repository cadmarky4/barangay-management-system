// ============================================================================
// services/households/households.service.ts - Households service implementation
// ============================================================================

import { z } from 'zod';

import { BaseApiService } from '@/services/__shared/api';
import { 
  HouseholdSchema,
  HouseholdParamsSchema,
  HouseholdStatisticsSchema,
  SpecialListResponseSchema,
  type Household,
  type HouseholdParams,
  type HouseholdStatistics,
  HouseholdFormDataSchema, 
  type HouseholdFormData 
} from '@/services/households/households.types';

import { 
  ApiResponseSchema, 
  PaginatedResponseSchema, 
  type PaginatedResponse 
} from '@/services/__shared/types';

export class HouseholdsService extends BaseApiService {
  /**
   * Get paginated list of households
   */
  async getHouseholds(params: HouseholdParams = {}): Promise<PaginatedResponse<Household>> {
    // Validate input parameters
    const validatedParams = HouseholdParamsSchema.parse(params);
    
    // Build query string
    const searchParams = new URLSearchParams();
    Object.entries(validatedParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const paginatedSchema = PaginatedResponseSchema(HouseholdSchema);
    
    return this.request(
      `/households?${searchParams.toString()}`,
      paginatedSchema,
      { method: 'GET' }
    );
  }

  /**
   * Get single household by ID
   */
  async getHousehold(id: string): Promise<Household> {
    if (!id || !id.trim()) {
      throw new Error('Invalid household ID');
    }

    const responseSchema = ApiResponseSchema(HouseholdSchema);
    
    const response = await this.request(
      `/households/${id}`,
      responseSchema,
      { method: 'GET' }
    );

    if (!response.data) {
      throw new Error('Household not found');
    }

    return response.data;
  }

  /**
   * Create new household
   */
  async createHousehold(householdData: HouseholdFormData): Promise<Household> {
    // Validate input data
    const validatedData = HouseholdFormDataSchema.parse(householdData);
    
    const responseSchema = ApiResponseSchema(HouseholdSchema);
    
    const response = await this.request(
      '/households',
      responseSchema,
      {
        method: 'POST',
        data: validatedData,
      }
    );

    if (!response.data) {
      throw new Error('Failed to create household');
    }

    return response.data;
  }

  /**
   * Update existing household
   */
  async updateHousehold(id: string, householdData: HouseholdFormData): Promise<Household> {
    if (!id || !id.trim()) {
      throw new Error('Invalid household ID');
    }

    // Validate input data
    const validatedData = HouseholdFormDataSchema.parse(householdData);
    
    const responseSchema = ApiResponseSchema(HouseholdSchema);
    
    const response = await this.request(
      `/households/${id}`,
      responseSchema,
      {
        method: 'PUT',
        data: validatedData,
      }
    );

    if (!response.data) {
      throw new Error('Failed to update household');
    }

    return response.data;
  }

  /**
   * Delete household
   */
  async deleteHousehold(id: string): Promise<void> {
    if (!id || !id.trim()) {
      throw new Error('Invalid household ID');
    }

    const responseSchema = ApiResponseSchema(z.any());
    
    await this.request(
      `/households/${id}`,
      responseSchema,
      { method: 'DELETE' }
    );
  }

  /**
   * Get household statistics
   */
  async getStatistics(): Promise<HouseholdStatistics> {
    const responseSchema = ApiResponseSchema(HouseholdStatisticsSchema);
    
    const response = await this.request(
      '/households/statistics',
      responseSchema,
      { method: 'GET' }
    );

    if (!response.data) {
      throw new Error('Failed to get statistics');
    }

    return response.data;
  }

  /**
   * Search households by household number or head name
   */
  async searchHouseholds(searchTerm: string, limit = 10): Promise<Household[]> {
    if (!searchTerm.trim()) {
      return [];
    }

    const paginatedSchema = PaginatedResponseSchema(HouseholdSchema);
    
    const response = await this.request(
      `/households?search=${encodeURIComponent(searchTerm)}&per_page=${limit}`,
      paginatedSchema,
      { method: 'GET' }
    );

    return response.data;
  }

  /**
   * Check for duplicate households by address and head
   */
  async checkDuplicate(completeAddress: string, headResidentId?: string): Promise<Household[]> {
    if (!completeAddress.trim()) {
      throw new Error('Complete address is required');
    }

    // Search by address first
    const households = await this.searchHouseholds(completeAddress, 10);

    // Filter by exact match on address and head (if provided)
    return households.filter((household) => {
      const addressMatch = household.complete_address.toLowerCase().trim() === 
                          completeAddress.toLowerCase().trim();
      
      if (!headResidentId) {
        return addressMatch;
      }
      
      return addressMatch && String(household.head_resident_id ?? '') === String(headResidentId);
    });
  }

  /**
   * Get households by barangay
   */
  async getHouseholdsByBarangay(barangay: string): Promise<Household[]> {
    if (!barangay.trim()) {
      throw new Error('Barangay is required');
    }

    const paginatedSchema = PaginatedResponseSchema(HouseholdSchema);
    
    const response = await this.request(
      `/households?barangay=${encodeURIComponent(barangay)}`,
      paginatedSchema,
      { method: 'GET' }
    );

    return response.data;
  }

  /**
   * Get households by head resident
   */
  async getHouseholdsByHead(headResidentId: string): Promise<Household[]> {
    if (!headResidentId || !headResidentId.trim()) {
      throw new Error('Invalid head resident ID');
    }

    const paginatedSchema = PaginatedResponseSchema(HouseholdSchema);
    
    const response = await this.request(
      `/households?head_resident_id=${headResidentId}`,
      paginatedSchema,
      { method: 'GET' }
    );

    return response.data;
  }

  // Special lists
  async getFourPsHouseholds(barangay?: string): Promise<Household[]> {
    const params = barangay ? `?barangay=${encodeURIComponent(barangay)}` : '';
    const responseSchema = ApiResponseSchema(SpecialListResponseSchema);
    
    const response = await this.request(
      `/households/four-ps${params}`,
      responseSchema,
      { method: 'GET' }
    );

    return response.data?.data || [];
  }

  async getHouseholdsWithSeniorCitizens(barangay?: string): Promise<Household[]> {
    const params = barangay ? `?barangay=${encodeURIComponent(barangay)}` : '';
    const responseSchema = ApiResponseSchema(SpecialListResponseSchema);
    
    const response = await this.request(
      `/households/with-senior-citizens${params}`,
      responseSchema,
      { method: 'GET' }
    );

    return response.data?.data || [];
  }

  async getHouseholdsWithPWD(barangay?: string): Promise<Household[]> {
    const params = barangay ? `?barangay=${encodeURIComponent(barangay)}` : '';
    const responseSchema = ApiResponseSchema(SpecialListResponseSchema);
    
    const response = await this.request(
      `/households/with-pwd${params}`,
      responseSchema,
      { method: 'GET' }
    );

    return response.data?.data || [];
  }

  async getHouseholdsByType(householdType: string, barangay?: string): Promise<Household[]> {
    let params = `?household_type=${encodeURIComponent(householdType)}`;
    if (barangay) {
      params += `&barangay=${encodeURIComponent(barangay)}`;
    }
    
    const responseSchema = ApiResponseSchema(SpecialListResponseSchema);
    
    const response = await this.request(
      `/households/by-type${params}`,
      responseSchema,
      { method: 'GET' }
    );

    return response.data?.data || [];
  }

  async getHouseholdsByOwnership(ownershipStatus: string, barangay?: string): Promise<Household[]> {
    let params = `?ownership_status=${encodeURIComponent(ownershipStatus)}`;
    if (barangay) {
      params += `&barangay=${encodeURIComponent(barangay)}`;
    }
    
    const responseSchema = ApiResponseSchema(SpecialListResponseSchema);
    
    const response = await this.request(
      `/households/by-ownership${params}`,
      responseSchema,
      { method: 'GET' }
    );

    return response.data?.data || [];
  }
}

export const householdsService = new HouseholdsService();