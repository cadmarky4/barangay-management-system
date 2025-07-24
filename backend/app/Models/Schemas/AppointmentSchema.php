<?php

namespace App\Models\Schemas;

/**
 * Centralized schema definition for Appointment model
 * This serves as the single source of truth for all appointment-related data structure
 */
class AppointmentSchema
{    /**
     * Complete field definitions for appointments
     */
    public static function getFields(): array
    {
        return [
            // Basic Information (matching frontend)
            'appointment_number' => ['type' => 'string', 'max' => 255, 'required' => true, 'unique' => true],
            'full_name' => ['type' => 'string', 'max' => 255, 'required' => true],
            'email' => ['type' => 'email', 'max' => 255, 'required' => true],
            'phone' => ['type' => 'string', 'max' => 20, 'required' => true],
            'department' => ['type' => 'string', 'max' => 255, 'required' => true],
            'purpose' => ['type' => 'text', 'required' => true],
            
            // Scheduling Information
            'preferred_date' => ['type' => 'date', 'required' => true],
            'preferred_time' => ['type' => 'string', 'max' => 10, 'required' => true],
            'alternative_date' => ['type' => 'date', 'nullable' => true],
            'alternative_time' => ['type' => 'string', 'max' => 10, 'nullable' => true],
            'additional_notes' => ['type' => 'text', 'nullable' => true],
            
            // System Processing Fields
            'appointment_date' => ['type' => 'date', 'nullable' => true], // Final confirmed date
            'appointment_time' => ['type' => 'time', 'nullable' => true], // Final confirmed time
            'end_time' => ['type' => 'time', 'nullable' => true],
            'duration_minutes' => ['type' => 'integer', 'min' => 15, 'max' => 480, 'nullable' => true],
            
            // Location & Assignment
            'location' => ['type' => 'string', 'max' => 255, 'nullable' => true],
            'room_venue' => ['type' => 'string', 'max' => 255, 'nullable' => true],
            'assigned_official' => ['type' => 'foreignId', 'references' => 'users.id', 'nullable' => true],
            'assigned_official_name' => ['type' => 'string', 'max' => 255, 'nullable' => true],
            
            // Status & Dates
            'status' => ['type' => 'enum', 'values' => ['PENDING', 'CONFIRMED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'], 'default' => 'PENDING'],
            'date_requested' => ['type' => 'date', 'required' => true],
            'confirmed_date' => ['type' => 'datetime', 'nullable' => true],
            'actual_start_time' => ['type' => 'datetime', 'nullable' => true],
            'actual_end_time' => ['type' => 'datetime', 'nullable' => true],
            
            // Rescheduling
            'original_date' => ['type' => 'date', 'nullable' => true],
            'original_time' => ['type' => 'time', 'nullable' => true],
            'reschedule_reason' => ['type' => 'text', 'nullable' => true],
            'reschedule_count' => ['type' => 'integer', 'default' => 0, 'min' => 0],
            
            // Meeting Details
            'meeting_notes' => ['type' => 'text', 'nullable' => true],
            'action_items' => ['type' => 'text', 'nullable' => true],
            'outcome_summary' => ['type' => 'text', 'nullable' => true],
            'resolution_status' => ['type' => 'enum', 'values' => ['PENDING', 'RESOLVED', 'ONGOING', 'ESCALATED'], 'nullable' => true],
            
            // Priority & Special Flags
            'priority' => ['type' => 'enum', 'values' => ['LOW', 'NORMAL', 'HIGH', 'URGENT'], 'default' => 'NORMAL'],
            'is_walk_in' => ['type' => 'boolean', 'default' => false],
            'is_emergency' => ['type' => 'boolean', 'default' => false],
            
            // Notifications
            'confirmation_sent' => ['type' => 'boolean', 'default' => false],
            'reminder_sent' => ['type' => 'boolean', 'default' => false],
            'confirmation_sent_at' => ['type' => 'datetime', 'nullable' => true],
            'reminder_sent_at' => ['type' => 'datetime', 'nullable' => true],
            
            // Additional
            'attachments' => ['type' => 'json', 'nullable' => true],
            'reference_number' => ['type' => 'string', 'max' => 100, 'nullable' => true],
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
                if (isset($config['unique']) && $config['unique']) {
                    $fieldRules[] = 'unique:appointments,' . $field;
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
            } elseif ($config['type'] === 'datetime') {
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
            } elseif ($config['type'] === 'datetime') {
                $casts[$field] = 'datetime';
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
