import React from 'react';
import { Upload, FileText, ExternalLink, Plus, X, AlertCircle } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { type ViewBlotter, type EditBlotter } from '@/services/helpDesk/blotters/blotters.types';

interface BlotterSupportingDocumentsSectionProps {
  blotter: ViewBlotter;
  mode: 'view' | 'edit';
}

export const BlotterSupportingDocumentsSection: React.FC<BlotterSupportingDocumentsSectionProps> = ({
  blotter,
  mode,
}) => {
  const { control, register, formState: { errors }, setValue, watch } = useFormContext<EditBlotter>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'blotter.supporting_documents',
  });

  const getFilenameFromUrl = (url: string) => {
    return url.split('/').pop() || url;
  };

  const addDocument = () => {
    append({
      url: ''
    });
  };

  const handleFileUpload = (index: number, file: File) => {
    // In a real app, you would upload the file to your server
    // For now, we'll just create a mock URL
    const mockUrl = `https://example.com/documents/${file.name}`;
    setValue(`blotter.supporting_documents.${index}.url`, mockUrl);
  };

  // Show empty state for view mode when no documents
  if (mode === 'view' && (!blotter.blotter.supporting_documents || blotter.blotter.supporting_documents.length === 0)) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Upload className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Supporting Documents</h3>
        </div>
        <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
          <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p>No supporting documents uploaded</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row items-left lg:justify-between lg:items-center mb-4">
        <div className="flex items-center gap-2 pb-2 border-b lg:border-b-0 lg:pb-0">
          <Upload className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Supporting Documents ({mode === 'edit' ? fields.length : blotter.blotter.supporting_documents?.length || 0})</h3>
        </div>
        {mode === 'edit' && (
          <button
            type="button"
            onClick={addDocument}
            className="mt-4 lg:mt-0 cursor-pointer flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Document
          </button>
        )}
      </div>

      {mode === 'view' ? (
        // View mode - show static data
        <div className="space-y-3">
          {blotter.blotter.supporting_documents?.map((doc, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Document #{index + 1}
                    </p>
                    <p className="text-sm text-gray-600 break-all">
                      {getFilenameFromUrl(doc.url)}
                    </p>
                  </div>
                </div>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md text-sm font-medium transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  View
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Edit mode - show form fields with useFieldArray
        <div className="space-y-3">
          {fields.length === 0 ? (
            <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>No documents added yet</p>
              <p className="text-sm">Click "Add Document" to include evidence files</p>
            </div>
          ) : (
            fields.map((field, index) => (
              <div key={field.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-600">
                        Document #{index + 1}
                      </span>
                    </div>
                    
                    {/* File Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Upload File
                      </label>
                      <input
                        type="file"
                        accept="image/*,application/pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(index, file);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    {/* URL (hidden field, populated by file upload) */}
                    <input
                      {...register(`blotter.supporting_documents.${index}.url`)}
                      type="hidden"
                    />
                    
                    {/* Display current URL if exists */}
                    {watch(`blotter.supporting_documents.${index}.url`) && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0 text-green-600 mt-0.5">
                            ✓
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-green-800 mb-1">
                              File uploaded successfully:
                            </p>
                            <p className="text-sm text-green-700 break-all">
                              {getFilenameFromUrl(watch(`blotter.supporting_documents.${index}.url`))}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {errors.blotter?.supporting_documents?.[index]?.url && (
                      <p className="text-red-500 text-xs mt-1 flex items-start gap-1">
                        <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                        <span className="break-words">
                          {errors.blotter.supporting_documents[index]?.url?.message}
                        </span>
                      </p>
                    )}
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="cursor-pointer p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                    title="Remove document"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};