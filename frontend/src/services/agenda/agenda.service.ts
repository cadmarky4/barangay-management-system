// ============================================================================
// services/agenda/agenda.service.ts - Agenda service implementation
// ============================================================================

import { z } from 'zod';

import { BaseApiService } from '@/services/__shared/api';
import {
  AgendaSchema,
  AgendaParamsSchema,
  AgendaStatisticsSchema,
  CalendarEventSchema,
  UpdateAgendaStatusSchema,
  type Agenda,
  type AgendaParams,
  type AgendaStatistics,
  type CalendarEvent,
  type UpdateAgendaStatus,
  AgendaFormDataSchema, 
  type AgendaFormData 
} from '@/services/agenda/agenda.types';

import { 
  ApiResponseSchema, 
  type PaginatedResponse 
} from '@/services/__shared/types';

export class AgendaService extends BaseApiService {
  /**
   * Get all agendas with pagination and filters
   */
  async getAgendas(params?: AgendaParams): Promise<PaginatedResponse<Agenda>> {
    const validatedParams = params ? AgendaParamsSchema.parse(params) : {};
    
    return this.requestPaginated(
      '/agendas',
      AgendaSchema,
      {
        method: 'GET',
        params: validatedParams
      }
    );
  }

  /**
   * Get a specific agenda by ID
   */
  async getAgenda(id: string): Promise<Agenda> {
    const response = await this.request(
      `/agendas/${id}`,
      ApiResponseSchema(AgendaSchema)
    );
    
    if (!response.data) {
      throw new Error('Agenda not found');
    }
    
    return response.data;
  }

  /**
   * Create a new agenda
   */
  async createAgenda(data: AgendaFormData): Promise<Agenda> {
    const validatedData = AgendaFormDataSchema.parse(data);
    
    const response = await this.request(
      '/agendas',
      ApiResponseSchema(AgendaSchema),
      {
        method: 'POST',
        data: validatedData
      }
    );
    
    if (!response.data) {
      throw new Error('Failed to create agenda');
    }
    
    return response.data;
  }

  /**
   * Update an existing agenda
   */
  async updateAgenda(id: string, data: Partial<AgendaFormData>): Promise<Agenda> {
    const response = await this.request(
      `/agendas/${id}`,
      ApiResponseSchema(AgendaSchema),
      {
        method: 'PUT',
        data
      }
    );
    
    if (!response.data) {
      throw new Error('Failed to update agenda');
    }
    
    return response.data;
  }

  /**
   * Update agenda status
   */
  async updateAgendaStatus(id: string, data: UpdateAgendaStatus): Promise<Agenda> {
    const validatedData = UpdateAgendaStatusSchema.parse(data);
    
    const response = await this.request(
      `/agendas/${id}/status`,
      ApiResponseSchema(AgendaSchema),
      {
        method: 'PATCH',
        data: validatedData
      }
    );
    
    if (!response.data) {
      throw new Error('Failed to update agenda status');
    }
    
    return response.data;
  }

  /**
   * Delete an agenda
   */
  async deleteAgenda(id: string): Promise<void> {
    await this.request(
      `/agendas/${id}`,
      ApiResponseSchema(z.null()),
      {
        method: 'DELETE'
      }
    );
  }

  /**
   * Get agenda statistics
   */
  async getStatistics(): Promise<AgendaStatistics> {
    const response = await this.request(
      '/agendas/statistics',
      ApiResponseSchema(AgendaStatisticsSchema)
    );
    
    if (!response.data) {
      throw new Error('Failed to fetch agenda statistics');
    }
    
    return response.data;
  }

  /**
   * Get agendas for calendar view (by month/year)
   */
  async getCalendarEvents(month?: number, year?: number): Promise<CalendarEvent[]> {
    const params: Record<string, number> = {};
    if (month) params.month = month;
    if (year) params.year = year;
    
    const response = await this.request(
      '/agendas/calendar',
      ApiResponseSchema(z.array(CalendarEventSchema)),
      {
        method: 'GET',
        params
      }
    );
    
    if (!response.data) {
      throw new Error('Failed to fetch calendar events');
    }
    
    return response.data;
  }

  /**
   * Get agendas by date range
   */
  async getAgendasByDateRange(dateFrom: string, dateTo: string): Promise<Agenda[]> {
    const response = await this.request(
      '/agendas/date-range',
      ApiResponseSchema(z.array(AgendaSchema)),
      {
        method: 'GET',
        params: {
          date_from: dateFrom,
          date_to: dateTo
        }
      }
    );
    
    if (!response.data) {
      throw new Error('Failed to fetch agendas by date range');
    }
    
    return response.data;
  }

  /**
   * Get today's agendas
   */
  async getTodaysAgendas(): Promise<Agenda[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getAgendasByDateRange(today, today);
  }

  /**
   * Get upcoming agendas
   */
  async getUpcomingAgendas(days: number = 7): Promise<Agenda[]> {
    const today = new Date();
    const futureDate = new Date(today.getTime() + (days * 24 * 60 * 60 * 1000));
    
    return this.getAgendasByDateRange(
      today.toISOString().split('T')[0],
      futureDate.toISOString().split('T')[0]
    );
  }

  /**
   * Search agendas
   */
  async searchAgendas(query: string): Promise<Agenda[]> {
    const response = await this.request(
      '/agendas/search',
      ApiResponseSchema(z.array(AgendaSchema)),
      {
        method: 'GET',
        params: { q: query }
      }
    );
    
    if (!response.data) {
      throw new Error('Failed to search agendas');
    }
    
    return response.data;
  }

  /**
   * Duplicate an agenda
   */
  async duplicateAgenda(id: string, newDate?: string): Promise<Agenda> {
    const data: Record<string, string> = {};
    if (newDate) data.date = newDate;
    
    const response = await this.request(
      `/agendas/${id}/duplicate`,
      ApiResponseSchema(AgendaSchema),
      {
        method: 'POST',
        data
      }
    );
    
    if (!response.data) {
      throw new Error('Failed to duplicate agenda');
    }
    
    return response.data;
  }

  /**
   * Export agendas
   */
  async exportAgendas(params?: AgendaParams): Promise<Blob> {
    const validatedParams = params ? AgendaParamsSchema.parse(params) : {};
    
    const response = await this.request(
      '/agendas/export',
      z.instanceof(Blob),
      {
        method: 'GET',
        params: validatedParams,
        responseType: 'blob'
      }
    );
    
    return response;
  }
}

// Create singleton instance
export const agendaService = new AgendaService();
