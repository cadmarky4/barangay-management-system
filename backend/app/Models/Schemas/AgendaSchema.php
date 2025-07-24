<?php

namespace App\Models\Schemas;

/**
 * Centralized schema definition for Agenda model
 * This serves as the single source of truth for all agenda-related data structure
 */
class AgendaSchema
{
    /**
     * Complete field definitions based on frontend requirements
     */
    public static function getFields(): array
    {
        return [
            // Basic Information
            'title' => ['type' => 'string', 'max' => 255, 'required' => true],
            'description' => ['type' => 'text', 'nullable' => true],
            
            // Schedule Information
            'date' => ['type' => 'date', 'required' => true],
            'time' => ['type' => 'time', 'required' => true],
            'end_time' => ['type' => 'time', 'nullable' => true],
            'duration_minutes' => ['type' => 'integer', 'default' => 60, 'nullable' => true],
            
            // Categorization
            'category' => ['type' => 'enum', 'values' => ['MEETING', 'REVIEW', 'PRESENTATION', 'EVALUATION', 'BUDGET', 'PLANNING', 'INSPECTION', 'OTHER'], 'required' => true],
            'priority' => ['type' => 'enum', 'values' => ['LOW', 'NORMAL', 'HIGH', 'URGENT'], 'default' => 'NORMAL'],
            'status' => ['type' => 'enum', 'values' => ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED'], 'default' => 'SCHEDULED'],
            
            // Location Information
            'location' => ['type' => 'string', 'max' => 255, 'nullable' => true],
            'venue' => ['type' => 'string', 'max' => 255, 'nullable' => true],
            
            // Participants
            'participants' => ['type' => 'json', 'nullable' => true],
            'organizer' => ['type' => 'string', 'max' => 255, 'nullable' => true],
            
            // Additional Information
            'notes' => ['type' => 'text', 'nullable' => true],
            'attachments' => ['type' => 'json', 'nullable' => true],
            
            // Notification settings
            'reminder_enabled' => ['type' => 'boolean', 'default' => true],
            'reminder_minutes_before' => ['type' => 'integer', 'default' => 15],
            
            // System tracking
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
            } elseif ($config['type'] === 'text') {
                $fieldRules[] = 'string';
            } elseif ($config['type'] === 'date') {
                $fieldRules[] = 'date';
            } elseif ($config['type'] === 'time') {
                $fieldRules[] = 'date_format:H:i';
            } elseif ($config['type'] === 'integer') {
                $fieldRules[] = 'integer';
                if (isset($config['min'])) {
                    $fieldRules[] = "min:{$config['min']}";
                }
            } elseif ($config['type'] === 'boolean') {
                $fieldRules[] = 'boolean';
            } elseif ($config['type'] === 'json') {
                $fieldRules[] = 'array';
            } elseif ($config['type'] === 'enum') {
                $fieldRules[] = 'string';
                $fieldRules[] = 'in:' . implode(',', $config['values']);
            } elseif ($config['type'] === 'foreignId') {
                $fieldRules[] = 'integer';
                $fieldRules[] = 'exists:' . str_replace('.id', ',id', $config['references']);
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
        
        // Make most fields optional for updates
        foreach ($rules as $field => $rule) {
            if (strpos($rule, 'required') !== false) {
                $rules[$field] = str_replace('required', 'sometimes|required', $rule);
            }
        }
        
        return $rules;
    }
    
    /**
     * Get database column definitions for migration
     */
    public static function getMigrationColumns(): array
    {
        $columns = [];
        foreach (static::getFields() as $field => $config) {
            $column = [];
            
            switch ($config['type']) {
                case 'string':
                    $column['type'] = 'string';
                    if (isset($config['max'])) {
                        $column['length'] = $config['max'];
                    }
                    break;
                case 'text':
                    $column['type'] = 'text';
                    break;
                case 'date':
                    $column['type'] = 'date';
                    break;
                case 'time':
                    $column['type'] = 'time';
                    break;
                case 'integer':
                    $column['type'] = 'integer';
                    break;
                case 'boolean':
                    $column['type'] = 'boolean';
                    break;
                case 'json':
                    $column['type'] = 'json';
                    break;
                case 'enum':
                    $column['type'] = 'enum';
                    $column['values'] = $config['values'];
                    break;
                case 'foreignId':
                    $column['type'] = 'foreignId';
                    $column['references'] = $config['references'];
                    break;
            }
            
            if (isset($config['nullable']) && $config['nullable']) {
                $column['nullable'] = true;
            }
            
            if (isset($config['default'])) {
                $column['default'] = $config['default'];
            }
            
            $columns[$field] = $column;
        }
        
        return $columns;
    }
}
