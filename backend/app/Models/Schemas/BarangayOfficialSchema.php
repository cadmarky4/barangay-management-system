<?php

namespace App\Models\Schemas;

/**
 * Centralized schema definition for BarangayOfficial model
 * This serves as the single source of truth for all barangay official-related data structure
 */
class BarangayOfficialSchema
{
    /**
     * Complete field definitions for barangay officials
     */
    public static function getFields(): array
    {
        return [
            // Personal Information
            'first_name' => ['type' => 'string', 'max' => 255, 'required' => true],
            'last_name' => ['type' => 'string', 'max' => 255, 'required' => true],
            'middle_name' => ['type' => 'string', 'max' => 255, 'nullable' => true],
            'suffix' => ['type' => 'string', 'max' => 10, 'nullable' => true],
            'birth_date' => ['type' => 'date', 'required' => true],
            'gender' => ['type' => 'enum', 'values' => ['MALE', 'FEMALE'], 'required' => true],
            
            // Contact Information
            'contact_number' => ['type' => 'string', 'max' => 20, 'nullable' => true],
            'email_address' => ['type' => 'email', 'max' => 255, 'nullable' => true],
            'address' => ['type' => 'text', 'required' => true],
            
            // Official Position
            'position' => ['type' => 'enum', 'values' => ['PUNONG_BARANGAY', 'BARANGAY_KAGAWAD', 'SK_CHAIRPERSON', 'BARANGAY_SECRETARY', 'BARANGAY_TREASURER', 'LUPON_MEMBER', 'OTHER'], 'required' => true],
            'position_title' => ['type' => 'string', 'max' => 255, 'nullable' => true],
            'committee_assignments' => ['type' => 'json', 'nullable' => true],
            'committee_memberships' => ['type' => 'json', 'nullable' => true],
            
            // Term Information
            'term_start' => ['type' => 'date', 'required' => true],
            'term_end' => ['type' => 'date', 'required' => true],
            'term_number' => ['type' => 'integer', 'min' => 0, 'default' => 1, 'nullable' => true],
            'is_current_term' => ['type' => 'boolean', 'default' => true],
            
            // Election Information
            'election_date' => ['type' => 'date', 'nullable' => true],
            'votes_received' => ['type' => 'integer', 'min' => 0, 'nullable' => true],
            'is_elected' => ['type' => 'boolean', 'default' => true],
            'appointment_document' => ['type' => 'string', 'max' => 500, 'nullable' => true],
            
            // Status
            'status' => ['type' => 'enum', 'values' => ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'RESIGNED', 'TERMINATED', 'DECEASED'], 'default' => 'ACTIVE'],
            'status_date' => ['type' => 'date', 'nullable' => true],
            'status_reason' => ['type' => 'text', 'nullable' => true],
            
            // Educational & Professional Background
            'educational_background' => ['type' => 'text', 'nullable' => true],
            'work_experience' => ['type' => 'text', 'nullable' => true],
            'skills_expertise' => ['type' => 'text', 'nullable' => true],
            'trainings_attended' => ['type' => 'json', 'nullable' => true],
            'certifications' => ['type' => 'json', 'nullable' => true],
            
            // Performance & Accomplishments
            'major_accomplishments' => ['type' => 'text', 'nullable' => true],
            'projects_initiated' => ['type' => 'json', 'nullable' => true],
            'performance_notes' => ['type' => 'text', 'nullable' => true],
            'performance_rating' => ['type' => 'integer', 'min' => 1, 'max' => 5, 'nullable' => true],
            
            // Emergency Contact
            'emergency_contact_name' => ['type' => 'string', 'max' => 255, 'nullable' => true],
            'emergency_contact_number' => ['type' => 'string', 'max' => 20, 'nullable' => true],
            'emergency_contact_relationship' => ['type' => 'string', 'max' => 100, 'nullable' => true],
            
            // Social Media & Communication
            'social_media_accounts' => ['type' => 'json', 'nullable' => true],
            
            // Documents & Files
            'documents' => ['type' => 'json', 'nullable' => true],
            'profile_photo' => ['type' => 'string', 'max' => 500, 'nullable' => true],
            'digital_signature' => ['type' => 'string', 'max' => 500, 'nullable' => true],
            
            // Oath & Legal
            'oath_taking_date' => ['type' => 'date', 'nullable' => true],
            'oath_taking_notes' => ['type' => 'text', 'nullable' => true],
            'legal_issues' => ['type' => 'text', 'nullable' => true],
            'ethical_violations' => ['type' => 'text', 'nullable' => true],
            
            // Attendance & Participation
            'session_attendance_rate' => ['type' => 'decimal', 'precision' => 5, 'scale' => 2, 'min' => 0, 'max' => 100, 'nullable' => true],
            'committee_participation' => ['type' => 'text', 'nullable' => true],
            'community_engagement' => ['type' => 'text', 'nullable' => true],
            
            // Additional Information
            'remarks' => ['type' => 'text', 'nullable' => true],
            'bio_summary' => ['type' => 'text', 'nullable' => true],
            'personal_mission' => ['type' => 'text', 'nullable' => true],
            
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
            } elseif ($config['type'] === 'email') {
                $fieldRules[] = 'email';
                if (isset($config['max'])) {
                    $fieldRules[] = "max:{$config['max']}";
                }
            } elseif ($config['type'] === 'date') {
                $fieldRules[] = 'date';
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
            } elseif ($config['type'] === 'decimal') {
                $fieldRules[] = 'numeric';
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
            } elseif ($config['type'] === 'boolean') {
                $casts[$field] = 'boolean';
            } elseif ($config['type'] === 'integer') {
                $casts[$field] = 'integer';
            } elseif ($config['type'] === 'decimal') {
                $casts[$field] = "decimal:{$config['scale']}";
            } elseif ($config['type'] === 'json') {
                $casts[$field] = 'array';
            }
        }
        
        return $casts;
    }
}
