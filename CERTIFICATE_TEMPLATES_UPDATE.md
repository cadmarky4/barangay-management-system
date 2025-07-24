# Certificate Template Route Update

## Overview
The certificate templates have been moved from overlay modals to separate routes to eliminate overlaying issues when printing documents.

## Changes Made

### 1. New Route Components Created
- `BarangayClearancePrint.tsx` - Dedicated route for printing Barangay Clearance certificates
- `CertificateOfResidencyPrint.tsx` - Dedicated route for printing Certificate of Residency  
- `CertificateOfIndigencyPrint.tsx` - Dedicated route for printing Certificate of Indigency
- `BusinessPermitPrint.tsx` - Dedicated route for printing Business Permit certificates

### 2. New Routes Added to App.tsx
```typescript
{
  path: "print/barangay-clearance/:documentId",
  element: <BarangayClearancePrint />,
},
{
  path: "print/certificate-residency/:documentId", 
  element: <CertificateOfResidencyPrint />,
},
{
  path: "print/certificate-indigency/:documentId",
  element: <CertificateOfIndigencyPrint />,
},
{
  path: "print/business-permit/:documentId",
  element: <BusinessPermitPrint />,
},
```

### 3. Updated ProcessDocument.tsx
- Removed modal-based printing functionality
- Updated `handlePrintDocument()` to navigate to dedicated print routes
- Removed template modal state variables and components

## Benefits

### ✅ Print-Optimized
- No overlay styling issues when printing
- Clean, dedicated print layouts without interference
- Proper page breaks and formatting for physical printing

### ✅ Better User Experience  
- Documents open in new dedicated pages
- Easier navigation and bookmarking of certificates
- Print/PDF generation works seamlessly

### ✅ SEO and Accessibility
- Each certificate has its own URL
- Better for sharing and referencing documents
- Improved accessibility for screen readers

## Usage

### For Users
1. Navigate to Process Document page
2. Click the "Print" button on any approved document
3. Browser navigates to dedicated certificate page
4. Use browser's print function or "Print/Save PDF" button

### For Developers
Access certificate routes directly:
```
/process-document/print/barangay-clearance/{documentId}
/process-document/print/certificate-residency/{documentId}  
/process-document/print/certificate-indigency/{documentId}
/process-document/print/business-permit/{documentId}
```

## Features

### Print Controls
- "Print/Save PDF" button (hidden when printing)
- "Close" button to return to document management
- Automatic print dialog integration

### Document Loading
- Fetches document data by ID from URL parameters
- Loading states and error handling
- Fallback to placeholder data in development

### Professional Formatting
- Official government letterhead style
- Proper spacing and typography for printing
- Print-specific CSS classes (`print:hidden`, `print:p-4`, etc.)
- Black borders removed when printing

## Technical Details

### Component Structure
Each print component includes:
- Document data fetching via `useParams` and `documentsService`
- Loading and error states
- Print-optimized layout with proper CSS
- Navigation controls (hidden when printing)

### Print Styles
```css
print:hidden - Hide elements when printing
print:p-4 - Print-specific padding
print:border-0 - Remove borders when printing
```

### Route Parameters
- `:documentId` - Document ID to fetch and display
- Dynamic routing based on document type

This update provides a much better printing experience without the overlay issues that were present in the modal-based approach. 