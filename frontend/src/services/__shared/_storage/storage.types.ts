// ============================================================================
// types/storage.ts - Storage-related schemas and types
// ============================================================================

import { z } from 'zod';

// Upload result schema
export const UploadResultSchema = z.object({
  url: z.string().url('Invalid URL format'),
  filename: z.string().optional(),
  size: z.number().optional(),
  mimetype: z.string().optional(),
});

// File upload request validation
export const FileUploadSchema = z.object({
  file: z.instanceof(File, { message: 'Must be a valid file' }),
  folder: z.string().optional(),
  isPublic: z.boolean().optional().default(true),
});

// Multiple file upload schema
export const MultipleUploadResultSchema = z.object({
  files: z.array(UploadResultSchema),
  failed: z.array(z.object({
    filename: z.string(),
    error: z.string(),
  })).optional(),
});

// Type exports
export type UploadResult = z.infer<typeof UploadResultSchema>;
export type FileUploadRequest = z.infer<typeof FileUploadSchema>;
export type MultipleUploadResult = z.infer<typeof MultipleUploadResultSchema>;

// Constants
export const STORAGE_BASE_URL = import.meta.env.VITE_STORAGE_BASE_URL || 'http://localhost:8000/storage/public/residents/photos';
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;
