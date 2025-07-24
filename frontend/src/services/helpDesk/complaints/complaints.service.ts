import { BaseApiService } from "@/services/__shared/api";
import { CreateComplaintSchema, EditComplaintSchema, ViewComplaintSchema, type CreateComplaint, type EditComplaint, type ViewComplaint } from "./complaints.types";
import { ApiResponseSchema } from "@/services/__shared/types";

export class ComplaintService extends BaseApiService {
  async viewComplaint(id: string): Promise<ViewComplaint> {
    if (!id) {
      throw new Error('Invalid complaint ID!');
    }

    try {
      const responseSchema = ApiResponseSchema(ViewComplaintSchema);
      const response = await this.request(
        `/complaint/view/${id}`,
        responseSchema,
        {
          method: 'GET'
        }
      );

      if (!response.data) {
        throw new Error('Failed to fetch complaint form data');
      }
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get complaint form: ${error.message}`);
      }
      throw new Error('An unexpected error occurred while fetching complaint form');
    }
  }

  async createComplaint(data: CreateComplaint): Promise<ViewComplaint> {
    // Validate input data
    const validatedData = CreateComplaintSchema.parse(data);

    const responseSchema = ApiResponseSchema(ViewComplaintSchema);
    const response = await this.request(
      '/complaint',
      responseSchema,
      {
        method: 'POST',
        data: validatedData,
      }
    );

    if (!response.data) {
      throw new Error('Failed to create complaint');
    }

    return response.data;
  }

  async updateComplaint(id: string, data: EditComplaint): Promise<ViewComplaint> {
    if (!id) {
      throw new Error('Invalid complaint ID');
    }

    // Validate input data
    const validatedData = EditComplaintSchema.parse(data);
    
    const responseSchema = ApiResponseSchema(ViewComplaintSchema);
    
    const response = await this.request(
      `/complaint/${id}`,
      responseSchema,
      {
        method: 'PUT',
        data: validatedData,
      }
    );

    if (!response.data) {
      throw new Error('Failed to update complaint');
    }

    return response.data;
  }
}

export const complaintService = new ComplaintService();