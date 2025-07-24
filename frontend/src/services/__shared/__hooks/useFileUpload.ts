// ============================================================================
// hooks/storage/use-storage.ts - TanStack Query hooks for storage
// ============================================================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { storageService } from '@/services/__shared/_storage/storage.service';
import { type FileUploadRequest } from '@/services/__shared/_storage/storage.types';
// import { toast } from 'sonner';

// Query keys
export const storageKeys = {
  all: ['storage'] as const,
  fileInfo: (url: string) => [...storageKeys.all, 'fileInfo', url] as const,
};

// File upload mutation
export function useFileUpload() {
  return useMutation({
    mutationFn: (request: FileUploadRequest) => storageService.uploadFile(request),
    onSuccess: (data) => {
        // Handle successful upload
        console.log('File uploaded successfully:', data);
        // Optionally show a toast notification
        // toast.success('File uploaded successfully');
    },
    onError: (error: any) => {
        // Handle upload error
        const message = error?.message || 'Upload failed';
        console.error('File upload error:', message);
        // Optionally show a toast notification
        // toast.error(message);
    },
  });
}

// Multiple file upload mutation
export function useMultipleFileUpload() {
  return useMutation({
    mutationFn: ({ 
      files, 
      options 
    }: { 
      files: File[]; 
      options?: { folder?: string; isPublic?: boolean } 
    }) => storageService.uploadMultipleFiles(files, options),
    onSuccess: (data) => {
      const successCount = data.files.length;
      const failedCount = data.failed?.length || 0;
      
      if (failedCount === 0) {
        console.log(`Successfully uploaded ${successCount} files`);
      } else {
        console.error(`Uploaded ${successCount} files with ${failedCount} failures`);
      }
    },
    onError: (error: any) => {
      const message = error?.message || 'Upload failed';
    },
  });
}

// File deletion mutation
export function useFileDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (url: string) => storageService.deleteFile(url),
    onSuccess: (_, url) => {
      // Invalidate file info query for this URL
      queryClient.invalidateQueries({
        queryKey: storageKeys.fileInfo(url),
      });
    },
    onError: (error: any) => {
      const message = error?.message || 'Delete failed';
    },
  });
}

// File info query
export function useFileInfo(url: string, enabled = true) {
  return useQuery({
    queryKey: storageKeys.fileInfo(url),
    queryFn: () => storageService.getFileInfo(url),
    enabled: enabled && !!url,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

// File upload with progress tracking
export function useFileUploadWithProgress() {
  return useMutation({
    mutationFn: async ({ 
      request, 
      onProgress 
    }: { 
      request: FileUploadRequest; 
      onProgress?: (progress: number) => void 
    }) => {
      // You can extend this to track actual progress
      onProgress?.(0);
      const result = await storageService.uploadFile(request);
      onProgress?.(100);
      return result;
    }
  });
}
