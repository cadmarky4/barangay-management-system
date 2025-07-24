// ============================================================================
// services/residents/residents.service.ts - Residents service implementation
// ============================================================================

import { z } from 'zod';

import { BaseApiService } from '@/services/__shared/api';
import { 
  ResidentSchema,
  ResidentParamsSchema,
  ResidentStatisticsSchema,
  AgeGroupStatisticsSchema,
  SpecialListResponseSchema,
  type Resident,
  type ResidentParams,
  type ResidentStatistics,
  type AgeGroupStatistics,
  ResidentFormDataSchema, 
  type ResidentFormData 
} from '@/services/residents/residents.types';

import { 
  ApiResponseSchema, 
  PaginatedResponseSchema, 
  type PaginatedResponse 
} from '@/services/__shared/types';
import { apiClient } from '@/services/__shared/client';

export class ResidentsService extends BaseApiService {
  /**
   * Get paginated list of residents
   */
  async getResidents(params: ResidentParams = {}): Promise<PaginatedResponse<Resident>> {
    // Validate input parameters
    const validatedParams = ResidentParamsSchema.parse(params);
    
    // Build query string
    const searchParams = new URLSearchParams();
    Object.entries(validatedParams).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const paginatedSchema = PaginatedResponseSchema(ResidentSchema);
    
    return this.request(
      `/residents?${searchParams.toString()}`,
      paginatedSchema,
      { method: 'GET' }
    );
  }

  /**
   * Get single resident by ID
   */
  async getResident(id: string): Promise<Resident> {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid resident ID: ID must be a non-empty string');
    }

    const responseSchema = ApiResponseSchema(ResidentSchema);
    
    const response = await this.request(
      `/residents/${id}`,
      responseSchema,
      { method: 'GET' }
    );

    if (!response.data) {
      throw new Error('Resident not found');
    }

