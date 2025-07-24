// ============================================================================
// hooks/useDocumentForm.ts - Custom hook for document form logic
// ============================================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  type DocumentFormData,
  type Document,
  type DocumentType
} from '@/services/documents/documents.types';

import { 
  useDocument,
  useCreateDocument, 
  useUpdateDocument,
} from '@/services/documents/useDocuments';

import { useNotifications } from '@/components/_global/NotificationSystem';

interface UseDocumentFormOptions {
  documentId?: string;
  documentType: DocumentType;
  onSuccess?: (document: Document) => void;
  onError?: (error: Error) => void;
}

interface FormState {
  isSubmitting: boolean;
  error: string | null;
}

export function useDocumentForm({ 
  documentId, 
  documentType,
  onSuccess,
  onError 
}: UseDocumentFormOptions) {
  const navigate = useNavigate();
  const { showNotification } = useNotifications();
  
  // Local state for form management
  const [formState, setFormState] = useState<FormState>({
    isSubmitting: false,
    error: null
  });

  // Queries
  const { 
    data: document, 
    isLoading: isLoadingDocument 
  } = useDocument(documentId || '', !!documentId);
  
  // Mutations
  const createDocumentMutation = useCreateDocument();
  const updateDocumentMutation = useUpdateDocument();

  // Derived state
  const isEditing = !!documentId;
  const isSubmitting = formState.isSubmitting || createDocumentMutation.isPending || updateDocumentMutation.isPending;
  const isLoading = isLoadingDocument;

  // Handle form submission
  const handleSubmit = async (data: DocumentFormData) => {
    try {
      setFormState({ isSubmitting: true, error: null });
      let result: Document;

      if (isEditing && documentId) {
        result = await updateDocumentMutation.mutateAsync({ 
          id: documentId, 
          data 
        });
        
        showNotification({
          type: 'success',
          title: 'Document Updated',
          message: `${documentType.replace('_', ' ')} has been updated successfully.`
        });
      } else {
        result = await createDocumentMutation.mutateAsync(data);
        
        showNotification({
          type: 'success',
          title: 'Document Created',
          message: `${documentType.replace('_', ' ')} request has been submitted successfully.`
        });
      }

      // Call success callback
      onSuccess?.(result);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      setFormState({ isSubmitting: false, error: errorMessage });
      
      showNotification({
        type: 'error',
        title: isEditing ? 'Update Failed' : 'Submission Failed',
        message: errorMessage
      });

      // Call error callback
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  // Cancel and navigate back
  const handleCancel = () => {
    navigate(-1);
  };

  // Clear error
  const clearError = () => {
    setFormState(prev => ({ ...prev, error: null }));
  };

  return {
    // State
    isEditing,
    isSubmitting,
    isLoading,
    document,
    error: formState.error,
    
    // Actions
    handleSubmit,
    handleCancel,
    clearError,
    
    // Mutations (for custom handling)
    createDocumentMutation,
    updateDocumentMutation,
  };
} 