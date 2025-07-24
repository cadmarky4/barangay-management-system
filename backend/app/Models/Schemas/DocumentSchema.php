<?php

namespace App\Models\Schemas;

/**
 * Centralized schema definition for Document model
 * Based on the original Zod schema structure with unified table approach
 */
class DocumentSchema
{
    /**
     * Complete field definitions for documents
     */
    public static function getFields(): array
    {
        return [
            // Basic Document Information
            'document_type' => ['type' => 'string', 'max' => 255, 'required' => true],
            'resident_id' => ['type' => 'foreignId', 'references' => 'residents.id', 'required' => true],
            'applicant_name' => ['type' => 'string', 'max' => 255, 'required' => true],
            'purpose' => ['type' => 'text', 'required' => true],
            
            // Contact Information
            'applicant_address' => ['type' => 'text', 'nullable' => true],
            'applicant_contact' => ['type' => 'string', 'max' => 20, 'nullable' => true],
            'applicant_email' => ['type' => 'string', 'max' => 255, 'nullable' => true],
            
            // Request Details
            'priority' => ['type' => 'string', 'max' => 50, 'default' => 'NORMAL'],
            'needed_date' => ['type' => 'date', 'nullable' => true],
            'processing_fee' => ['type' => 'decimal', 'precision' => 10, 'scale' => 2, 'default' => 0],
            
            // Document Status and Payment
            'status' => ['type' => 'string', 'max' => 50, 'default' => 'PENDING'],
            'payment_status' => ['type' => 'string', 'max' => 50, 'default' => 'UNPAID'],
            
            // System tracking fields
            'document_number' => ['type' => 'string', 'max' => 255, 'nullable' => true, 'unique' => true],
            'serial_number' => ['type' => 'string', 'max' => 255, 'nullable' => true, 'unique' => true],
            'request_date' => ['type' => 'timestamp', 'default' => 'current'],
            'processed_date' => ['type' => 'timestamp', 'nullable' => true],
            'approved_date' => ['type' => 'timestamp', 'nullable' => true],
            'released_date' => ['type' => 'timestamp', 'nullable' => true],
            
            // Document Specific Fields (Barangay Clearance)
            'clearance_purpose' => ['type' => 'string', 'max' => 255, 'nullable' => true],
            'clearance_type' => ['type' => 'string', 'max' => 255, 'nullable' => true],
            
            // Document Specific Fields (Business Permit)
            'business_name' => ['type' => 'string', 'max' => 255, 'nullable' => true],
            'business_type' => ['type' => 'string', 'max' => 255, 'nullable' => true],
            'business_address' => ['type' => 'text', 'nullable' => true],
            'business_owner' => ['type' => 'string', 'max' => 255, 'nullable' => true],
            
            // Document Specific Fields (Certificate of Indigency)
            'indigency_reason' => ['type' => 'text', 'nullable' => true],
            'monthly_income' => ['type' => 'decimal', 'precision' => 10, 'scale' => 2, 'nullable' => true],
            'family_size' => ['type' => 'integer', 'nullable' => true],
            
            // Document Specific Fields (Certificate of Residency)
            'residency_period' => ['type' => 'string', 'max' => 255, 'nullable' => true],
            'previous_address' => ['type' => 'text', 'nullable' => true],
            
            // Processing Information
            'requirements_submitted' => ['type' => 'json', 'nullable' => true],
            'notes' => ['type' => 'text', 'nullable' => true],
            'remarks' => ['type' => 'text', 'nullable' => true],
            
            // Officials
            'certifying_official' => ['type' => 'string', 'max' => 255, 'nullable' => true],
            'processed_by' => ['type' => 'foreignId', 'references' => 'users.id', 'nullable' => true],
            'approved_by' => ['type' => 'foreignId', 'references' => 'users.id', 'nullable' => true],
            'released_by' => ['type' => 'foreignId', 'references' => 'users.id', 'nullable' => true],
            
            // Additional tracking
            'expiry_date' => ['type' => 'date', 'nullable' => true],
        ];
    }
    
    /**
     * Get fillable fields for the model
     */
    public static function getFillableFields(): array
    {
        return array_keys(static::getFields());
    }
    
