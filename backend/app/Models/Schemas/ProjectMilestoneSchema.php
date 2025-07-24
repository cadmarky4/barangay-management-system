<?php

namespace App\Models\Schemas;

/**
 * Centralized schema definition for ProjectMilestone model
 * This serves as the single source of truth for all project milestone-related data structure
 */
class ProjectMilestoneSchema
{
    /**
     * Complete field definitions for project milestones
     */
    public static function getFields(): array
    {
        return [
            // Basic Information
            'project_id' => ['type' => 'foreignId', 'references' => 'projects.id', 'required' => true],
            'title' => ['type' => 'string', 'max' => 255, 'required' => true],
            'description' => ['type' => 'text', 'nullable' => true],
            'sequence_order' => ['type' => 'integer', 'min' => 1, 'required' => true],
            
            // Timeline
            'target_date' => ['type' => 'date', 'required' => true],
            'actual_completion_date' => ['type' => 'date', 'nullable' => true],
            'estimated_duration_days' => ['type' => 'integer', 'min' => 1, 'nullable' => true],
            
            // Status & Progress
            'status' => ['type' => 'enum', 'values' => ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'ON_HOLD', 'CANCELLED'], 'default' => 'NOT_STARTED'],
            'progress_percentage' => ['type' => 'integer', 'min' => 0, 'max' => 100, 'default' => 0],
            'weight_percentage' => ['type' => 'decimal', 'precision' => 5, 'scale' => 2, 'min' => 0, 'max' => 100, 'nullable' => true],
            
            // Deliverables & Requirements
            'deliverables' => ['type' => 'json', 'nullable' => true],
            'requirements' => ['type' => 'json', 'nullable' => true],
            'attachments' => ['type' => 'json', 'nullable' => true],
            
            // Budget
            'allocated_budget' => ['type' => 'decimal', 'precision' => 12, 'scale' => 2, 'min' => 0, 'nullable' => true],
            'actual_cost' => ['type' => 'decimal', 'precision' => 12, 'scale' => 2, 'min' => 0, 'nullable' => true],
            
            // Assignment & Team
            'responsible_user_id' => ['type' => 'foreignId', 'references' => 'users.id', 'nullable' => true],
            'responsible_team' => ['type' => 'string', 'max' => 255, 'nullable' => true],
            
            // Quality & Performance
            'quality_score' => ['type' => 'integer', 'min' => 1, 'max' => 5, 'nullable' => true],
            'completion_notes' => ['type' => 'text', 'nullable' => true],
            'remarks' => ['type' => 'text', 'nullable' => true],
            
            // Dependencies
            'dependencies' => ['type' => 'json', 'nullable' => true],
            
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
