<?php

namespace App\Models\Schemas;

/**
 * Centralized schema definition for ProjectTeamMember model
 * This serves as the single source of truth for all project team member-related data structure
 */
class ProjectTeamMemberSchema
{
    /**
     * Complete field definitions for project team members
     */
    public static function getFields(): array
    {
        return [
            // Basic Information
            'project_id' => ['type' => 'foreignId', 'references' => 'projects.id', 'required' => true],
            'user_id' => ['type' => 'foreignId', 'references' => 'users.id', 'nullable' => true],
            'member_name' => ['type' => 'string', 'max' => 255, 'required' => true],
            'member_email' => ['type' => 'email', 'max' => 255, 'nullable' => true],
            'member_contact' => ['type' => 'string', 'max' => 20, 'nullable' => true],
            
            // Role & Responsibilities
            'role' => ['type' => 'enum', 'values' => ['PROJECT_MANAGER', 'ASSISTANT_MANAGER', 'TEAM_LEADER', 'TECHNICAL_SPECIALIST', 'CONSULTANT', 'COORDINATOR', 'SUPERVISOR', 'MEMBER', 'OBSERVER'], 'required' => true],
            'responsibilities' => ['type' => 'text', 'nullable' => true],
            
            // Status & Timeline
            'is_active' => ['type' => 'boolean', 'default' => true],
            'joined_date' => ['type' => 'date', 'required' => true],
            'left_date' => ['type' => 'date', 'nullable' => true],
            
            // Skills & Performance
            'expertise' => ['type' => 'string', 'max' => 500, 'nullable' => true],
            'availability_percentage' => ['type' => 'integer', 'min' => 0, 'max' => 100, 'default' => 100],
            'performance_rating' => ['type' => 'integer', 'min' => 1, 'max' => 5, 'nullable' => true],
            'contribution_notes' => ['type' => 'text', 'nullable' => true],
            
            // Communication Preferences
            'receives_notifications' => ['type' => 'boolean', 'default' => true],
            'communication_preference' => ['type' => 'enum', 'values' => ['EMAIL', 'SMS', 'PHONE', 'IN_PERSON', 'MESSAGING_APP'], 'default' => 'EMAIL'],
            
            // Additional Information
            'remarks' => ['type' => 'text', 'nullable' => true],
            
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
            } elseif ($config['type'] === 'foreignId') {
                if (isset($config['references'])) {
                    $table = explode('.', $config['references'])[0];
                    $fieldRules[] = "exists:{$table},id";
                }
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
            }
        }
        
        return $casts;
    }
}
