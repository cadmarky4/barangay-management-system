<?php

namespace App\Models\Schemas;

/**
 * User Schema - Single source of truth for user data structure
 * Aligned with frontend Zod schema and authentication requirements
 */
class UserSchema
{
    /**
     * User role constants
     */
    public const ROLES = [
        'SUPER_ADMIN',
        'ADMIN',
        'BARANGAY_CAPTAIN',
        'BARANGAY_SECRETARY',
        'BARANGAY_TREASURER',
        'BARANGAY_COUNCILOR',
        'BARANGAY_CLERK',
        'HEALTH_WORKER',
        'SOCIAL_WORKER',
        'SECURITY_OFFICER',
        'DATA_ENCODER',
        'VIEWER'
    ];

    /**
     * Department constants
     */
    public const DEPARTMENTS = [
        'ADMINISTRATION',
        'HEALTH_SERVICES',
        'SOCIAL_SERVICES',
        'SECURITY_PUBLIC_SAFETY',
        'FINANCE_TREASURY',
        'RECORDS_MANAGEMENT',
        'COMMUNITY_DEVELOPMENT',
        'DISASTER_RISK_REDUCTION',
        'ENVIRONMENTAL_MANAGEMENT',
        'YOUTH_SPORTS_DEVELOPMENT',
        'SENIOR_CITIZEN_AFFAIRS',
        'WOMENS_AFFAIRS',
        'BUSINESS_PERMITS',
        'INFRASTRUCTURE_DEVELOPMENT'
    ];

    /**
     * User status constants
     */
    public const STATUSES = [
        'ACTIVE',
        'INACTIVE',
        'SUSPENDED',
        'PENDING_VERIFICATION'
    ];

    /**
     * Complete field definitions for users
     */
    public static function getFields(): array
    {
        return [
            // Authentication fields
            'username' => [
                'type' => 'string',
                'max' => 50,
                'required' => true,
                'fillable' => true,
                'unique' => true,
                'searchable' => true,
                'regex' => '/^[a-zA-Z0-9_]+$/'
            ],
            'email' => [
                'type' => 'email',
                'max' => 255,
                'required' => true,
                'fillable' => true,
                'unique' => true,
                'searchable' => true
            ],
            'email_verified_at' => [
                'type' => 'datetime',
                'nullable' => true,
                'cast' => 'datetime'
            ],
            'password' => [
                'type' => 'string',
                'required' => true,
                'fillable' => true,
                'min' => 8,
                'regex' => '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/',
                'cast' => 'hashed'
            ],
            'remember_token' => [
                'type' => 'string',
                'max' => 100,
                'nullable' => true
            ],

            // Personal Information
            'first_name' => [
                'type' => 'string',
                'max' => 255,
                'required' => true,
                'fillable' => true,
                'searchable' => true
            ],
            'last_name' => [
                'type' => 'string',
                'max' => 255,
                'required' => true,
                'fillable' => true,
                'searchable' => true
            ],
            'middle_name' => [
                'type' => 'string',
                'max' => 255,
                'nullable' => true,
                'fillable' => true,
                'searchable' => true
            ],

            // Contact Information
            'phone' => [
                'type' => 'string',
                'max' => 20,
                'required' => true,
                'fillable' => true,
                'regex' => '/^(\+639|09)\d{9}$/'
            ],

            // Role and Department
            'role' => [
                'type' => 'enum',
                'values' => self::ROLES,
                'required' => true,
                'fillable' => true
            ],
            'department' => [
                'type' => 'enum',
                'values' => self::DEPARTMENTS,
                'required' => true,
                'fillable' => true
            ],
            'position' => [
                'type' => 'string',
                'max' => 255,
                'nullable' => true,
                'fillable' => true
            ],
            'employee_id' => [
                'type' => 'string',
                'max' => 50,
                'nullable' => true,
                'fillable' => true,
                'unique' => true,
                'searchable' => true
            ],

            // Status and Settings
            'is_active' => [
                'type' => 'boolean',
                'default' => true,
                'fillable' => true,
                'cast' => 'boolean'
            ],
            'is_verified' => [
                'type' => 'boolean',
                'default' => false,
                'fillable' => true,
                'cast' => 'boolean'
            ],
            'last_login_at' => [
                'type' => 'datetime',
                'nullable' => true,
                'cast' => 'datetime'
            ],

            // Additional Information
            'notes' => [
                'type' => 'text',
                'nullable' => true,
                'fillable' => true
            ],

            // Relationship to resident (nullable because not all users are residents)
            'resident_id' => [
                'type' => 'foreignId',
                'references' => 'residents.id',
                'nullable' => true,
                'fillable' => true,
                'onDelete' => 'set null'
            ],

            // Audit fields
            'created_by' => [
                'type' => 'foreignId',
                'references' => 'users.id',
                'nullable' => true,
                'fillable' => true,
                'onDelete' => 'set null'
            ],
            'updated_by' => [
                'type' => 'foreignId',
                'references' => 'users.id',
                'nullable' => true,
                'fillable' => true,
                'onDelete' => 'set null'
            ],

            // Timestamps
            'created_at' => [
                'type' => 'datetime',
                'cast' => 'datetime'
            ],
            'updated_at' => [
                'type' => 'datetime',
                'cast' => 'datetime'
            ],
            'deleted_at' => [
                'type' => 'datetime',
                'nullable' => true,
                'cast' => 'datetime'
            ],
        ];
    }

