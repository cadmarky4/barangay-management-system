// ============================================================================
// services/documents/documents.service.ts - Documents service implementation
// ============================================================================

import { z } from 'zod';

import { BaseApiService } from '@/services/__shared/api';
import {
  DocumentSchema,
  DocumentParamsSchema,
  DocumentStatisticsSchema,
  DocumentTrackingSchema,
  ProcessDocumentDataSchema,
  RejectDocumentDataSchema,
  ReleaseDocumentDataSchema,
  ProcessingHistoryItemSchema,
  type Document,
  type DocumentParams,
  type DocumentStatistics,
  type DocumentTracking,
  type ProcessDocumentData,
  type RejectDocumentData,
  type ReleaseDocumentData,
  type ProcessingHistoryItem,
  DocumentFormDataSchema, 
  type DocumentFormData,
  type DocumentStatus
} from '@/services/documents/documents.types';

import { 
  ApiResponseSchema, 
  PaginatedResponseSchema, 
  type PaginatedResponse 
} from '@/services/__shared/types';
import { apiClient } from '@/services/__shared/client';

export class DocumentsService extends BaseApiService {
  /**
   * Transform document API response to frontend format
   */
  private transformDocument(doc: Document & { id: string | number }): Document {
    return {
      ...doc,
      id: String(doc.id)
    };
  }

  /**
   * Transform document array API response to frontend format
   */
  private transformDocuments(docs: (Document & { id: string | number })[]): Document[] {
    return docs.map(doc => this.transformDocument(doc));
  }

  /**
   * Transform document tracking API response to frontend format
   */
  private transformDocumentTracking(tracking: DocumentTracking & { document: Document & { id: string | number } }): DocumentTracking {
    return {
      ...tracking,
      document: this.transformDocument(tracking.document)
    };
  }

  /**
   * Convert frontend status values to backend expected format
   */
  private convertStatusToBackend(status?: DocumentStatus | null): string | undefined {
    if (!status) return undefined;
    
    const statusMap: Record<DocumentStatus, string> = {
      'PENDING': 'pending',
      'UNDER_REVIEW': 'processing',
      'APPROVED': 'approved',
      'RELEASED': 'released',
      'REJECTED': 'rejected',
      'CANCELLED': 'cancelled'
    };
    
    return statusMap[status] || status.toLowerCase();
  }

