// ============================================================================
// services/storage/storage.service.ts - Storage service implementation
// ============================================================================

import { BaseApiService } from '@/services/__shared/api';

import { z } from 'zod';

import { 
  ApiResponseSchema,
} from '@/services/__shared/types';
import { 
  UploadResultSchema, 
  FileUploadSchema,
  MultipleUploadResultSchema,
  type UploadResult,
  type FileUploadRequest,
  type MultipleUploadResult,
  STORAGE_BASE_URL,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
} from '@/services/__shared/_storage/storage.types';

import { apiClient } from '@/services/__shared/client';

export class StorageService extends BaseApiService {
  /**
   * Validate file before upload
   */
  private validateFile(file: File): void {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type as any)) {
      throw new Error(`File type ${file.type} is not allowed`);
    }
  }

  /**
   * Upload a single file
   */
  async uploadFile(request: FileUploadRequest): Promise<UploadResult> {
    // Validate input
    const validatedRequest = FileUploadSchema.parse(request);
    
    // Validate file constraints
    this.validateFile(validatedRequest.file);

    // Prepare form data
    const formData = new FormData();
    formData.append('file', validatedRequest.file);
    
    if (validatedRequest.folder) {
      formData.append('folder', validatedRequest.folder);
    }
    
    if (validatedRequest.isPublic !== undefined) {
      formData.append('is_public', validatedRequest.isPublic.toString());
    }

    // Upload file using axios
    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds for file uploads
      onUploadProgress: (progressEvent) => {
        // You can emit progress events here if needed
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        console.log(`Upload progress: ${percentCompleted}%`);
      },
    });

    // Validate response
    const responseSchema = ApiResponseSchema(UploadResultSchema);
    const validatedResponse = responseSchema.parse(response.data);

    if (!validatedResponse.data) {
      throw new Error('Upload failed: No data returned');
    }

    return validatedResponse.data;
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    files: File[], 
    options?: { folder?: string; isPublic?: boolean }
  ): Promise<MultipleUploadResult> {
    if (files.length === 0) {
      throw new Error('No files provided for upload');
    }

    // Validate all files first
    files.forEach(file => this.validateFile(file));

    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });

    if (options?.folder) {
      formData.append('folder', options.folder);
    }

    if (options?.isPublic !== undefined) {
      formData.append('is_public', options.isPublic.toString());
    }

    const response = await apiClient.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // 120 seconds for multiple files
    });

    const responseSchema = ApiResponseSchema(MultipleUploadResultSchema);
    const validatedResponse = responseSchema.parse(response.data);

    if (!validatedResponse.data) {
      throw new Error('Upload failed: No data returned');
    }

    return validatedResponse.data;
  }

  /**
   * Delete a file
   */
  async deleteFile(url: string): Promise<void> {
    const response = await apiClient.delete('/upload', {
      data: { url },
    });

    const responseSchema = ApiResponseSchema(z.any());
    responseSchema.parse(response.data);
  }

  /**
   * Get file info
   */
  async getFileInfo(url: string): Promise<UploadResult> {
    const response = await apiClient.get('/file/info', {
      params: { url },
    });

    const responseSchema = ApiResponseSchema(UploadResultSchema);
    const validatedResponse = responseSchema.parse(response.data);

    if (!validatedResponse.data) {
      throw new Error('Failed to get file info');
    }

    return validatedResponse.data;
  }

  /**
   * Generate a full URL for a stored file
   */
  getFullUrl(relativePath: string): string {
    if (relativePath.startsWith('http')) {
      return relativePath; // Already a full URL
    }
    return `${STORAGE_BASE_URL}/${relativePath.replace(/^\//, '')}`;
  }
}

// Create singleton instance
export const storageService = new StorageService();