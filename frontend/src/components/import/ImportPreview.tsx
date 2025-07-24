// ============================================================================
// components/import/ImportPreview.tsx - Import Preview Component
// ============================================================================

import React, { useState } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import type { ImportPreview, ImportType } from '../../services/import/import.types';

interface ImportPreviewProps {
  preview: ImportPreview;
  type: ImportType;
  onConfirmImport: () => void;
  onCancel: () => void;
  isImporting?: boolean;
  className?: string;
}

const ImportPreviewComponent: React.FC<ImportPreviewProps> = ({
  preview,
  type,
  onConfirmImport,
  onCancel,
  isImporting = false,
  className = ''
}) => {
  const [showErrors, setShowErrors] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const totalPages = Math.ceil(preview.data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, preview.data.length);
  const currentData = preview.data.slice(startIndex, endIndex);

  const getRowErrors = (rowIndex: number) => {
    return preview.errors.filter(error => error.row === rowIndex + 1);
  };

  const hasRowErrors = (rowIndex: number) => {
    return getRowErrors(rowIndex).length > 0;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Preview Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Preview {type === 'RESIDENTS' ? 'Residents' : 'Households'} Data
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Review the data before importing to the system
          </p>
        </div>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FaTimes className="w-5 h-5" />
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaEye className="w-5 h-5 text-smblue-400" />
            </div>
            <div>
              <p className="text-sm text-smblue-400 font-medium">Total Rows</p>
              <p className="text-2xl font-bold text-blue-900">{preview.totalRows}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FaCheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Valid Rows</p>
              <p className="text-2xl font-bold text-green-900">{preview.validRows}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <FaExclamationTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-red-600 font-medium">Invalid Rows</p>
              <p className="text-2xl font-bold text-red-900">{preview.invalidRows}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <FaEyeSlash className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Columns</p>
              <p className="text-2xl font-bold text-gray-900">{preview.headers.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Toggle */}
      {preview.errors.length > 0 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowErrors(!showErrors)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
          >
            {showErrors ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
            {showErrors ? 'Hide' : 'Show'} Errors ({preview.errors.length})
          </button>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Row #
                </th>
                {preview.headers.map((header, index) => (
                  <th
                    key={index}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentData.map((row, index) => {
                const actualRowIndex = startIndex + index;
                const rowHasErrors = hasRowErrors(actualRowIndex);
                const rowErrors = getRowErrors(actualRowIndex);
                
                return (
                  <React.Fragment key={actualRowIndex}>
                    <tr className={`${rowHasErrors ? 'bg-red-50' : 'hover:bg-gray-50'} transition-colors`}>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {actualRowIndex + 1}
                      </td>
                      {preview.headers.map((header, headerIndex) => (
                        <td key={headerIndex} className="px-4 py-3 text-sm text-gray-900">
                          <div className="max-w-xs truncate" title={String(row[header] || '')}>
                            {String(row[header] || '')}
                          </div>
                        </td>
                      ))}
                      <td className="px-4 py-3 text-sm">
                        {rowHasErrors ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <FaExclamationTriangle className="w-3 h-3 mr-1" />
                            Error
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <FaCheckCircle className="w-3 h-3 mr-1" />
                            Valid
                          </span>
                        )}
                      </td>
                    </tr>
                    
                    {/* Error Details Row */}
                    {showErrors && rowHasErrors && (
                      <tr className="bg-red-25">
                        <td colSpan={preview.headers.length + 2} className="px-4 py-3 text-sm">
                          <div className="bg-red-100 border border-red-200 rounded-lg p-3">
                            <p className="text-red-800 font-medium mb-2">Row {actualRowIndex + 1} Errors:</p>
                            <ul className="space-y-1">
                              {rowErrors.map((error, errorIndex) => (
                                <li key={errorIndex} className="text-red-700 text-xs">
                                  <strong>{error.field}:</strong> {error.message}
                                  {error.value && (
                                    <span className="text-red-600 ml-1">
                                      (Value: "{String(error.value)}")
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {endIndex} of {preview.data.length} rows
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="text-sm text-gray-600">
          {preview.invalidRows > 0 ? (
            <span className="text-amber-600">
              ⚠️ {preview.invalidRows} rows have errors and will be skipped during import.
            </span>
          ) : (
            <span className="text-green-600">
              ✅ All rows are valid and ready for import.
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            disabled={isImporting}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirmImport}
            disabled={isImporting || preview.validRows === 0}
            className="px-6 py-2 bg-smblue-400 text-white rounded-lg hover:bg-smblue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isImporting ? 'Importing...' : `Import ${preview.validRows} Valid Rows`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportPreviewComponent;