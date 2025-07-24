<?php

namespace App\Models\Schemas;

/**
 * Centralized schema definition for Project model
 * This serves as the single source of truth for all project-related data structure
 */
class ProjectSchema
{
    /**
     * Complete field definitions for projects
     */
    public static function getFields(): array
    {
        return [
            // Basic Information
            'project_code' => ['type' => 'string', 'max' => 50, 'required' => true, 'unique' => true],
            'title' => ['type' => 'string', 'max' => 255, 'required' => true],
            'description' => ['type' => 'text', 'required' => true],
            'objectives' => ['type' => 'text', 'nullable' => true],
            'expected_outcomes' => ['type' => 'text', 'nullable' => true],
            
            // Classification
            'category' => ['type' => 'enum', 'values' => ['INFRASTRUCTURE', 'HEALTH', 'EDUCATION', 'LIVELIHOOD', 'ENVIRONMENT', 'SOCIAL_SERVICES', 'GOVERNANCE', 'PEACE_AND_ORDER', 'OTHERS'], 'required' => true],
            'type' => ['type' => 'enum', 'values' => ['GOVERNMENT_FUNDED', 'DONOR_FUNDED', 'PRIVATE_PARTNERSHIP', 'COMMUNITY_INITIATED', 'SPECIAL_PROJECT'], 'required' => true],
            'priority' => ['type' => 'enum', 'values' => ['LOW', 'NORMAL', 'HIGH', 'CRITICAL'], 'default' => 'NORMAL'],
            
            // Timeline
            'start_date' => ['type' => 'date', 'required' => true],
            'end_date' => ['type' => 'date', 'required' => true],
            'actual_start_date' => ['type' => 'date', 'nullable' => true],
            'actual_end_date' => ['type' => 'date', 'nullable' => true],
            'duration_days' => ['type' => 'integer', 'min' => 1, 'nullable' => true],
            
            // Budget Information
            'total_budget' => ['type' => 'decimal', 'precision' => 15, 'scale' => 2, 'min' => 0, 'required' => true],
            'allocated_budget' => ['type' => 'decimal', 'precision' => 15, 'scale' => 2, 'min' => 0, 'default' => 0],
            'utilized_budget' => ['type' => 'decimal', 'precision' => 15, 'scale' => 2, 'min' => 0, 'default' => 0],
            'remaining_budget' => ['type' => 'decimal', 'precision' => 15, 'scale' => 2, 'default' => 0],
            
            // Funding
            'funding_source' => ['type' => 'enum', 'values' => ['NATIONAL_GOVERNMENT', 'LOCAL_GOVERNMENT', 'PROVINCIAL_GOVERNMENT', 'DONOR_AGENCY', 'PRIVATE_SECTOR', 'COMMUNITY_FUND', 'MIXED'], 'required' => true],
            'funding_agency' => ['type' => 'string', 'max' => 255, 'nullable' => true],
            
            // Location & Beneficiaries
            'location' => ['type' => 'string', 'max' => 255, 'required' => true],
            'target_puroks' => ['type' => 'json', 'nullable' => true],
            'target_beneficiaries' => ['type' => 'integer', 'min' => 0, 'nullable' => true],
            'actual_beneficiaries' => ['type' => 'integer', 'min' => 0, 'nullable' => true],
            'beneficiary_criteria' => ['type' => 'text', 'nullable' => true],
            
            // Status & Progress
            'status' => ['type' => 'enum', 'values' => ['PLANNING', 'APPROVED', 'ONGOING', 'COMPLETED', 'SUSPENDED', 'CANCELLED', 'ON_HOLD'], 'default' => 'PLANNING'],
            'progress_percentage' => ['type' => 'integer', 'min' => 0, 'max' => 100, 'default' => 0],
            
            // Personnel
            'project_manager_id' => ['type' => 'foreignId', 'references' => 'users.id', 'nullable' => true],
            'approving_official_id' => ['type' => 'foreignId', 'references' => 'users.id', 'nullable' => true],
            'approved_date' => ['type' => 'date', 'nullable' => true],
            
            // Documentation
            'attachments' => ['type' => 'json', 'nullable' => true],
            'remarks' => ['type' => 'text', 'nullable' => true],
            'completion_report' => ['type' => 'text', 'nullable' => true],
            'lessons_learned' => ['type' => 'text', 'nullable' => true],
            
            // Monitoring & Evaluation
            'last_monitoring_date' => ['type' => 'date', 'nullable' => true],
            'monitoring_remarks' => ['type' => 'text', 'nullable' => true],
            'quality_rating' => ['type' => 'integer', 'min' => 1, 'max' => 5, 'nullable' => true],
            'evaluation_notes' => ['type' => 'text', 'nullable' => true],
            
            // Risks & Issues
            'risks_identified' => ['type' => 'json', 'nullable' => true],
            'issues_encountered' => ['type' => 'text', 'nullable' => true],
            'mitigation_measures' => ['type' => 'text', 'nullable' => true],
            
            // Sustainability
            'sustainability_plan' => ['type' => 'text', 'nullable' => true],
            'maintenance_schedule' => ['type' => 'text', 'nullable' => true],
            'handover_date' => ['type' => 'date', 'nullable' => true],
            'handover_notes' => ['type' => 'text', 'nullable' => true],
            
            // Performance Indicators
            'kpi_targets' => ['type' => 'json', 'nullable' => true],
            'kpi_actual' => ['type' => 'json', 'nullable' => true],
            'success_indicators' => ['type' => 'text', 'nullable' => true],
            
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
                    $fieldRules[] = 'unique:projects,' . $field;
                }
            } elseif ($config['type'] === 'date') {
                $fieldRules[] = 'date';
            } elseif ($config['type'] === 'enum') {
                $fieldRules[] = 'in:' . implode(',', $config['values']);
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
