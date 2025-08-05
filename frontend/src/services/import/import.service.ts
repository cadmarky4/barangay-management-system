// ============================================================================
// services/import/import.service.ts - Data Import Service
// ============================================================================

import { BaseApiService } from '@/services/__shared/api';
import { apiClient } from '@/services/__shared/client';
import * as XLSX from 'xlsx';
import { 
  ImportPreviewSchema,
  ImportResultSchema,
  ImportHistoryItemSchema,
  ImportParamsSchema,
  type ImportPreview,
  type ImportResult,
  type ImportHistoryItem,
  type ImportParams,
  type ImportType
} from '@/services/import/import.types';
import { 
  ApiResponseSchema, 
  PaginatedResponseSchema,
  type PaginatedResponse 
} from '@/services/__shared/types';

export class ImportService extends BaseApiService {
  /**
   * Preview Excel file data locally (no backend needed)
   */
  async previewFile(file: File, type: ImportType): Promise<ImportPreview> {
    try {
      // Read file as buffer
      const buffer = await file.arrayBuffer();
      
      // Parse Excel file
      const workbook = XLSX.read(buffer, { 
        type: 'array',
        cellDates: true, // Parse dates properly
        dateNF: 'yyyy-mm-dd' // Date format
      });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON with header row
      const rawData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        raw: false, // Get formatted strings
        dateNF: 'yyyy-mm-dd'
      }) as any[][];
      
      if (rawData.length === 0) {
        throw new Error('File is empty');
      }
      
      // Extract headers (first row)
      const headers = rawData[0] as string[];
      
      // Extract data rows (skip header)
      const dataRows = rawData.slice(1);
      
      // Process data - keep original for display AND create transformed for validation
      const processedData: any[] = [];
      const transformedDataForValidation: any[] = [];
      
      dataRows.forEach(row => {
        // Create object with original headers for display
        const displayObj: Record<string, any> = {};
        headers.forEach((header, index) => {
          displayObj[header] = row[index] || '';
        });
        processedData.push(displayObj);
        
        // Create transformed object for validation
        const transformedObj = this.transformExcelData(displayObj, type);
        transformedDataForValidation.push(transformedObj);
      });
      
      // Validate using transformed data
      const validation = this.validatePreviewData(transformedDataForValidation, type);
      
