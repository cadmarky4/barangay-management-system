<?php

namespace App\Models\Schemas;

/**
 * Centralized schema definition for BlotterCase model
 * This serves as the single source of truth for all blotter case-related data structure
 */
class BlotterCaseSchema
{    /**
     * Complete field definitions for blotter cases
     */
    public static function getFields(): array
    {
        return [
            // Basic Case Information
            'case_number' => ['type' => 'string', 'max' => 255, 'required' => true, 'unique' => true],
            'case_title' => ['type' => 'string', 'max' => 255, 'required' => true],
            'case_description' => ['type' => 'text', 'required' => true],
            'case_type' => ['type' => 'enum', 'values' => ['CIVIL', 'CRIMINAL', 'ADMINISTRATIVE', 'DISPUTE', 'COMPLAINT', 'NOISE', 'BOUNDARY', 'DOMESTIC', 'OTHERS'], 'required' => true],
            
            // Complainant Information (based on frontend fields)
            'complainant_resident_id' => ['type' => 'foreignId', 'references' => 'residents.id', 'nullable' => true],
            'complainant_name' => ['type' => 'string', 'max' => 255, 'required' => true],
            'complainant_contact' => ['type' => 'string', 'max' => 20, 'nullable' => true],
            'complainant_address' => ['type' => 'text', 'required' => true],
            'complainant_email' => ['type' => 'email', 'max' => 255, 'nullable' => true],
            
            // Incident Details (based on frontend fields)
            'incident_type' => ['type' => 'enum', 'values' => ['Theft', 'Physical Assault', 'Verbal Assault', 'Property Damage', 'Disturbance', 'Trespassing', 'Fraud', 'Harassment', 'Domestic Dispute', 'Noise Complaint', 'Other'], 'required' => true],
            'incident_date' => ['type' => 'date', 'required' => true],
            'incident_time' => ['type' => 'time', 'nullable' => true],
            'incident_location' => ['type' => 'string', 'max' => 255, 'required' => true],
            'incident_description' => ['type' => 'text', 'required' => true],
            'witnesses' => ['type' => 'text', 'nullable' => true],
            'evidence' => ['type' => 'text', 'nullable' => true],
            
            // Respondent Information (based on frontend fields)
            'respondent_resident_id' => ['type' => 'foreignId', 'references' => 'residents.id', 'nullable' => true],
            'respondent_name' => ['type' => 'string', 'max' => 255, 'nullable' => true],
            'respondent_contact' => ['type' => 'string', 'max' => 20, 'nullable' => true],
            'respondent_address' => ['type' => 'text', 'nullable' => true],
            
            // Case Status & Processing
            'status' => ['type' => 'enum', 'values' => ['FILED', 'UNDER_INVESTIGATION', 'MEDIATION', 'HEARING_SCHEDULED', 'SETTLED', 'DISMISSED', 'REFERRED_TO_COURT', 'CLOSED'], 'default' => 'FILED'],
            'date_filed' => ['type' => 'date', 'required' => true],
            
            // Hearing Information
            'hearing_date' => ['type' => 'date', 'nullable' => true],
            'hearing_time' => ['type' => 'time', 'nullable' => true],
            'hearing_location' => ['type' => 'string', 'max' => 255, 'nullable' => true],
            
            // Personnel Assignment
            'investigating_officer' => ['type' => 'foreignId', 'references' => 'users.id', 'nullable' => true],
            'mediator_assigned' => ['type' => 'foreignId', 'references' => 'users.id', 'nullable' => true],
            'lupon_members' => ['type' => 'json', 'nullable' => true],
            
            // Resolution
            'settlement_agreement' => ['type' => 'text', 'nullable' => true],
            'settlement_date' => ['type' => 'date', 'nullable' => true],
            'resolution_type' => ['type' => 'enum', 'values' => ['AMICABLE_SETTLEMENT', 'MEDIATION', 'ARBITRATION', 'COURT_REFERRAL', 'DISMISSAL'], 'nullable' => true],
            
            // Documents & Reports
            'attachments' => ['type' => 'json', 'nullable' => true],
            'investigation_report' => ['type' => 'text', 'nullable' => true],
            'mediation_notes' => ['type' => 'text', 'nullable' => true],
            'court_documents' => ['type' => 'json', 'nullable' => true],
            
            // Follow-up & Monitoring
            'requires_monitoring' => ['type' => 'boolean', 'default' => false],
            'next_followup_date' => ['type' => 'date', 'nullable' => true],
            'followup_notes' => ['type' => 'text', 'nullable' => true],
            'compliance_status' => ['type' => 'enum', 'values' => ['COMPLIANT', 'NON_COMPLIANT', 'PARTIALLY_COMPLIANT', 'PENDING'], 'nullable' => true],
            
            // Priority & Classification
            'priority' => ['type' => 'enum', 'values' => ['LOW', 'NORMAL', 'HIGH', 'URGENT'], 'default' => 'NORMAL'],
            'is_confidential' => ['type' => 'boolean', 'default' => false],
            'tags' => ['type' => 'json', 'nullable' => true],
            
            // Additional Information
            'remarks' => ['type' => 'text', 'nullable' => true],
            'legal_basis' => ['type' => 'text', 'nullable' => true],
            'penalties_imposed' => ['type' => 'text', 'nullable' => true],
            
            // System Fields
            'created_by' => ['type' => 'foreignId', 'references' => 'users.id', 'nullable' => true],
            'updated_by' => ['type' => 'foreignId', 'references' => 'users.id', 'nullable' => true],
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
                    $fieldRules[] = 'unique:blotters,' . $field;
                }
            } elseif ($config['type'] === 'date') {
                $fieldRules[] = 'date';
            } elseif ($config['type'] === 'time') {
                $fieldRules[] = 'date_format:H:i';
            } elseif ($config['type'] === 'enum') {
                $fieldRules[] = 'in:' . implode(',', $config['values']);
            } elseif ($config['type'] === 'boolean') {
                $fieldRules[] = 'boolean';
            } elseif ($config['type'] === 'foreignId') {
                if (isset($config['references'])) {
                    $table = explode('.', $config['references'])[0];
                    $fieldRules[] = "exists:{$table},id";
                }
            } elseif ($config['type'] === 'json') {
                $fieldRules[] = 'array';
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
            } elseif ($config['type'] === 'time') {
                $casts[$field] = 'datetime:H:i';
            } elseif ($config['type'] === 'boolean') {
                $casts[$field] = 'boolean';
            } elseif ($config['type'] === 'json') {
                $casts[$field] = 'array';
            }
        }
        
        return $casts;
    }
}
