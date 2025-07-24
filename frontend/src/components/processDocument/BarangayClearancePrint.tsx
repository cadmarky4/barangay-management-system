// ============================================================================
// processDocument/BarangayClearancePrint.tsx - Modern Barangay Clearance Print
// ============================================================================

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPrinter, FiX, FiAlertCircle } from 'react-icons/fi';

import { LoadingSpinner } from '../__shared/LoadingSpinner';
import { useDocument } from '@/services/documents/useDocuments';
import type { Document } from '@/services/documents/documents.types';

// interface CertificateHeaderProps {}

const CertificateHeader: React.FC = () => (
  <div className="text-center mb-8">
    <div className="mb-4">
      <h1 className="text-lg font-bold text-gray-800">REPUBLIC OF THE PHILIPPINES</h1>
      <h2 className="text-base font-semibold text-gray-700">PROVINCE OF BATAAN</h2>
      <h3 className="text-base font-semibold text-gray-700">MUNICIPALITY OF SAMAL</h3>
      <h4 className="text-lg font-bold text-gray-800">Brgy. Sikatuna Village</h4>
    </div>
    <div className="border-t-2 border-b-2 border-black py-2 mb-6">
      <h2 className="text-xl font-bold text-gray-800">OFFICE OF THE PUNONG BARANGAY</h2>
    </div>
  </div>
);

interface CertificateFooterProps {
  certifyingOfficial?: string; 
  dateIssued?: string;
  orNumber?: string;
  amountPaid?: number;
}

const CertificateFooter: React.FC<CertificateFooterProps> = ({ 
  certifyingOfficial, 
  dateIssued, 
  orNumber, 
  amountPaid 
}) => (
  <div className="mt-12">
    <div className="flex justify-between items-start">
      <div className="w-1/2">
        <p className="text-sm mb-4">Date Issued: {dateIssued || new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
        {orNumber && (
          <p className="text-sm mb-2">O.R. Number: {orNumber}</p>
        )}
        {amountPaid !== undefined && Number(amountPaid) > 0 && (
          <p className="text-sm">Amount Paid: ₱{Number(amountPaid).toFixed(2)}</p>
        )}
        {amountPaid !== undefined && Number(amountPaid) === 0 && (
          <p className="text-sm">Amount Paid: FREE</p>
        )}
      </div>
      <div className="w-1/2 text-center">
        <div className="mt-8">
          <div className="border-b-2 border-black inline-block w-64 mb-2"></div>
          <p className="text-sm font-semibold">{certifyingOfficial || 'PUNONG BARANGAY'}</p>
          <p className="text-xs text-gray-600">Punong Barangay</p>
        </div>
      </div>
    </div>
  </div>
);

const BarangayClearancePrint: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  
  // Modern TanStack Query data fetching
  const { 
    data: document, 
    isLoading, 
    error 
  } = useDocument(documentId || '', !!documentId);

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    navigate('/process-document');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !document) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <FiAlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Document Not Found</h3>
          <p className="text-red-600 mb-6">
            {error?.message || 'The requested document could not be found or loaded.'}
          </p>
          <button
            onClick={handleClose}
            className="bg-smblue-400 text-white px-6 py-2 rounded-lg hover:bg-smblue-500 transition-colors"
          >
            Back to Documents
          </button>
        </div>
      </div>
    );
  }

  // Validate document type
  if (document.document_type !== 'BARANGAY_CLEARANCE') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <FiAlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Invalid Document Type</h3>
          <p className="text-orange-600 mb-6">
            This document is not a Barangay Clearance. Expected: Barangay Clearance, Got: {document.document_type.replace(/_/g, ' ')}
          </p>
          <button
            onClick={handleClose}
            className="bg-smblue-400 text-white px-6 py-2 rounded-lg hover:bg-smblue-500 transition-colors"
          >
            Back to Documents
          </button>
        </div>
      </div>
    );
  }

  // Format applicant name
  const applicantName = document.applicant_name || 
    `${document.resident?.first_name || ''} ${document.resident?.middle_name || ''} ${document.resident?.last_name || ''}`.trim() ||
    'N/A';

  // Format address
  const applicantAddress = document.applicant_address || 
    document.resident?.complete_address || 
    'Brgy. Sikatuna Village, Samal, Bataan';

  // Generate OR number
  const orNumber = document.document_number || `OR-${(document.id || 0).toString().padStart(6, '0')}`;

  // Format date issued
  const dateIssued = document.approved_date ? 
    new Date(document.approved_date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : 
    new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

  return (
    <>
      <style>{`
        @media print {
          @page {
            margin: 0.5in;
            size: A4;
          }
          * {
            visibility: visible !important;
            color: black !important;
            background: white !important;
            box-shadow: none !important;
            text-shadow: none !important;
          }
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .certificate-content {
            page-break-inside: avoid;
            height: auto;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
        
        @media screen {
          .certificate-content {
            min-height: calc(100vh - 6rem);
          }
        }
      `}</style>
      
      <div className="min-h-screen bg-gray-50 print:bg-white">
        {/* Print Controls - Hidden when printing */}
        <div className="no-print print:hidden fixed top-4 right-4 z-10 space-x-2">
          <button
            onClick={handlePrint}
            className="bg-smblue-400 text-white px-6 py-3 rounded-lg hover:bg-smblue-500 shadow-lg font-medium transition-colors flex items-center space-x-2"
          >
            <FiPrinter className="w-4 h-4" />
            <span>Print Certificate</span>
          </button>
          <button
            onClick={handleClose}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 shadow-lg transition-colors flex items-center space-x-2"
          >
            <FiX className="w-4 h-4" />
            <span>Close</span>
          </button>
        </div>

        {/* Certificate Content */}
        <div className="max-w-4xl mx-auto p-8 certificate-content print:p-0">
          <div className="bg-white p-8 shadow-lg print:shadow-none print:p-6">
            <CertificateHeader />
            
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800 underline mb-6">BARANGAY CLEARANCE</h1>
            </div>

            <div className="mb-8">
              <p className="text-base leading-relaxed text-justify mb-4">
                <span className="font-semibold">TO WHOM IT MAY CONCERN:</span>
              </p>
              
              <p className="text-base leading-relaxed text-justify mb-6">
                This is to certify that <span className="font-semibold underline">{applicantName.toUpperCase()}</span>, 
                of legal age, Filipino citizen, 
                and a resident of <span className="font-semibold">{applicantAddress}</span>, 
                is personally known to me and is a person of good moral character and reputation in the community.
              </p>

              <p className="text-base leading-relaxed text-justify mb-6">
                This certification is issued upon the request of the above-named person for 
                <span className="font-semibold"> {document.purpose?.toLowerCase() || 'general purposes'}</span> and for whatever legal purpose 
                it may serve him/her best.
              </p>

              <p className="text-base leading-relaxed text-justify">
                Given this <span className="font-semibold">{new Date().getDate()}</span> day of{' '}
                <span className="font-semibold">{new Date().toLocaleDateString('en-US', { month: 'long' })}</span>,{' '}
                <span className="font-semibold">{new Date().getFullYear()}</span> at Brgy. Sikatuna Village, Samal, Bataan, Philippines.
              </p>
            </div>

            <CertificateFooter 
              certifyingOfficial={document.certifying_official}
              dateIssued={dateIssued}
              orNumber={orNumber}
              amountPaid={document.processing_fee}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default BarangayClearancePrint; 