      return {
        headers,
        data: processedData, // Return original data for display
        totalRows: processedData.length,
        validRows: validation.validCount,
        invalidRows: validation.invalidCount,
        errors: validation.errors
      };
      
    } catch (error) {
      console.error('Preview failed:', error);
      throw new Error(`Failed to preview file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Transform Excel data to match expected format
   */
  private transformExcelData(row: Record<string, any>, type: ImportType): Record<string, any> {
    const transformed: Record<string, any> = {};
    
    // Map headers to expected field names
    const headerMapping = this.getHeaderMapping(type);
    
    // Debug log for households
    if (type === 'HOUSEHOLDS') {
      console.log('Original row data:', row);
      console.log('Header mapping:', headerMapping);
    }
    
    Object.entries(row).forEach(([header, value]) => {
      const fieldName = headerMapping[header] || header.toLowerCase().replace(/\s+/g, '_');
      transformed[fieldName] = value;
    });
    
    if (type === 'RESIDENTS') {
      // Transform boolean fields
      const booleanFields = ['senior_citizen', 'person_with_disability', 'four_ps_beneficiary', 'indigenous_people'];
      booleanFields.forEach(field => {
        if (field in transformed) {
          transformed[field] = this.parseExcelBoolean(transformed[field]);
        }
      });
      
      // Transform enum fields to uppercase
      const enumFields = ['gender', 'civil_status', 'employment_status', 'voter_status', 'nationality', 'religion', 'educational_attainment'];
      enumFields.forEach(field => {
        if (transformed[field] && typeof transformed[field] === 'string') {
          transformed[field] = transformed[field].toUpperCase().trim();
        }
      });
      
      // Parse dates
      if (transformed.birth_date) {
        transformed.birth_date = this.parseExcelDate(transformed.birth_date);
      }
      
      // Calculate age if not provided
      if (!transformed.age && transformed.birth_date) {
        const birthDate = new Date(transformed.birth_date);
        const today = new Date();
        transformed.age = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)).toString();
      }
      
    } else if (type === 'HOUSEHOLDS') {
      // Transform boolean fields
      const booleanFields = [
        'four_ps_beneficiary', 'indigent_family', 'has_senior_citizen', 
        'has_pwd_member', 'has_electricity', 'has_water_supply', 'has_internet_access'
      ];
      booleanFields.forEach(field => {
        if (field in transformed) {
          transformed[field] = this.parseExcelBoolean(transformed[field]);
        }
      });
      
      // Transform enum fields to uppercase - IMPORTANT: Include household_type!
      const enumFields = ['household_type', 'monthly_income', 'house_type', 'ownership_status'];
      enumFields.forEach(field => {
        if (transformed[field] && typeof transformed[field] === 'string') {
          // Special handling for common variations
          let value = transformed[field].toUpperCase().trim();
          
          // Handle common household type variations
          if (field === 'household_type') {
            const typeMapping: Record<string, string> = {
              'NUCLEAR FAMILY': 'NUCLEAR',
              'EXTENDED FAMILY': 'EXTENDED',
              'SINGLE PERSON': 'SINGLE',
              'SINGLE-PARENT': 'SINGLE_PARENT',
              'SINGLE PARENT': 'SINGLE_PARENT',
              'OTHERS': 'OTHER'
            };
            value = typeMapping[value] || value;
          }
          
          // Handle income range variations
          if (field === 'monthly_income') {
            value = value.replace(/[₱,\s]/g, ''); // Remove peso sign, commas, spaces
            if (value.includes('<10000') || value.includes('BELOW10000')) {
              value = 'BELOW_10000';
            } else if (value.includes('10000-25000')) {
              value = 'RANGE_10000_25000';
            } else if (value.includes('25000-50000')) {
              value = 'RANGE_25000_50000';
            } else if (value.includes('50000-100000')) {
              value = 'RANGE_50000_100000';
            } else if (value.includes('>100000') || value.includes('ABOVE100000')) {
              value = 'ABOVE_100000';
            }
          }
          
          // Handle house type variations
          if (field === 'house_type') {
            if (value.includes('SEMI') && value.includes('CONCRETE')) {
              value = 'SEMI_CONCRETE';
            }
          }
          
          // Handle ownership variations
          if (field === 'ownership_status') {
            if (value.includes('INFORMAL') || value.includes('SETTLER')) {
              value = 'INFORMAL_SETTLER';
            }
          }
          
          transformed[field] = value;
        }
      });
      
      // Debug log transformed data
      console.log('Transformed household data:', transformed);
    }
    
    // Convert empty strings to null for all optional fields
    Object.keys(transformed).forEach(key => {
      if (transformed[key] === '' || transformed[key] === undefined) {
        transformed[key] = null;
      }
    });
    
    return transformed;
  }

  /**
   * Validate preview data with custom validation (no Zod)
   */
  private validatePreviewData(data: Record<string, any>[], type: ImportType) {
    const errors: Array<{
      row: number;
      field: string;
      message: string;
      value: any;
    }> = [];
    
    let validCount = 0;
    let invalidCount = 0;
    
    data.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because we skip header and arrays are 0-indexed
      const rowErrors: Array<{
        row: number;
        field: string;
        message: string;
        value: any;
      }> = [];
      
      if (type === 'RESIDENTS') {
        // Validate residents data
        this.validateResidentRow(row, rowNumber, rowErrors);
      } else {
        // Validate households data
        this.validateHouseholdRow(row, rowNumber, rowErrors);
      }
      
      if (rowErrors.length > 0) {
        invalidCount++;
        errors.push(...rowErrors);
      } else {
        validCount++;
      }
    });
    
    return { validCount, invalidCount, errors };
  }

  /**
   * Validate a single resident row
   */
  private validateResidentRow(row: Record<string, any>, rowNumber: number, errors: Array<{
    row: number;
    field: string;
    message: string;
    value: any;
  }>) {
    // Required string fields
    const requiredFields = [
      { field: 'first_name', name: 'First Name' },
      { field: 'last_name', name: 'Last Name' },
      { field: 'birth_date', name: 'Birth Date' },
      { field: 'birth_place', name: 'Birth Place' },
      { field: 'complete_address', name: 'Complete Address' }
    ];
    
    requiredFields.forEach(({ field, name }) => {
      const value = row[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        errors.push({
          row: rowNumber,
          field,
          message: `${name} is required`,
          value
        });
      }
    });
    
    // Validate gender enum (already transformed to uppercase)
    const validGenders = ['MALE', 'FEMALE'];
    if (row.gender && !validGenders.includes(row.gender)) {
      errors.push({
        row: rowNumber,
        field: 'gender',
        message: 'Gender must be MALE or FEMALE',
        value: row.gender
      });
    }
    
    // Validate civil status enum (already transformed to uppercase)
    const validCivilStatus = ['SINGLE', 'MARRIED', 'WIDOWED', 'DIVORCED', 'SEPARATED'];
    if (row.civil_status && !validCivilStatus.includes(row.civil_status)) {
      errors.push({
        row: rowNumber,
        field: 'civil_status',
        message: 'Civil status must be one of: SINGLE, MARRIED, WIDOWED, DIVORCED, SEPARATED',
        value: row.civil_status
      });
    }
    
    // Validate employment status enum (already transformed to uppercase)
    const validEmploymentStatus = ['EMPLOYED', 'UNEMPLOYED', 'SELF_EMPLOYED', 'RETIRED', 'STUDENT', 'OFW'];
    if (row.employment_status && !validEmploymentStatus.includes(row.employment_status)) {
      errors.push({
        row: rowNumber,
        field: 'employment_status',
        message: 'Employment status must be one of: EMPLOYED, UNEMPLOYED, SELF_EMPLOYED, RETIRED, STUDENT, OFW',
        value: row.employment_status
      });
    }
    
    // Validate voter status enum (already transformed to uppercase)
    const validVoterStatus = ['NOT_REGISTERED', 'REGISTERED', 'DECEASED', 'TRANSFERRED'];
    if (row.voter_status && !validVoterStatus.includes(row.voter_status)) {
      errors.push({
        row: rowNumber,
        field: 'voter_status',
        message: 'Voter status must be one of: NOT_REGISTERED, REGISTERED, DECEASED, TRANSFERRED',
        value: row.voter_status
      });
    }
    
    // Validate birth date format (already parsed)
    if (row.birth_date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(row.birth_date)) {
        errors.push({
          row: rowNumber,
          field: 'birth_date',
          message: 'Birth date must be in YYYY-MM-DD format',
          value: row.birth_date
        });
      }
    }
    
    // Validate email format (if provided)
    if (row.email_address && row.email_address !== null) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(row.email_address)) {
        errors.push({
          row: rowNumber,
          field: 'email_address',
          message: 'Invalid email format',
          value: row.email_address
        });
      }
    }
    
    // Validate mobile number format (if provided)
    if (row.mobile_number && row.mobile_number !== null) {
      const phoneRegex = /^09\d{9}$/;
      if (!phoneRegex.test(row.mobile_number.replace(/\s/g, ''))) {
        errors.push({
          row: rowNumber,
          field: 'mobile_number',
          message: 'Mobile number must be in format 09XXXXXXXXX',
          value: row.mobile_number
        });
      }
    }
    
    // Validate age (if provided)
    if (row.age !== null && row.age !== undefined) {
      const age = Number(row.age);
      if (isNaN(age) || age < 0 || age > 150) {
        errors.push({
          row: rowNumber,
          field: 'age',
          message: 'Age must be a valid number between 0 and 150',
          value: row.age
        });
      }
    }
    
    // Validate boolean fields (already transformed to boolean)
    const booleanFields = ['senior_citizen', 'person_with_disability', 'four_ps_beneficiary', 'indigenous_people'];
    booleanFields.forEach(field => {
      if (row[field] !== null && row[field] !== undefined && typeof row[field] !== 'boolean') {
        errors.push({
          row: rowNumber,
          field,
          message: `${field} must be true or false`,
          value: row[field]
        });
      }
    });
  }

  /**
   * Validate a single household row
   */
  private validateHouseholdRow(row: Record<string, any>, rowNumber: number, errors: Array<{
    row: number;
    field: string;
    message: string;
    value: any;
  }>) {
    // Debug log to see what data we're getting
    console.log('Validating household row:', rowNumber, row);
    
    // Required string fields
    const requiredFields = [
      { field: 'household_number', name: 'Household Number' },
      { field: 'household_type', name: 'Household Type' }, // This is REQUIRED!
      { field: 'house_number', name: 'House Number' },
      { field: 'street_sitio', name: 'Street/Sitio' },
      { field: 'barangay', name: 'Barangay' },
      { field: 'complete_address', name: 'Complete Address' }
    ];
    
    requiredFields.forEach(({ field, name }) => {
      const value = row[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        errors.push({
          row: rowNumber,
          field,
          message: `${name} is required`,
          value: value || 'EMPTY'
        });
      }
    });
    
    // Validate household type enum (REQUIRED field)
    const validHouseholdTypes = ['NUCLEAR', 'EXTENDED', 'SINGLE', 'SINGLE_PARENT', 'OTHER'];
    if (!row.household_type) {
      errors.push({
        row: rowNumber,
        field: 'household_type',
        message: 'Household type is required',
        value: 'MISSING'
      });
    } else if (!validHouseholdTypes.includes(row.household_type)) {
      errors.push({
        row: rowNumber,
        field: 'household_type',
        message: `Household type must be one of: ${validHouseholdTypes.join(', ')}. Got: "${row.household_type}"`,
        value: row.household_type
      });
    }
    
    // Validate monthly income enum (if provided, already transformed to uppercase)
    const validIncomeRanges = ['BELOW_10000', 'RANGE_10000_25000', 'RANGE_25000_50000', 'RANGE_50000_100000', 'ABOVE_100000'];
    if (row.monthly_income && row.monthly_income !== null && !validIncomeRanges.includes(row.monthly_income)) {
      errors.push({
        row: rowNumber,
        field: 'monthly_income',
        message: `Monthly income must be one of: ${validIncomeRanges.join(', ')}. Got: "${row.monthly_income}"`,
        value: row.monthly_income
      });
    }
    
    // Validate house type enum (if provided, already transformed to uppercase)
    const validHouseTypes = ['CONCRETE', 'SEMI_CONCRETE', 'WOOD', 'BAMBOO', 'MIXED'];
    if (row.house_type && row.house_type !== null && !validHouseTypes.includes(row.house_type)) {
      errors.push({
        row: rowNumber,
        field: 'house_type',
        message: `House type must be one of: ${validHouseTypes.join(', ')}. Got: "${row.house_type}"`,
        value: row.house_type
      });
    }
    
    // Validate ownership status enum (if provided, already transformed to uppercase)
    const validOwnershipStatus = ['OWNED', 'RENTED', 'SHARED', 'INFORMAL_SETTLER'];
    if (row.ownership_status && row.ownership_status !== null && !validOwnershipStatus.includes(row.ownership_status)) {
      errors.push({
        row: rowNumber,
        field: 'ownership_status',
        message: `Ownership status must be one of: ${validOwnershipStatus.join(', ')}. Got: "${row.ownership_status}"`,
        value: row.ownership_status
      });
    }
    
    // Validate boolean fields (already transformed to boolean)
    const booleanFields = [
      'four_ps_beneficiary', 'indigent_family', 'has_senior_citizen', 
      'has_pwd_member', 'has_electricity', 'has_water_supply', 'has_internet_access'
    ];
    booleanFields.forEach(field => {
      if (row[field] !== null && row[field] !== undefined && typeof row[field] !== 'boolean') {
        errors.push({
          row: rowNumber,
          field,
          message: `${field} must be true or false`,
          value: row[field]
        });
      }
    });
  }

  /**
   * Parse Excel boolean values
   */
  private parseExcelBoolean(value: any): boolean {
    if (typeof value === 'boolean') return value;
    if (value === null || value === undefined || value === '') return false;
    
    const strValue = String(value).toUpperCase().trim();
    return ['TRUE', '1', 'YES', 'Y', 'CHECKED'].includes(strValue);
  }

  /**
   * Parse Excel date values
   */
  private parseExcelDate(value: any): string {
    if (!value) return '';
    
    // Handle Excel serial date numbers
    if (typeof value === 'number') {
      const date = new Date((value - 25569) * 86400 * 1000);
      return date.toISOString().split('T')[0];
    }
    
    // Handle date objects
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
    
    // Try to parse string dates
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (e) {
      // Fall through
    }
    
    // Return as-is if can't parse
    return String(value);
  }

  /**
   * Get header mapping for different import types
   */
  private getHeaderMapping(type: ImportType): Record<string, string> {
    if (type === 'RESIDENTS') {
      return {
        // Common variations
        'First Name': 'first_name',
        'Last Name': 'last_name',
        'Middle Name': 'middle_name',
        'Suffix': 'suffix',
        'Birth Date': 'birth_date',
        'Birthdate': 'birth_date',
        'Date of Birth': 'birth_date',
        'Birth Place': 'birth_place',
        'Place of Birth': 'birth_place',
        'Age': 'age',
        'Gender': 'gender',
        'Sex': 'gender',
        'Civil Status': 'civil_status',
        'Marital Status': 'civil_status',
        'Nationality': 'nationality',
        'Religion': 'religion',
        'Employment Status': 'employment_status',
        'Work Status': 'employment_status',
        'Educational Attainment': 'educational_attainment',
        'Education': 'educational_attainment',
        'Mobile Number': 'mobile_number',
        'Cell Number': 'mobile_number',
        'Contact Number': 'mobile_number',
        'Email Address': 'email_address',
        'Email': 'email_address',
        'Complete Address': 'complete_address',
        'Address': 'complete_address',
        'Occupation': 'occupation',
        'Job': 'occupation',
        'Employer': 'employer',
        'Company': 'employer',
        'Senior Citizen': 'senior_citizen',
        'Is Senior': 'senior_citizen',
        'Person with Disability': 'person_with_disability',
        'PWD': 'person_with_disability',
        'Has Disability': 'person_with_disability',
        '4Ps Beneficiary': 'four_ps_beneficiary',
        '4PS': 'four_ps_beneficiary',
        'Voter Status': 'voter_status',
        'Voting Status': 'voter_status',
      };
    } else {
      return {
        'Household Number': 'household_number',
        'Household No': 'household_number',
        'HH Number': 'household_number',
        'Household Type': 'household_type',
        'Family Type': 'household_type',
        'House Number': 'house_number',
        'House No': 'house_number',
        'Street/Sitio': 'street_sitio',
        'Street': 'street_sitio',
        'Sitio': 'street_sitio',
        'Barangay': 'barangay',
        'Complete Address': 'complete_address',
        'Address': 'complete_address',
        'Monthly Income': 'monthly_income',
        'Income Range': 'monthly_income',
        'Primary Income Source': 'primary_income_source',
        'Income Source': 'primary_income_source',
        '4Ps Beneficiary': 'four_ps_beneficiary',
        '4PS': 'four_ps_beneficiary',
        'Indigent Family': 'indigent_family',
        'Is Indigent': 'indigent_family',
        'Has Senior Citizen': 'has_senior_citizen',
        'With Senior': 'has_senior_citizen',
        'Has PWD Member': 'has_pwd_member',
        'With PWD': 'has_pwd_member',
        'House Type': 'house_type',
        'Housing Type': 'house_type',
        'Ownership Status': 'ownership_status',
        'House Ownership': 'ownership_status',
        'Has Electricity': 'has_electricity',
        'With Electricity': 'has_electricity',
        'Has Water Supply': 'has_water_supply',
        'With Water': 'has_water_supply',
        'Has Internet Access': 'has_internet_access',
        'With Internet': 'has_internet_access',
        'Remarks': 'remarks',
        'Notes': 'remarks',
      };
    }
  }

  /**
   * Import residents data (send to backend)
   */
  async importResidents(file: File, options?: {
    skipHeader?: boolean;
    validateOnly?: boolean;
  }): Promise<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'RESIDENTS');
    
    if (options?.skipHeader) {
      formData.append('skipHeader', 'true');
    }
    if (options?.validateOnly) {
      formData.append('validateOnly', 'true');
    }

    const responseSchema = ApiResponseSchema(ImportResultSchema);
    
    const response = await this.request(
      '/import/residents',
      responseSchema,
      {
        method: 'POST',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (!response.data) {
      throw new Error('Failed to import residents');
    }

    return response.data;
  }

  /**
   * Import households data (send to backend)
   */
  async importHouseholds(file: File, options?: {
    skipHeader?: boolean;
    validateOnly?: boolean;
  }): Promise<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'HOUSEHOLDS');
    
    if (options?.skipHeader) {
      formData.append('skipHeader', 'true');
    }
    if (options?.validateOnly) {
      formData.append('validateOnly', 'true');
    }

    const responseSchema = ApiResponseSchema(ImportResultSchema);
    
    const response = await this.request(
      '/import/households',
      responseSchema,
      {
        method: 'POST',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (!response.data) {
      throw new Error('Failed to import households');
    }

    return response.data;
  }

  /**
   * Get import history
   */
  async getImportHistory(params: ImportParams = {}): Promise<PaginatedResponse<ImportHistoryItem>> {
    // Validate input parameters
    const validatedParams = ImportParamsSchema.parse(params);
    
    // Build query string
    const searchParams = new URLSearchParams();
    Object.entries(validatedParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    const paginatedSchema = PaginatedResponseSchema(ImportHistoryItemSchema);
    
    return this.request(
      `/import/history?${searchParams.toString()}`,
      paginatedSchema,
      { method: 'GET' }
    );
  }

  /**
   * Generate and download import template locally
   */
  async downloadTemplate(type: ImportType): Promise<Blob> {
    try {
      // Create template data based on type
      const templateData = this.generateTemplateData(type);
      
      // Create workbook
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(templateData);
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, type);
      
      // Generate Excel file buffer
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      
      // Create blob
      return new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
    } catch (error) {
      console.error(`Template generation failed for ${type}:`, error);
      throw new Error(`Template generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate template data based on import type
   */
  private generateTemplateData(type: ImportType) {
    if (type === 'RESIDENTS') {
      return [
        {
          'First Name': 'John',
          'Last Name': 'Doe',
          'Middle Name': 'Smith',
          'Suffix': 'Jr.',
          'Birth Date': '1990-01-01',
          'Birth Place': 'Quezon City',
          'Age': '34',
          'Gender': 'MALE',
          'Civil Status': 'SINGLE',
          'Nationality': 'FILIPINO',
          'Religion': 'CATHOLIC',
          'Employment Status': 'EMPLOYED',
          'Educational Attainment': 'COLLEGE',
          'Mobile Number': '09123456789',
          'Email Address': 'john.doe@email.com',
          'Complete Address': '123 Main Street, Barangay Sample',
          'Occupation': 'Engineer',
          'Employer': 'ABC Company',
          'Senior Citizen': 'FALSE',
          'Person with Disability': 'FALSE',
          '4Ps Beneficiary': 'FALSE',
          'Voter Status': 'REGISTERED'
        }
      ];
    } else {
      return [
        {
          'Household Number': 'HH001',
          'Household Type': 'NUCLEAR',
          'House Number': '123',
          'Street/Sitio': 'Main Street',
          'Barangay': 'West Triangle',
          'Complete Address': '123 Main Street, West Triangle',
          'Monthly Income': 'RANGE_25000_50000',
          'Primary Income Source': 'Employment',
          '4Ps Beneficiary': 'FALSE',
          'Indigent Family': 'FALSE',
          'Has Senior Citizen': 'FALSE',
          'Has PWD Member': 'FALSE',
          'House Type': 'CONCRETE',
          'Ownership Status': 'OWNED',
          'Has Electricity': 'TRUE',
          'Has Water Supply': 'TRUE',
          'Has Internet Access': 'TRUE',
          'Remarks': 'Sample household data'
        }
      ];
    }
  }

  /**
   * Validate file format and size
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel' // .xls
    ];

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Please upload a valid Excel file (.xlsx or .xls)' };
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 10MB' };
    }

    return { valid: true };
  }
}

export const importService = new ImportService();