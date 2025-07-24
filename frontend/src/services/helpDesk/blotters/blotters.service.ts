import { BaseApiService } from "@/services/__shared/api";
import { CreateBlotterSchema, EditBlotterSchema, ViewBlotterSchema, type CreateBlotter, type EditBlotter, type UploadSupportingDocuments, type ViewBlotter } from "./blotters.types";
import { ApiResponseSchema } from "@/services/__shared/types";
import { apiClient } from "@/services/__shared/client";

export class BlotterService extends BaseApiService {
  async viewBlotter(id: string): Promise<ViewBlotter> {
    if (!id) {
      throw new Error('Invalid blotter ID!');
    }

    try {
      const responseSchema = ApiResponseSchema(ViewBlotterSchema);
      const response = await this.request(
        `/blotter/view/${id}`,
        responseSchema,
        {
          method: 'GET'
        }
      );

      if (!response.data) {
        throw new Error('Failed to fetch blotter form data');
      }
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get blotter form: ${error.message}`);
      }
      throw new Error('An unexpected error occurred while fetching blotter form');
    }
  }

  async createBlotter(data: CreateBlotter): Promise<ViewBlotter> {
    // Validate input data
    const validatedData = CreateBlotterSchema.parse(data);

    const responseSchema = ApiResponseSchema(ViewBlotterSchema);
    const response = await this.request(
      '/blotter',
      responseSchema,
      {
        method: 'POST',
        data: validatedData,
      }
    );

    if (!response.data) {
      throw new Error('Failed to create blotter');
    }

    return response.data;
  }

  async updateBlotter(id: string, data: EditBlotter): Promise<ViewBlotter> {
    if (!id) {
      throw new Error('Invalid blotter ID');
    }

    // Validate input data
    const validatedData = EditBlotterSchema.parse(data);
    
    const responseSchema = ApiResponseSchema(ViewBlotterSchema);
    
    const response = await this.request(
      `/blotter/${id}`,
      responseSchema,
      {
        method: 'PUT',
        data: validatedData,
      }
    );

    if (!response.data) {
      throw new Error('Failed to update blotter');
    }

    return response.data;
  }

  async uploadSupportingDocuments(document: UploadSupportingDocuments): Promise<ViewBlotter> {
    if (!document.blotter_id || typeof document.blotter_id !== 'string') {
      throw new Error('Invalid blotter ID: ID must be a non-empty string');
    }

    if (!document.file) {
      throw new Error('Photo file is required');
    }

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(document.file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, GIF, and PDF are allowed.');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (document.file.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }

    const formData = new FormData();
    formData.append('photo', document.file);

    const response = await apiClient.post(`/blotter/${document.blotter_id}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds
    });

    const responseSchema = ApiResponseSchema(ViewBlotterSchema);
    const validatedResponse = responseSchema.parse(response.data);

    if (!validatedResponse.data) {
      throw new Error('Failed to upload profile photo');
    }

    return validatedResponse.data;  
  }
}

export const blotterService = new BlotterService();