    /**
     * Get validation rules for create operations
     */
    public static function getCreateValidationRules(): array
    {
        $rules = [];
        foreach (static::getFields() as $field => $config) {
            $fieldRules = [];
            
            if (isset($config['required']) && $config['required']) {
                $fieldRules[] = 'required';
            } else {
                $fieldRules[] = 'nullable';
            }
            
            if ($config['type'] === 'string') {
                $fieldRules[] = 'string';
                if (isset($config['max'])) {
                    $fieldRules[] = "max:{$config['max']}";
                }
                if (isset($config['unique']) && $config['unique']) {
                    $fieldRules[] = 'unique:documents,' . $field;
                }
            } elseif ($config['type'] === 'text') {
                $fieldRules[] = 'string';
            } elseif ($config['type'] === 'date') {
                $fieldRules[] = 'date';
            } elseif ($config['type'] === 'timestamp') {
                $fieldRules[] = 'date';
            } elseif ($config['type'] === 'integer') {
                $fieldRules[] = 'integer';
                $fieldRules[] = 'min:0';
            } elseif ($config['type'] === 'decimal') {
                $fieldRules[] = 'numeric';
                $fieldRules[] = 'min:0';
            } elseif ($config['type'] === 'foreignId') {
                if (isset($config['references'])) {
                    $table = explode('.', $config['references'])[0];
                    $fieldRules[] = "exists:{$table},id";
                }
            } elseif ($config['type'] === 'json') {
                $fieldRules[] = 'array';
            }
            
            // Handle email validation for applicant_email
            if ($field === 'applicant_email') {
                $fieldRules[] = 'email';
            }
            
            $rules[$field] = implode('|', $fieldRules);
        }
        
        return $rules;
    }
    
    /**
     * Get validation rules for update operations
     */
    public static function getUpdateValidationRules(): array
    {
        $rules = static::getCreateValidationRules();
        
        // Make required fields optional for updates
        foreach ($rules as $field => $rule) {
            if (str_starts_with($rule, 'required')) {
                $rules[$field] = 'sometimes|' . $rule;
            }
        }
        
        // Handle unique fields for updates
        if (isset($rules['document_number'])) {
            $rules['document_number'] = str_replace('unique:documents,document_number', 'unique:documents,document_number,{id}', $rules['document_number']);
        }
        if (isset($rules['serial_number'])) {
            $rules['serial_number'] = str_replace('unique:documents,serial_number', 'unique:documents,serial_number,{id}', $rules['serial_number']);
        }
        
        return $rules;
    }
    
    /**
     * Get casts for the model
     */
    public static function getCasts(): array
    {
        $casts = [];
        foreach (static::getFields() as $field => $config) {
            if ($config['type'] === 'date') {
                $casts[$field] = 'date';
            } elseif ($config['type'] === 'timestamp') {
                $casts[$field] = 'datetime';
            } elseif ($config['type'] === 'decimal') {
                $casts[$field] = "decimal:{$config['scale']}";
            } elseif ($config['type'] === 'integer') {
                $casts[$field] = 'integer';
            } elseif ($config['type'] === 'json') {
                $casts[$field] = 'array';
            }
        }
        
        return $casts;
    }
    
    /**
     * Get document type options
     */
    public static function getDocumentTypes(): array
    {
        return [
            'BARANGAY_CLEARANCE' => 'Barangay Clearance',
            'CERTIFICATE_OF_RESIDENCY' => 'Certificate of Residency',
            'CERTIFICATE_OF_INDIGENCY' => 'Certificate of Indigency',
            'BUSINESS_PERMIT' => 'Business Permit',
            'BUILDING_PERMIT' => 'Building Permit',
            'FIRST_TIME_JOB_SEEKER' => 'First Time Job Seeker',
            'SENIOR_CITIZEN_ID' => 'Senior Citizen ID',
            'PWD_ID' => 'PWD ID',
            'BARANGAY_ID' => 'Barangay ID',
            'OTHERS' => 'Others',
        ];
    }
    
    /**
     * Get priority options
     */
    public static function getPriorityOptions(): array
    {
        return [
            'LOW' => 'Low',
            'NORMAL' => 'Normal',
            'HIGH' => 'High',
            'URGENT' => 'Urgent',
        ];
    }
    
    /**
     * Get status options
     */
    public static function getStatusOptions(): array
    {
        return [
            'PENDING' => 'Pending',
            'UNDER_REVIEW' => 'Under Review',
            'APPROVED' => 'Approved',
            'RELEASED' => 'Released',
            'REJECTED' => 'Rejected',
            'CANCELLED' => 'Cancelled',
        ];
    }
    
    /**
     * Get payment status options
     */
    public static function getPaymentStatusOptions(): array
    {
        return [
            'UNPAID' => 'Unpaid',
            'PAID' => 'Paid',
            'WAIVED' => 'Waived',
        ];
    }
}