  /**
   * Get paginated list of documents
   */
  async getDocuments(params: DocumentParams = {}): Promise<PaginatedResponse<Document>> {
    // Validate input parameters
    const validatedParams = DocumentParamsSchema.parse(params);
    
    // Convert status to backend format
    const backendParams = {
      ...validatedParams,
      status: this.convertStatusToBackend(validatedParams.status)
    };
    
    // Build query string
    const searchParams = new URLSearchParams();
    Object.entries(backendParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const paginatedSchema = PaginatedResponseSchema(DocumentSchema);
    
    const response = await this.request(
      `/documents?${searchParams.toString()}`,
      paginatedSchema,
      { method: 'GET' }
    );

    return {
      ...response,
      data: this.transformDocuments(response.data)
    };
  }

  /**
   * Get single document by ID
   */
  async getDocument(id: string): Promise<Document> {
    if (!id || id.trim() === '') {
      throw new Error('Invalid document ID');
    }

    const responseSchema = ApiResponseSchema(DocumentSchema);
    
    const response = await this.request(
      `/documents/${id}`,
      responseSchema,
      { method: 'GET' }
    );

    if (!response.data) {
      throw new Error('Document not found');
    }

    return this.transformDocument(response.data);
  }

  /**
   * Create new document
   */
  async createDocument(documentData: DocumentFormData): Promise<Document> {
    // Validate input data
    const validatedData = DocumentFormDataSchema.parse(documentData);
    
    const responseSchema = ApiResponseSchema(DocumentSchema);
    
    const response = await this.request(
      '/documents',
      responseSchema,
      {
      method: 'POST',
        data: validatedData,
      }
    );

    if (!response.data) {
      throw new Error('Failed to create document');
    }

    return this.transformDocument(response.data);
  }

  /**
   * Update existing document
   */
  async updateDocument(id: string, documentData: DocumentFormData): Promise<Document> {
    if (!id || id.trim() === '') {
      throw new Error('Invalid document ID');
    }

    // Validate input data
    const validatedData = DocumentFormDataSchema.parse(documentData);
    
    const responseSchema = ApiResponseSchema(DocumentSchema);
    
    const response = await this.request(
      `/documents/${id}`,
      responseSchema,
      {
        method: 'PUT',
        data: validatedData,
      }
    );

    if (!response.data) {
      throw new Error('Failed to update document');
    }

    return this.transformDocument(response.data);
  }

  /**
   * Delete document
   */
  async deleteDocument(id: string): Promise<void> {
    if (!id || id.trim() === '') {
      throw new Error('Invalid document ID');
    }

    const responseSchema = ApiResponseSchema(z.any());
    
    await this.request(
      `/documents/${id}`,
      responseSchema,
      { method: 'DELETE' }
    );
  }

  /**
   * Get document statistics
   */
  async getStatistics(): Promise<DocumentStatistics> {
    const responseSchema = ApiResponseSchema(DocumentStatisticsSchema);
    
    const response = await this.request(
      '/documents/statistics',
      responseSchema,
      { method: 'GET' }
    );

    if (!response.data) {
      throw new Error('Failed to get statistics');
    }

    return response.data;
  }

  /**
   * Search documents by reference number or applicant name
   */
  async searchDocuments(searchTerm: string, limit = 10): Promise<Document[]> {
    if (!searchTerm.trim()) {
      return [];
    }

    const paginatedSchema = PaginatedResponseSchema(DocumentSchema);
    
    const response = await this.request(
      `/documents?search=${encodeURIComponent(searchTerm)}&per_page=${limit}`,
      paginatedSchema,
      { method: 'GET' }
    );

    return this.transformDocuments(response.data);
  }

  /**
   * Get documents by resident
   */
  async getDocumentsByResident(residentId: number): Promise<Document[]> {
    if (!residentId || residentId <= 0) {
      throw new Error('Invalid resident ID');
    }

    const paginatedSchema = PaginatedResponseSchema(DocumentSchema);
    
    const response = await this.request(
      `/documents?resident_id=${residentId}`,
      paginatedSchema,
      { method: 'GET' }
    );

    return this.transformDocuments(response.data);
  }

  /**
   * Get documents by type
   */
  async getDocumentsByType(documentType: string): Promise<Document[]> {
    if (!documentType.trim()) {
      throw new Error('Document type is required');
    }

    const paginatedSchema = PaginatedResponseSchema(DocumentSchema);
    
    const response = await this.request(
      `/documents?document_type=${encodeURIComponent(documentType)}`,
      paginatedSchema,
      { method: 'GET' }
    );

    return this.transformDocuments(response.data);
  }

  /**
   * Get documents by status
   */
  async getDocumentsByStatus(status: string): Promise<Document[]> {
    if (!status.trim()) {
      throw new Error('Status is required');
    }

    const paginatedSchema = PaginatedResponseSchema(DocumentSchema);
    
    const response = await this.request(
      `/documents?status=${encodeURIComponent(status)}`,
      paginatedSchema,
      { method: 'GET' }
    );

    return this.transformDocuments(response.data);
  }

  /**
   * Process document (approve/review)
   */
  async processDocument(id: string, processData: ProcessDocumentData): Promise<Document> {
    if (!id || id.trim() === '') {
      throw new Error('Invalid document ID');
    }

    // Validate input data
    const validatedData = ProcessDocumentDataSchema.parse(processData);
    
    const responseSchema = ApiResponseSchema(DocumentSchema);
    
    const response = await this.request(
      `/documents/${id}/process`,
      responseSchema,
      {
        method: 'POST',
        data: validatedData,
      }
    );

    if (!response.data) {
      throw new Error('Failed to process document');
    }

    return this.transformDocument(response.data);
  }

  /**
   * Approve document
   */
  async approveDocument(id: string, approveData: ProcessDocumentData): Promise<Document> {
    if (!id || id.trim() === '') {
      throw new Error('Invalid document ID');
    }

    // Validate input data
    const validatedData = ProcessDocumentDataSchema.parse(approveData);
    
    const responseSchema = ApiResponseSchema(DocumentSchema);
    
    const response = await this.request(
      `/documents/${id}/approve`,
      responseSchema,
      {
        method: 'POST',
        data: validatedData,
      }
    );

    if (!response.data) {
      throw new Error('Failed to approve document');
    }

    return this.transformDocument(response.data);
  }

  /**
   * Reject document
   */
  async rejectDocument(id: string, rejectData: RejectDocumentData): Promise<Document> {
    if (!id || id.trim() === '') {
      throw new Error('Invalid document ID');
    }

    // Validate input data
    const validatedData = RejectDocumentDataSchema.parse(rejectData);
    
    const responseSchema = ApiResponseSchema(DocumentSchema);
    
    const response = await this.request(
      `/documents/${id}/reject`,
      responseSchema,
      {
      method: 'POST',
        data: validatedData,
      }
    );

    if (!response.data) {
      throw new Error('Failed to reject document');
    }

    return this.transformDocument(response.data);
  }

  /**
   * Release document
   */
  async releaseDocument(id: string, releaseData: ReleaseDocumentData): Promise<Document> {
    if (!id || id.trim() === '') {
      throw new Error('Invalid document ID');
    }

    // Validate input data
    const validatedData = ReleaseDocumentDataSchema.parse(releaseData);
    
    const responseSchema = ApiResponseSchema(DocumentSchema);
    
    const response = await this.request(
      `/documents/${id}/release`,
      responseSchema,
      {
      method: 'POST',
        data: validatedData,
      }
    );

    if (!response.data) {
      throw new Error('Failed to release document');
    }

    return this.transformDocument(response.data);
  }

  /**
   * Cancel document
   */
  async cancelDocument(id: string, reason: string): Promise<Document> {
    if (!id || id.trim() === '') {
      throw new Error('Invalid document ID');
    }

    if (!reason.trim()) {
      throw new Error('Cancellation reason is required');
    }

    const responseSchema = ApiResponseSchema(DocumentSchema);
    
    const response = await this.request(
      `/documents/${id}/cancel`,
      responseSchema,
      {
      method: 'POST',
        data: { reason },
      }
    );

    if (!response.data) {
      throw new Error('Failed to cancel document');
    }

    return this.transformDocument(response.data);
  }

  /**
   * Get document tracking information
   */
  async getDocumentTracking(id: string): Promise<DocumentTracking> {
    if (!id || id.trim() === '') {
      throw new Error('Invalid document ID');
    }

    const responseSchema = ApiResponseSchema(DocumentTrackingSchema);
    
    const response = await this.request(
      `/documents/${id}/tracking`,
      responseSchema,
      { method: 'GET' }
    );

    if (!response.data) {
      throw new Error('Failed to get document tracking');
    }

    return this.transformDocumentTracking(response.data);
  }

  /**
   * Generate document PDF
   */
  async generateDocumentPDF(id: string): Promise<Blob> {
    if (!id || id.trim() === '') {
      throw new Error('Invalid document ID');
    }

    const response = await apiClient.get(`/documents/${id}/pdf`, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf',
      },
    });

