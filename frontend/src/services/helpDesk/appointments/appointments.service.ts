// services/api/appointments.service.ts
import { BaseApiService } from '@/services/__shared/api';
import { CreateAppointmentSchema, EditAppointmentSchema, ViewAppointmentSchema, type CheckScheduleAvailability, type CreateAppointment, type EditAppointment, type ViewAppointment } from './appointments.types';
import { ApiResponseSchema } from '@/services/__shared/types';
import { z } from 'zod';

export class AppointmentsService extends BaseApiService {
  async viewAppointment(id: string): Promise<ViewAppointment> {
    if (!id) {
      throw new Error('Invalid appointment ID!');
    }

    try {
      const responseSchema = ApiResponseSchema(ViewAppointmentSchema);
      const response = await this.request(
        `/appointments/view/${id}`,
        responseSchema,
        {
          method: 'GET'
        }
      );

      if (!response.data) {
        throw new Error('Failed to fetch appointment form data');
      }

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get appointment form: ${error.message}`);
      }
      throw new Error('An unexpected error occurred while fetching appointment form');
    }
  }

  async createAppointment(data: CreateAppointment): Promise<ViewAppointment> {
    // Validate input data
    const validatedData = CreateAppointmentSchema.parse(data);

    const responseSchema = ApiResponseSchema(ViewAppointmentSchema);
    
    const response = await this.request(
      '/appointments',
      responseSchema,
      {
        method: 'POST',
        data: validatedData,
      }
    );

    if (!response.data) {
      throw new Error('Failed to create appointment');
    }

    return response.data;
  }

  async updateAppointment(id: string, data: EditAppointment): Promise<ViewAppointment> {
    if (!id) {
      throw new Error('Invalid appointment ID');
    }

    // Validate input data
    const validatedData = EditAppointmentSchema.parse(data);
    
    const responseSchema = ApiResponseSchema(ViewAppointmentSchema);
    
    const response = await this.request(
      `/appointments/${id}`,
      responseSchema,
      {
        method: 'PUT',
        data: validatedData,
      }
    );

    if (!response.data) {
      throw new Error('Failed to update appointment');
    }

    return response.data;
  }

  async isScheduleVacant(schedule: CheckScheduleAvailability): Promise<boolean> {
    try {
      const responseSchema = ApiResponseSchema(z.boolean());

      const response = await this.request(
        `/appointments/check-vacancy/${schedule}`,
        responseSchema,
        {
          method: 'GET'
        }
      );

      if (!response.data) {
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

export const appointmentsService = new AppointmentsService();