    /**
     * Get fillable fields for the model
     */
    public static function getFillableFields(): array
    {
        $fields = static::getFields();
        $fillable = [];

        foreach ($fields as $field => $config) {
            if (isset($config['fillable']) && $config['fillable']) {
                $fillable[] = $field;
            }
        }

        return $fillable;
    }

    /**
     * Get searchable fields for the model
     */
    public static function getSearchableFields(): array
    {
        $fields = static::getFields();
        $searchable = [];

        foreach ($fields as $field => $config) {
            if (isset($config['searchable']) && $config['searchable']) {
                $searchable[] = $field;
            }
        }

        return $searchable;
    }

    /**
     * Get validation rules for create operations
     */
    public static function getCreateValidationRules(): array
    {
        $rules = [];
        $fields = static::getFields();

        foreach ($fields as $field => $config) {
            // Skip system fields and password confirmation
            if (in_array($field, ['created_at', 'updated_at', 'deleted_at', 'remember_token', 'email_verified_at', 'last_login_at'])) {
                continue;
            }

            $fieldRules = [];

            // Required/nullable
            if (isset($config['required']) && $config['required']) {
                $fieldRules[] = 'required';
            } else {
                $fieldRules[] = 'nullable';
            }

            // Type-specific rules
            switch ($config['type']) {
                case 'string':
                    $fieldRules[] = 'string';
                    if (isset($config['max'])) {
                        $fieldRules[] = "max:{$config['max']}";
                    }
                    if (isset($config['min'])) {
                        $fieldRules[] = "min:{$config['min']}";
                    }
                    if (isset($config['regex'])) {
                        $fieldRules[] = 'regex:' . $config['regex'];
                    }
                    if (isset($config['unique']) && $config['unique']) {
                        $fieldRules[] = 'unique:users,' . $field;
                    }
                    break;

                case 'email':
                    $fieldRules[] = 'email';
                    if (isset($config['max'])) {
                        $fieldRules[] = "max:{$config['max']}";
                    }
                    if (isset($config['unique']) && $config['unique']) {
                        $fieldRules[] = 'unique:users,' . $field;
                    }
                    break;

                case 'enum':
                    $fieldRules[] = 'in:' . implode(',', $config['values']);
                    break;

                case 'text':
                    $fieldRules[] = 'string';
                    break;

                case 'boolean':
                    $fieldRules[] = 'boolean';
                    break;

                case 'datetime':
                    $fieldRules[] = 'date';
                    break;

                case 'foreignId':
                    $fieldRules[] = 'integer';
                    if (isset($config['references'])) {
                        $fieldRules[] = 'exists:' . $config['references'];
                    }
                    break;
            }

            if (!empty($fieldRules)) {
                $rules[$field] = implode('|', $fieldRules);
            }
        }

        // Add password confirmation rule
        $rules['confirm_password'] = 'required|same:password';

        return $rules;
    }

    /**
     * Get validation rules for update operations
     */
    public static function getUpdateValidationRules($userId = null): array
    {
        $rules = static::getCreateValidationRules();

        // Make most fields optional for updates
        foreach ($rules as $field => $rule) {
            if (str_starts_with($rule, 'required')) {
                $rules[$field] = 'sometimes|' . $rule;
            }
        }

        // Update unique rules to ignore current user
        if ($userId) {
            if (isset($rules['username'])) {
                $rules['username'] = str_replace('unique:users,username', "unique:users,username,{$userId}", $rules['username']);
            }
            if (isset($rules['email'])) {
                $rules['email'] = str_replace('unique:users,email', "unique:users,email,{$userId}", $rules['email']);
            }
            if (isset($rules['employee_id'])) {
                $rules['employee_id'] = str_replace('unique:users,employee_id', "unique:users,employee_id,{$userId}", $rules['employee_id']);
            }
        }

        // Make password optional for updates
        $rules['password'] = 'sometimes|string|min:8|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/';
        $rules['confirm_password'] = 'required_with:password|same:password';

        return $rules;
    }

    /**
     * Get casts for the model
     */
    public static function getCasts(): array
    {
        $casts = [];
        $fields = static::getFields();

        foreach ($fields as $field => $config) {
            if (isset($config['cast'])) {
                $casts[$field] = $config['cast'];
            }
        }

        return $casts;
    }
}