    return response.data;
  }

  /**
   * Create new resident
   */
  async createResident(residentData: ResidentFormData): Promise<Resident> {
    // Validate input data
    const validatedData = ResidentFormDataSchema.parse(residentData);
    
    const responseSchema = ApiResponseSchema(ResidentSchema);
    
    const response = await this.request(
      '/residents',
      responseSchema,
      {
        method: 'POST',
        data: validatedData,
      }
    );

    if (!response.data) {
      throw new Error('Failed to create resident');
    }

    return response.data;
  }

  /**
   * Update existing resident
   */
  async updateResident(id: string, residentData: ResidentFormData): Promise<Resident> {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid resident ID: ID must be a non-empty string');
    }

    // Validate input data
    const validatedData = ResidentFormDataSchema.parse(residentData);
    
    const responseSchema = ApiResponseSchema(ResidentSchema);
    
    const response = await this.request(
      `/residents/${id}`,
      responseSchema,
      {
        method: 'PUT',
        data: validatedData,
      }
    );

    if (!response.data) {
      throw new Error('Failed to update resident');
    }

    return response.data;
  }

  /**
   * Delete resident
   */
  async deleteResident(id: string): Promise<void> {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid resident ID: ID must be a non-empty string');
    }

    const responseSchema = ApiResponseSchema(z.any());
    
    await this.request(
      `/residents/${id}`,
      responseSchema,
      { method: 'DELETE' }
    );
  }

  /**
   * Get resident statistics
   */
  async getStatistics(): Promise<ResidentStatistics> {
    const responseSchema = ApiResponseSchema(ResidentStatisticsSchema);
    
    const response = await this.request(
      '/residents/statistics',
      responseSchema,
      { method: 'GET' }
    );

    if (!response.data) {
      throw new Error('Failed to get statistics');
    }

    return response.data;
  }

  /**
   * Get age group statistics
   */
  async getAgeGroupStatistics(): Promise<AgeGroupStatistics> {
    const responseSchema = ApiResponseSchema(AgeGroupStatisticsSchema);
    
    const response = await this.request(
      '/residents/age-groups',
      responseSchema,
      { method: 'GET' }
    );

    if (!response.data) {
      throw new Error('Failed to get age group statistics');
    }

    return response.data;
  }

  /**
   * Search residents by name
   */
  async searchResidents(searchTerm: string, limit = 10): Promise<Resident[]> {
    if (!searchTerm.trim()) {
      return [];
    }

    const paginatedSchema = PaginatedResponseSchema(ResidentSchema);
    
    const response = await this.request(
      `/residents?search=${encodeURIComponent(searchTerm)}&per_page=${limit}`,
      paginatedSchema,
      { method: 'GET' }
    );

    return response.data;
  }

  /**
   * Check for duplicate residents
   */
  async checkDuplicate(firstName: string, lastName: string, birthDate: string): Promise<Resident[]> {
    if (!firstName.trim() || !lastName.trim() || !birthDate) {
      throw new Error('First name, last name, and birth date are required');
    }

    const searchTerm = `${firstName} ${lastName}`;
    const residents = await this.searchResidents(searchTerm, 10);

    // Filter by exact match on birth date
    return residents.filter((resident) => {
      const residentBirthDate = new Date(resident.birth_date).toISOString().split('T')[0];
      const searchBirthDate = new Date(birthDate).toISOString().split('T')[0];

      return (
        resident.first_name.toLowerCase() === firstName.toLowerCase() &&
        resident.last_name.toLowerCase() === lastName.toLowerCase() &&
        residentBirthDate === searchBirthDate
      );
    });
  }

  /**
   * Get residents by household
   */
  async getResidentsByHousehold(householdId: number): Promise<Resident[]> {
    if (!householdId || householdId <= 0) {
      throw new Error('Invalid household ID');
    }

    const paginatedSchema = PaginatedResponseSchema(ResidentSchema);
    
    const response = await this.request(
      `/residents?household_id=${householdId}`,
      paginatedSchema,
      { method: 'GET' }
    );

    return response.data;
  }

  /**
   * Get residents by purok
   */
  async getResidentsByPurok(purok: string): Promise<Resident[]> {
    if (!purok.trim()) {
      throw new Error('Purok is required');
    }

    const paginatedSchema = PaginatedResponseSchema(ResidentSchema);
    
    const response = await this.request(
      `/residents?purok=${encodeURIComponent(purok)}`,
      paginatedSchema,
      { method: 'GET' }
    );

    return response.data;
  }

  async getIndigenous(barangay?: string): Promise<Resident[]> {
    const params = barangay ? `?barangay=${encodeURIComponent(barangay)}` : '';
    const responseSchema = ApiResponseSchema(SpecialListResponseSchema);
    
    const response = await this.request(
      `/residents/indigenous${params}`,
      responseSchema,
      { method: 'GET' }
    );

    return response.data?.data || [];
  }

  /**
   * Upload profile photo
   */
  async uploadProfilePhoto(residentId: string, photo: File): Promise<Resident> {
    if (!residentId || typeof residentId !== 'string') {
      throw new Error('Invalid resident ID: ID must be a non-empty string');
    }

    if (!photo) {
      throw new Error('Photo file is required');
    }

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(photo.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (photo.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }

    const formData = new FormData();
    formData.append('photo', photo);

    const response = await apiClient.post(`/residents/${residentId}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds
    });

    const responseSchema = ApiResponseSchema(ResidentSchema);
    const validatedResponse = responseSchema.parse(response.data);

    if (!validatedResponse.data) {
      throw new Error('Failed to upload profile photo');
    }

    return validatedResponse.data;
  }

  // Special lists
  async getSeniorCitizens(purok?: string): Promise<Resident[]> {
    const params = purok ? `?purok=${encodeURIComponent(purok)}` : '';
    const responseSchema = ApiResponseSchema(SpecialListResponseSchema);
    
    const response = await this.request(
      `/residents/senior-citizens${params}`,
      responseSchema,
      { method: 'GET' }
    );

    return response.data?.data || [];
  }

  async getPWD(purok?: string): Promise<Resident[]> {
    const params = purok ? `?purok=${encodeURIComponent(purok)}` : '';
    const responseSchema = ApiResponseSchema(SpecialListResponseSchema);
    
    const response = await this.request(
      `/residents/pwd${params}`,
      responseSchema,
      { method: 'GET' }
    );

    return response.data?.data || [];
  }

  async getFourPs(purok?: string): Promise<Resident[]> {
    const params = purok ? `?purok=${encodeURIComponent(purok)}` : '';
    const responseSchema = ApiResponseSchema(SpecialListResponseSchema);
    
    const response = await this.request(
      `/residents/four-ps${params}`,
      responseSchema,
      { method: 'GET' }
    );

    return response.data?.data || [];
  }

  async getHouseholdHeads(purok?: string): Promise<Resident[]> {
    const params = purok ? `?purok=${encodeURIComponent(purok)}` : '';
    const responseSchema = ApiResponseSchema(SpecialListResponseSchema);
    
    const response = await this.request(
      `/residents/household-heads${params}`,
      responseSchema,
      { method: 'GET' }
    );

    return response.data?.data || [];
  }

  
}

// Create singleton instance
export const residentsService = new ResidentsService();