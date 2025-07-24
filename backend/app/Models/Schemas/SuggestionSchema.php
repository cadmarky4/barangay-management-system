<?php

namespace App\Models\Schemas;

/**
 * Centralized schema definition for Suggestion model
 * This serves as the single source of truth for all suggestion-related data structure
 */
class SuggestionSchema
{    /**
     * Complete field definitions for suggestions
     */
    public static function getFields(): array
    {
        return [
            // Basic Information
            'suggestion_number' => ['type' => 'string', 'max' => 255, 'required' => true, 'unique' => true],
            'title' => ['type' => 'string', 'max' => 255, 'required' => true],
            'description' => ['type' => 'text', 'required' => true],
            'category' => ['type' => 'enum', 'values' => ['Community Development', 'Infrastructure Improvement', 'Environmental Protection', 'Public Safety', 'Health Services', 'Education', 'Tourism and Culture', 'Economic Development', 'Digital Services', 'Transportation', 'Social Welfare', 'Youth and Sports', 'Senior Citizens Affairs', 'Other'], 'required' => true],
            
            // Suggester Information (based on frontend fields)
            'resident_id' => ['type' => 'foreignId', 'references' => 'residents.id', 'nullable' => true],
            'name' => ['type' => 'string', 'max' => 255, 'required' => true],
            'email' => ['type' => 'email', 'max' => 255, 'nullable' => true],
            'phone' => ['type' => 'string', 'max' => 20, 'nullable' => true],
            'is_resident' => ['type' => 'enum', 'values' => ['yes', 'no'], 'default' => 'yes'],
            
            // Suggestion Details (based on frontend fields)
            'benefits' => ['type' => 'text', 'nullable' => true],
            'implementation' => ['type' => 'text', 'nullable' => true],
            'resources' => ['type' => 'string', 'max' => 255, 'nullable' => true],            
            // Priority & Classification (based on frontend)
            'priority' => ['type' => 'enum', 'values' => ['low', 'medium', 'high'], 'default' => 'medium'],
            'allow_contact' => ['type' => 'boolean', 'default' => true],
            
            // Status & Processing
            'status' => ['type' => 'enum', 'values' => ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'IMPLEMENTED', 'DEFERRED'], 'default' => 'SUBMITTED'],
            'date_submitted' => ['type' => 'date', 'required' => true],
            'review_date' => ['type' => 'date', 'nullable' => true],
            'decision_date' => ['type' => 'date', 'nullable' => true],
            'implementation_date' => ['type' => 'date', 'nullable' => true],
            
            // Review & Decision
            'reviewed_by' => ['type' => 'foreignId', 'references' => 'users.id', 'nullable' => true],
            'review_comments' => ['type' => 'text', 'nullable' => true],
            'decision_remarks' => ['type' => 'text', 'nullable' => true],
            'feasibility_rating' => ['type' => 'integer', 'min' => 1, 'max' => 5, 'nullable' => true],
            'impact_rating' => ['type' => 'integer', 'min' => 1, 'max' => 5, 'nullable' => true],
            
            // Implementation
            'assigned_to' => ['type' => 'foreignId', 'references' => 'users.id', 'nullable' => true],
            'implementation_plan' => ['type' => 'text', 'nullable' => true],
            'implementation_status' => ['type' => 'enum', 'values' => ['NOT_STARTED', 'PLANNING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED'], 'nullable' => true],
            'implementation_progress' => ['type' => 'integer', 'min' => 0, 'max' => 100, 'default' => 0],
            
            // Community Engagement
            'upvotes' => ['type' => 'integer', 'min' => 0, 'default' => 0],
            'downvotes' => ['type' => 'integer', 'min' => 0, 'default' => 0],
            'community_comments' => ['type' => 'json', 'nullable' => true],
            
            // Documentation
            'attachments' => ['type' => 'json', 'nullable' => true],
            'supporting_documents' => ['type' => 'json', 'nullable' => true],
            
            // Budget & Resources
            'approved_budget' => ['type' => 'decimal', 'precision' => 12, 'scale' => 2, 'min' => 0, 'nullable' => true],
            'actual_cost' => ['type' => 'decimal', 'precision' => 12, 'scale' => 2, 'min' => 0, 'nullable' => true],
            'funding_source' => ['type' => 'string', 'max' => 255, 'nullable' => true],
            'resource_requirements' => ['type' => 'text', 'nullable' => true],
            
            // Tracking & Monitoring
            'milestones' => ['type' => 'json', 'nullable' => true],
            'success_metrics' => ['type' => 'text', 'nullable' => true],
            'outcome_assessment' => ['type' => 'text', 'nullable' => true],
            'lessons_learned' => ['type' => 'text', 'nullable' => true],
            
            // Additional Classification
            'complexity' => ['type' => 'enum', 'values' => ['SIMPLE', 'MODERATE', 'COMPLEX', 'VERY_COMPLEX'], 'nullable' => true],
            'stakeholders_involved' => ['type' => 'json', 'nullable' => true],
            
            // Communication & Updates
            'public_visibility' => ['type' => 'boolean', 'default' => true],
            'update_frequency' => ['type' => 'enum', 'values' => ['WEEKLY', 'MONTHLY', 'QUARTERLY', 'AS_NEEDED'], 'default' => 'MONTHLY'],
            'communication_plan' => ['type' => 'text', 'nullable' => true],
            
            // Risk & Dependencies
            'risks_identified' => ['type' => 'text', 'nullable' => true],
            'dependencies' => ['type' => 'text', 'nullable' => true],
            'mitigation_strategies' => ['type' => 'text', 'nullable' => true],
            
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
                    $fieldRules[] = 'unique:suggestions,' . $field;
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
