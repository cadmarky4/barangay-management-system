import { BaseApiService } from '../__shared/api';
import { type ApiResponse, ApiResponseSchema } from '../__shared/types';
import { z } from 'zod';
import {
  type StatisticsOverview,
  type AgeGroupDistribution,
  type SpecialPopulationRegistry,
  type MonthlyRevenue,
  type PopulationDistributionByStreet,
  type DocumentTypesIssued,
  type MostRequestedService,
  type FilterOptions,
  type ReportsFilters,
} from './reports.types';

export class ReportsService extends BaseApiService {
  /**
   * Get statistics overview data
   */
  async getStatisticsOverview(filters?: ReportsFilters): Promise<ApiResponse<StatisticsOverview>> {
    const params = new URLSearchParams();
    if (filters?.year) params.append('year', filters.year.toString());
    if (filters?.quarter) params.append('quarter', filters.quarter);

    const queryString = params.toString();
    const endpoint = `/reports/statistics${queryString ? `?${queryString}` : ''}`;
    
    const schema = ApiResponseSchema(z.any());
    return await this.request(endpoint, schema);
  }

  /**
   * Get age group distribution data
   */
  async getAgeGroupDistribution(_filters?: ReportsFilters): Promise<ApiResponse<AgeGroupDistribution[]>> {
    const params = new URLSearchParams();

    const queryString = params.toString();
    const endpoint = `/reports/age-group-distribution${queryString ? `?${queryString}` : ''}`;
    
    const schema = ApiResponseSchema(z.array(z.any()));
    return await this.request(endpoint, schema);
  }

  /**
   * Get special population registry data
   */
  async getSpecialPopulationRegistry(_filters?: ReportsFilters): Promise<ApiResponse<SpecialPopulationRegistry[]>> {
    const params = new URLSearchParams();

    const queryString = params.toString();
    const endpoint = `/reports/special-population-registry${queryString ? `?${queryString}` : ''}`;
    
    const schema = ApiResponseSchema(z.array(z.any()));
    return await this.request(endpoint, schema);
  }

  /**
   * Get monthly revenue data
   */
  async getMonthlyRevenue(filters?: ReportsFilters): Promise<ApiResponse<MonthlyRevenue[]>> {
    const params = new URLSearchParams();
    if (filters?.year) params.append('year', filters.year.toString());

    const queryString = params.toString();
    const endpoint = `/reports/monthly-revenue${queryString ? `?${queryString}` : ''}`;
    
    const schema = ApiResponseSchema(z.array(z.any()));
    return await this.request(endpoint, schema);
  }

  /**
   * Get population distribution by street data
   */
  async getPopulationDistributionByStreet(filters?: ReportsFilters): Promise<ApiResponse<PopulationDistributionByStreet[]>> {
    const params = new URLSearchParams();
    if (filters?.year) params.append('year', filters.year.toString());

    const queryString = params.toString();
    const endpoint = `/reports/population-distribution-by-street${queryString ? `?${queryString}` : ''}`;
    
    const schema = ApiResponseSchema(z.array(z.any()));
    return await this.request(endpoint, schema);
  }

  /**
   * Get document types issued data
   */
  async getDocumentTypesIssued(filters?: ReportsFilters): Promise<ApiResponse<DocumentTypesIssued[]>> {
    const params = new URLSearchParams();
    if (filters?.year) params.append('year', filters.year.toString());
    if (filters?.quarter) params.append('quarter', filters.quarter);

    const queryString = params.toString();
    const endpoint = `/reports/document-types-issued${queryString ? `?${queryString}` : ''}`;
    
    const schema = ApiResponseSchema(z.array(z.any()));
    return await this.request(endpoint, schema);
  }

  /**
   * Get most requested services data
   */
  async getMostRequestedServices(filters?: ReportsFilters): Promise<ApiResponse<MostRequestedService[]>> {
    const params = new URLSearchParams();
    if (filters?.year) params.append('year', filters.year.toString());
    if (filters?.quarter) params.append('quarter', filters.quarter);

    const queryString = params.toString();
    const endpoint = `/reports/most-requested-services${queryString ? `?${queryString}` : ''}`;
    
    const schema = ApiResponseSchema(z.array(z.any()));
    return await this.request(endpoint, schema);
  }

  /**
   * Get filter options (years, quarters, streets)
   */
  async getFilterOptions(): Promise<ApiResponse<FilterOptions>> {
    const schema = ApiResponseSchema(z.any());
    return await this.request('/reports/filter-options', schema);
  }

  /**
   * Export report data (placeholder for future implementation)
   */
  async exportReport(filters?: ReportsFilters): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters?.year) params.append('year', filters.year.toString());
    if (filters?.quarter) params.append('quarter', filters.quarter);
    if (filters?.street) params.append('street', filters.street);

    const queryString = params.toString();
    const endpoint = `/reports/export${queryString ? `?${queryString}` : ''}`;
    
    // Use the API client baseURL configuration
    const response = await fetch(`${window.location.protocol}//${window.location.hostname}:8000/api${endpoint}`, {
      headers: {
        'Accept': 'application/octet-stream',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export report');
    }

    return await response.blob();
  }
}

// Create singleton instance
export const reportsService = new ReportsService();
