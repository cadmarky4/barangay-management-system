// ============================================================================
// pages/DataImport.tsx - Main Data Import Page
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Breadcrumb from '../_global/Breadcrumb';
import FileUploader from './FileUploader';
import ImportPreviewComponent from './ImportPreview';
import ImportHistory from './ImportHistory';
import { ImportService } from '../../services/import/import.service';
import type { ImportPreview, ImportResult, ImportType } from '../../services/import/import.types';
import { FaFileImport, FaUsers, FaHome, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

type ImportStep = 'upload' | 'preview' | 'complete';

const DataImport: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [importService] = useState(new ImportService());
  const queryClient = useQueryClient();

  // State management
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
  const [activeImportType, setActiveImportType] = useState<ImportType | null>(null);
  
  // File states
  const [residentsFile, setResidentsFile] = useState<File | null>(null);
  const [householdsFile, setHouseholdsFile] = useState<File | null>(null);
  
  // Preview states
  const [previewData, setPreviewData] = useState<ImportPreview | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  // Animation trigger
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Preview mutation
  const previewMutation = useMutation({
    mutationFn: ({ file, type }: { file: File; type: ImportType }) =>
      importService.previewFile(file, type),
    onSuccess: (data) => {
      setPreviewData(data);
      setCurrentStep('preview');
    },
    onError: (error) => {
      console.error('Preview failed:', error);
      alert(`Preview failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  // Import mutations
  const importResidentsMutation = useMutation({
    mutationFn: (file: File) => importService.importResidents(file),
    onSuccess: (result) => {
      setImportResult(result);
      setCurrentStep('complete');
      queryClient.invalidateQueries({ queryKey: ['import-history'] });
      queryClient.invalidateQueries({ queryKey: ['residents'] }); // Invalidate residents data
    },
    onError: (error) => {
      console.error('Import failed:', error);
      alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  const importHouseholdsMutation = useMutation({
    mutationFn: (file: File) => importService.importHouseholds(file),
    onSuccess: (result) => {
      setImportResult(result);
      setCurrentStep('complete');
      queryClient.invalidateQueries({ queryKey: ['import-history'] });
      queryClient.invalidateQueries({ queryKey: ['households'] }); // Invalidate households data
    },
    onError: (error) => {
      console.error('Import failed:', error);
      alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  // Handlers
  const handleFileSelect = (file: File, type: ImportType) => {
    if (type === 'RESIDENTS') {
      setResidentsFile(file);
    } else {
      setHouseholdsFile(file);
    }
  };

  const handleFilePreview = (file: File, type: ImportType) => {
    setActiveImportType(type);
    previewMutation.mutate({ file, type });
  };

  const handleClearFile = (type: ImportType) => {
    if (type === 'RESIDENTS') {
      setResidentsFile(null);
    } else {
      setHouseholdsFile(null);
    }
  };

  const handleConfirmImport = () => {
    if (!activeImportType) return;

    const file = activeImportType === 'RESIDENTS' ? residentsFile : householdsFile;
    if (!file) return;

    if (activeImportType === 'RESIDENTS') {
      importResidentsMutation.mutate(file);
    } else {
      importHouseholdsMutation.mutate(file);
    }
  };

  const handleStartOver = () => {
    setCurrentStep('upload');
    setActiveImportType(null);
    setPreviewData(null);
    setImportResult(null);
    setResidentsFile(null);
    setHouseholdsFile(null);
  };

  const handleBackToUpload = () => {
    setCurrentStep('upload');
    setPreviewData(null);
    setActiveImportType(null);
  };

  const isImporting = importResidentsMutation.isPending || importHouseholdsMutation.isPending;

  return (
    <main className="p-6 bg-gray-50 min-h-screen flex flex-col gap-6">
      {/* Breadcrumbs */}
      <Breadcrumb isLoaded={isLoaded} />

      {/* Page Header */}
      <div className={`transition-all duration-700 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-gray-900">Data Import</h1>
        </div>
        <p className="text-gray-600">
          Import residents and households data from Excel files into the system
        </p>
      </div>

      {/* Progress Steps */}
      <div className={`bg-white border border-gray-200 rounded-lg p-6 transition-all duration-700 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`} style={{ transitionDelay: '150ms' }}>
        <div className="flex items-center justify-between">
          {[
            { key: 'upload', label: 'Upload Files', icon: FaFileImport },
            { key: 'preview', label: 'Preview Data', icon: FaUsers },
            { key: 'complete', label: 'Import Complete', icon: FaCheckCircle }
          ].map((step, index) => {
            const isActive = currentStep === step.key;
            const isCompleted = 
              (step.key === 'upload' && (currentStep === 'preview' || currentStep === 'complete')) ||
              (step.key === 'preview' && currentStep === 'complete');
            
            return (
              <div key={step.key} className="flex items-center">
                <div className={`flex items-center gap-3 ${
                  isActive ? 'text-smblue-400' : 
                  isCompleted ? 'text-green-600' : 'text-gray-400'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isActive ? 'bg-smblue-100 border-2 border-smblue-400' :
                    isCompleted ? 'bg-green-100 border-2 border-green-600' :
                    'bg-gray-100 border-2 border-gray-300'
                  }`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium">{step.label}</span>
                </div>
                
                {index < 2 && (
                  <div className={`w-24 h-0.5 mx-4 ${
                    isCompleted ? 'bg-green-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-700 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`} style={{ transitionDelay: '300ms' }}>
        
        {/* Upload Step */}
        {currentStep === 'upload' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Residents Upload */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <FileUploader
                type="RESIDENTS"
                selectedFile={residentsFile}
                onFileSelect={(file) => handleFileSelect(file, 'RESIDENTS')}
                onPreview={(file) => handleFilePreview(file, 'RESIDENTS')}
                onClearFile={() => handleClearFile('RESIDENTS')}
                isLoading={previewMutation.isPending && activeImportType === 'RESIDENTS'}
              />
            </div>

            {/* Households Upload */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <FileUploader
                type="HOUSEHOLDS"
                selectedFile={householdsFile}
                onFileSelect={(file) => handleFileSelect(file, 'HOUSEHOLDS')}
                onPreview={(file) => handleFilePreview(file, 'HOUSEHOLDS')}
                onClearFile={() => handleClearFile('HOUSEHOLDS')}
                isLoading={previewMutation.isPending && activeImportType === 'HOUSEHOLDS'}
              />
            </div>
          </div>
        )}

        {/* Preview Step */}
        {currentStep === 'preview' && previewData && activeImportType && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <ImportPreviewComponent
              preview={previewData}
              type={activeImportType}
              onConfirmImport={handleConfirmImport}
              onCancel={handleBackToUpload}
              isImporting={isImporting}
            />
          </div>
        )}

        {/* Complete Step */}
        {currentStep === 'complete' && importResult && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="text-center py-8">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                importResult.success ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {importResult.success ? (
                  <FaCheckCircle className="w-8 h-8 text-green-600" />
                ) : (
                  <FaExclamationTriangle className="w-8 h-8 text-red-600" />
                )}
              </div>
              
              <h3 className={`text-2xl font-bold mb-2 ${
                importResult.success ? 'text-green-900' : 'text-red-900'
              }`}>
                {importResult.success ? 'Import Successful!' : 'Import Failed'}
              </h3>
              
              <p className="text-gray-600 mb-6">{importResult.message}</p>
              
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-2xl font-bold text-green-900">{importResult.imported}</p>
                  <p className="text-sm text-green-600">Successfully Imported</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-2xl font-bold text-red-900">{importResult.failed}</p>
                  <p className="text-sm text-red-600">Failed</p>
                </div>
              </div>
              
              {importResult.errors && importResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left max-w-2xl mx-auto">
                  <h4 className="font-medium text-red-800 mb-2">Import Errors:</h4>
                  <ul className="text-sm text-red-700 space-y-1 max-h-40 overflow-y-auto">
                    {importResult.errors.slice(0, 10).map((error, index) => (
                      <li key={index}>
                        Row {error.row}: {error.field} - {error.message}
                      </li>
                    ))}
                    {importResult.errors.length > 10 && (
                      <li className="text-red-600 font-medium">
                        ... and {importResult.errors.length - 10} more errors
                      </li>
                    )}
                  </ul>
                </div>
              )}
              
              <button
                onClick={handleStartOver}
                className="px-6 py-3 bg-smblue-400 text-white rounded-lg hover:bg-smblue-300 transition-colors"
              >
                Import More Data
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Import History - Only show on upload step */}
      {currentStep === 'upload' && (
        <div className={`transition-all duration-700 ease-out ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`} style={{ transitionDelay: '450ms' }}>
          <ImportHistory />
        </div>
      )}
    </main>
  );
};

export default DataImport;