    return response.data;
  }

  /**
   * Get processing history with user roles
   */
  async getProcessingHistory(id: string): Promise<ProcessingHistoryItem[]> {
    if (!id || id.trim() === '') {
      throw new Error('Invalid document ID');
    }

    const responseSchema = ApiResponseSchema(z.array(ProcessingHistoryItemSchema));
    
    const response = await this.request(
      `/documents/${id}/history`,
      responseSchema,
      { method: 'GET' }
    );

    if (!response.data) {
      throw new Error('Failed to get processing history');
    }

    return response.data;
  }

  /**
   * Get overdue documents
   */
  async getOverdueDocuments(): Promise<Document[]> {
    const paginatedSchema = PaginatedResponseSchema(DocumentSchema);
    
    const response = await this.request(
      '/documents/overdue',
      paginatedSchema,
      { method: 'GET' }
    );

    return this.transformDocuments(response.data);
  }

  /**
   * Get pending documents
   */
  async getPendingDocuments(): Promise<Document[]> {
    const paginatedSchema = PaginatedResponseSchema(DocumentSchema);
    
    const response = await this.request(
      '/documents/pending',
      paginatedSchema,
      { method: 'GET' }
    );

    return this.transformDocuments(response.data);
  }
}

// Create singleton instance
export const documentsService = new DocumentsService();
