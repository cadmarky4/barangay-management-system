<?php

namespace App\Models\Schemas;

/**
 * Centralized schema definition for Complaint model
 * This serves as the single source of truth for all complaint-related data structure
 */
class ComplaintSchema
{    /**
     * Complete field definitions for complaints
     */
    public static function getFields(): array
    {
        return [
            // Basic Information (matching frontend)
            'complaint_number' => ['type' => 'string', 'max' => 255, 'required' => true, 'unique' => true],
            'full_name' => ['type' => 'string', 'max' => 255, 'required' => true],
            'email' => ['type' => 'email', 'max' => 255, 'nullable' => true],
            'phone' => ['type' => 'string', 'max' => 20, 'nullable' => true],
            'address' => ['type' => 'text', 'required' => true],
            'complaint_category' => ['type' => 'string', 'max' => 255, 'required' => true],
            'department' => ['type' => 'string', 'max' => 255, 'nullable' => true],
            'subject' => ['type' => 'string', 'max' => 255, 'required' => true],
            'description' => ['type' => 'text', 'required' => true],
            'location' => ['type' => 'string', 'max' => 255, 'nullable' => true],
            'urgency' => ['type' => 'enum', 'values' => ['low', 'medium', 'high', 'critical'], 'default' => 'medium'],
            'anonymous' => ['type' => 'boolean', 'default' => false],
            'attachments' => ['type' => 'text', 'nullable' => true],
            
            // System Processing Fields 
            'priority' => ['type' => 'enum', 'values' => ['LOW', 'NORMAL', 'HIGH', 'URGENT'], 'default' => 'NORMAL'],
            'category' => ['type' => 'enum', 'values' => ['SERVICE_RELATED', 'OFFICIAL_MISCONDUCT', 'FACILITY_ISSUE', 'PROCESS_COMPLAINT', 'DISCRIMINATION', 'CORRUPTION', 'OTHERS'], 'nullable' => true],
            
            // Complainant Information (legacy fields for backward compatibility)
            'resident_id' => ['type' => 'foreignId', 'references' => 'residents.id', 'nullable' => true],
            'complainant_name' => ['type' => 'string', 'max' => 255, 'nullable' => true],
            'complainant_contact' => ['type' => 'string', 'max' => 20, 'nullable' => true],
            'complainant_email' => ['type' => 'email', 'max' => 255, 'nullable' => true],
            'complainant_address' => ['type' => 'text', 'nullable' => true],
            'is_anonymous' => ['type' => 'boolean', 'default' => false],
            
            // Incident Details
            'incident_location' => ['type' => 'string', 'max' => 255, 'nullable' => true],
            'incident_date' => ['type' => 'date', 'nullable' => true],
            'incident_time' => ['type' => 'time', 'nullable' => true],
            'persons_involved' => ['type' => 'json', 'nullable' => true],
            'witnesses' => ['type' => 'json', 'nullable' => true],
            
            // Status & Timeline
            'status' => ['type' => 'enum', 'values' => ['RECEIVED', 'ACKNOWLEDGED', 'UNDER_REVIEW', 'INVESTIGATING', 'RESOLVED', 'CLOSED', 'DISMISSED'], 'default' => 'RECEIVED'],
            'date_received' => ['type' => 'date', 'required' => true],
            'acknowledged_date' => ['type' => 'date', 'nullable' => true],
            'target_resolution_date' => ['type' => 'date', 'nullable' => true],
            'actual_resolution_date' => ['type' => 'date', 'nullable' => true],
            
            // Assignment & Investigation
            'assigned_to' => ['type' => 'foreignId', 'references' => 'users.id', 'nullable' => true],
            'investigated_by' => ['type' => 'foreignId', 'references' => 'users.id', 'nullable' => true],
            'assigned_department' => ['type' => 'string', 'max' => 255, 'nullable' => true],
            
            // Actions & Resolution
            'actions_taken' => ['type' => 'text', 'nullable' => true],
            'resolution_details' => ['type' => 'text', 'nullable' => true],
            'recommendations' => ['type' => 'text', 'nullable' => true],
            'resolution_type' => ['type' => 'enum', 'values' => ['SATISFACTORY', 'PARTIAL', 'UNSATISFACTORY', 'DISMISSED', 'REFERRED'], 'nullable' => true],
            
            // Feedback & Satisfaction
            'satisfaction_rating' => ['type' => 'integer', 'min' => 1, 'max' => 5, 'nullable' => true],
            'complainant_feedback' => ['type' => 'text', 'nullable' => true],
            'is_feedback_received' => ['type' => 'boolean', 'default' => false],
            
            // Documents & Evidence
            'evidence_files' => ['type' => 'json', 'nullable' => true],
            'investigation_notes' => ['type' => 'text', 'nullable' => true],
            
            // Follow-up
            'requires_followup' => ['type' => 'boolean', 'default' => false],
            'followup_date' => ['type' => 'date', 'nullable' => true],
            'followup_notes' => ['type' => 'text', 'nullable' => true],
            
            // Classification & Tracking
            'is_valid' => ['type' => 'boolean', 'nullable' => true],
            'validity_assessment' => ['type' => 'text', 'nullable' => true],
            'is_escalated' => ['type' => 'boolean', 'default' => false],
            'escalation_reason' => ['type' => 'text', 'nullable' => true],
            'escalation_level' => ['type' => 'enum', 'values' => ['SUPERVISOR', 'MANAGER', 'DIRECTOR', 'EXTERNAL_AGENCY'], 'nullable' => true],
            
            // Communication
            'communication_log' => ['type' => 'json', 'nullable' => true],
            'preferred_contact_method' => ['type' => 'enum', 'values' => ['EMAIL', 'SMS', 'PHONE', 'IN_PERSON', 'MAIL'], 'nullable' => true],
            'updates_sent' => ['type' => 'json', 'nullable' => true],
            
            // Additional Information
            'remarks' => ['type' => 'text', 'nullable' => true],
            'internal_notes' => ['type' => 'text', 'nullable' => true],
            'tags' => ['type' => 'json', 'nullable' => true],
            
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
                    $fieldRules[] = 'unique:complaints,' . $field;
                }
            } elseif ($config['type'] === 'email') {
                $fieldRules[] = 'email';
                if (isset($config['max'])) {
                    $fieldRules[] = "max:{$config['max']}";
                }
            } elseif ($config['type'] === 'date') {
                $fieldRules[] = 'date';
            } elseif ($config['type'] === 'time') {
                $fieldRules[] = 'date_format:H:i';
            } elseif ($config['type'] === 'enum') {
                $fieldRules[] = 'in:' . implode(',', $config['values']);
            } elseif ($config['type'] === 'boolean') {
                $fieldRules[] = 'boolean';
            } elseif ($config['type'] === 'integer') {
                $fieldRules[] = 'integer';
                if (isset($config['min'])) {
                    $fieldRules[] = "min:{$config['min']}";
                }
                if (isset($config['max'])) {
                    $fieldRules[] = "max:{$config['max']}";
                }
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
            } elseif ($config['type'] === 'integer') {
                $casts[$field] = 'integer';
            } elseif ($config['type'] === 'json') {
                $casts[$field] = 'array';
            }
        }
        
        return $casts;
    }
}
