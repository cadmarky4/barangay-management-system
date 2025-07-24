import { BaseApiService } from "@/services/__shared/api";
import { CreateSuggestionSchema, EditSuggestionSchema, ViewSuggestionSchema, type CreateSuggestion, type EditSuggestion, type ViewSuggestion } from "./suggestions.types";
import { ApiResponseSchema } from "@/services/__shared/types";

export class SuggestionService extends BaseApiService {
  async viewSuggestion(id: string): Promise<ViewSuggestion> {
    if (!id) {
      throw new Error('Invalid suggestion ID!');
    }

    try {
      const responseSchema = ApiResponseSchema(ViewSuggestionSchema);
      const response = await this.request(
        `/suggestion/view/${id}`,
        responseSchema,
        {
          method: 'GET'
        }
      );

      if (!response.data) {
        throw new Error('Failed to fetch suggestion form data');
      }
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get suggestion form: ${error.message}`);
      }
      throw new Error('An unexpected error occurred while fetching suggestion form');
    }
  }

  async createSuggestion(data: CreateSuggestion): Promise<ViewSuggestion> {
    // Validate input data
    const validatedData = CreateSuggestionSchema.parse(data);

    const responseSchema = ApiResponseSchema(ViewSuggestionSchema);
    const response = await this.request(
      '/suggestion',
      responseSchema,
      {
        method: 'POST',
        data: validatedData,
      }
    );

    if (!response.data) {
      throw new Error('Failed to create suggestion');
    }

    return response.data;
  }

  async updateSuggestion(id: string, data: EditSuggestion): Promise<ViewSuggestion> {
    if (!id) {
      throw new Error('Invalid suggestion ID');
    }

    // Validate input data
    const validatedData = EditSuggestionSchema.parse(data);
    
    const responseSchema = ApiResponseSchema(ViewSuggestionSchema);
    
    const response = await this.request(
      `/suggestion/${id}`,
      responseSchema,
      {
        method: 'PUT',
        data: validatedData,
      }
    );

    if (!response.data) {
      throw new Error('Failed to update suggestion');
    }

    return response.data;
  }
}

export const suggestionService = new SuggestionService();