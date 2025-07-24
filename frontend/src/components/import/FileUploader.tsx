// ============================================================================
// components/import/FileUploader.tsx - File Upload Component
// ============================================================================

import React, { useRef, useState } from 'react';
import { FaCloudUploadAlt, FaFileExcel, FaTimes, FaDownload } from 'react-icons/fa';
import { ImportService } from '../../services/import/import.service';
import type { ImportType } from '@/services/import/import.types';

interface FileUploaderProps {
  type: ImportType;
  onFileSelect: (file: File) => void;
  onPreview: (file: File) => void;
  selectedFile: File | null;
  onClearFile: () => void;
  isLoading?: boolean;
  className?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  type,
  onFileSelect,
  onPreview,
  selectedFile,
  onClearFile,
  isLoading = false,
  className = ''
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [importService] = useState(new ImportService());

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    const validation = importService.validateFile(file);
    
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    onFileSelect(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await importService.downloadTemplate(type);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type.toLowerCase()}_template.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Template download failed:', error);
      alert('Failed to download template');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          Upload {type === 'RESIDENTS' ? 'Residents' : 'Households'} Data
        </h3>
        <button
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2 px-3 py-2 text-sm text-smblue-400 hover:text-smblue-300 hover:bg-smblue-50 cursor-pointer rounded-lg transition-colors"
        >
          <FaDownload className="w-4 h-4" />
          Download Template
        </button>
      </div>

      {/* Upload Area */}
      {!selectedFile ? (
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            dragActive
              ? 'border-smblue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          } ${isLoading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleInputChange}
            className="hidden"
            disabled={isLoading}
          />
          
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <FaCloudUploadAlt className="w-8 h-8 text-gray-400" />
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                {dragActive ? 'Drop your file here' : 'Choose file or drag and drop'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Excel files only (.xlsx, .xls) - Max 10MB
              </p>
            </div>
            
            <div className="pt-2">
              <button
                type="button"
                className="px-4 py-2 bg-smblue-400 cursor-pointer text-white rounded-lg hover:bg-smblue-300 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Select File'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Selected File Display */
        <div className="border rounded-xl p-6 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FaFileExcel className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(selectedFile.size)} • Excel File
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPreview(selectedFile)}
                className="px-4 py-2 bg-smblue-400 text-white rounded-lg hover:bg-smblue-300 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Preview Data'}
              </button>
              <button
                onClick={onClearFile}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                disabled={isLoading}
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-smblue-400 mb-2">Upload Instructions:</h4>
        <ul className="text-sm text-smblue-200 space-y-1">
          <li>• Use the provided template for the correct format</li>
          <li>• Ensure all required fields are filled</li>
          <li>• Check for duplicate entries before uploading</li>
          <li>• Maximum file size: 10MB</li>
        </ul>
      </div>
    </div>
  );
};

export default FileUploader;