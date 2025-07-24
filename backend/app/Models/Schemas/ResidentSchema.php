<?php

namespace App\Models\Schemas;

/**
 * Resident Schema - Single source of truth for resident data structure
 * Updated to align with pivot table approach and frontend Zod schema
 */
class ResidentSchema
{
    /**
     * Gender constants
     */
    public const GENDERS = [
        'MALE',
        'FEMALE',
        'NON_BINARY',
        'PREFER_NOT_TO_SAY'
    ];

    /**
     * Civil status constants
     */
    public const CIVIL_STATUSES = [
        'SINGLE',
        'LIVE_IN',
        'MARRIED',
        'WIDOWED',
        'DIVORCED',
        'SEPARATED',
        'ANNULLED',
        'PREFER_NOT_TO_SAY'
    ];

    /**
     * Nationality constants
     */
    public const NATIONALITIES = [
        'FILIPINO',
        'AMERICAN',
        'BRITISH',
        'CANADIAN',
        'AUSTRALIAN',
        'OTHER'
    ];

    /**
     * Religion constants
     */
    public const RELIGIONS = [
        'CATHOLIC',
        'IGLESIA_NI_CRISTO',
        'EVANGELICAL',
        'PROTESTANT',
        'ISLAM',
        'BUDDHIST',
        'HINDU',
        'SEVENTH_DAY_ADVENTIST',
        'JEHOVAHS_WITNESS',
        'BORN_AGAIN_CHRISTIAN',
        'ORTHODOX',
        'JUDAISM',
        'ATHEIST',
        'AGLIPAYAN',
        'OTHER',
        'PREFER_NOT_TO_SAY'
    ];

    /**
     * Educational attainment constants
     */
    public const EDUCATIONAL_ATTAINMENTS = [
        'NO_FORMAL_EDUCATION',
        'ELEMENTARY_UNDERGRADUATE',
        'ELEMENTARY_GRADUATE',
        'HIGH_SCHOOL_UNDERGRADUATE',
        'HIGH_SCHOOL_GRADUATE',
        'COLLEGE_UNDERGRADUATE',
        'COLLEGE_GRADUATE',
        'POST_GRADUATE',
        'VOCATIONAL',
        'OTHER'
    ];

    /**
     * Employment status constants
     */
    public const EMPLOYMENT_STATUSES = [
        'EMPLOYED',
        'UNEMPLOYED',
        'SELF_EMPLOYED',
        'RETIRED',
        'STUDENT',
        'OFW'
    ];

    /**
     * Voter status constants
     */
    public const VOTER_STATUSES = [
        'NOT_REGISTERED',
        'REGISTERED',
        'DECEASED',
        'TRANSFERRED'
    ];

    /**
     * Resident status constants
     */
    public const RESIDENT_STATUSES = [
        'ACTIVE',
        'INACTIVE',
        'DECEASED',
        'TRANSFERRED'
    ];

    /**
     * Complete field definitions for residents
     */
    public static function getFields(): array
    {
        return [
            // Basic Information
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
            'suffix' => [
                'type' => 'string',
                'max' => 50,
                'nullable' => true,
                'fillable' => true
            ],
            'birth_date' => [
                'type' => 'date',
                'required' => true,
                'fillable' => true,
                'cast' => 'date'
            ],
            'age' => [
                'type' => 'integer',
                'nullable' => true,
                'fillable' => true,
                'min' => 0,
                'max' => 150
            ],
            'birth_place' => [
                'type' => 'string',
                'max' => 255,
                'required' => true,
                'fillable' => true
            ],
            'gender' => [
                'type' => 'enum',
                'values' => self::GENDERS,
                'required' => true,
                'fillable' => true
            ],
            'civil_status' => [
                'type' => 'enum',
                'values' => self::CIVIL_STATUSES,
                'required' => true,
                'fillable' => true
            ],
            'nationality' => [
                'type' => 'enum',
                'values' => self::NATIONALITIES,
                'required' => true,
                'fillable' => true
            ],
            'religion' => [
                'type' => 'enum',
                'values' => self::RELIGIONS,
                'required' => true,
                'fillable' => true
            ],

            // Employment and Education
            'educational_attainment' => [
                'type' => 'enum',
                'values' => self::EDUCATIONAL_ATTAINMENTS,
                'required' => true,
                'fillable' => true
            ],
            'employment_status' => [
                'type' => 'enum',
                'values' => self::EMPLOYMENT_STATUSES,
                'required' => true,
                'fillable' => true
            ],
            'occupation' => [
                'type' => 'string',
                'max' => 255,
                'nullable' => true,
                'fillable' => true
            ],
            'employer' => [
                'type' => 'string',
                'max' => 255,
                'nullable' => true,
                'fillable' => true
            ],

            // Contact Information
            'mobile_number' => [
                'type' => 'string',
                'max' => 20,
                'nullable' => true,
                'fillable' => true,
                // 'regex' => '/^(\+639|09)\d{9}$\//'
            ],
            'landline_number' => [
                'type' => 'string',
                'max' => 20,
                'nullable' => true,
                'fillable' => true
            ],
            'email_address' => [
                'type' => 'email',
                'max' => 255,
                'nullable' => true,
                'fillable' => true
            ],

            // Address Information
            'region' => [
                'type' => 'string',
                'max' => 255,
                'nullable' => true,
                'fillable' => true
            ],
            'province' => [
                'type' => 'string',
                'max' => 255,
                'nullable' => true,
                'fillable' => true
            ],
            'city' => [
                'type' => 'string',
                'max' => 255,
                'nullable' => true,
                'fillable' => true
            ],
            'barangay' => [
                'type' => 'string',
                'max' => 255,
                'nullable' => true,
                'fillable' => true
            ],
            'house_number' => [
                'type' => 'string',
                'max' => 50,
                'nullable' => true,
                'fillable' => true
            ],
            'street' => [
                'type' => 'string',
                'max' => 255,
                'nullable' => true,
                'fillable' => true
            ],
            'complete_address' => [
                'type' => 'text',
                'required' => true,
                'fillable' => true
            ],

            // Family Information
            'mother_name' => [
                'type' => 'string',
                'max' => 255,
                'nullable' => true,
                'fillable' => true
            ],
            'father_name' => [
                'type' => 'string',
                'max' => 255,
                'nullable' => true,
                'fillable' => true
            ],
            'emergency_contact_name' => [
                'type' => 'string',
                'max' => 255,
                'nullable' => true,
                'fillable' => true
            ],
            'emergency_contact_number' => [
                'type' => 'string',
                'max' => 20,
                'nullable' => true,
                'fillable' => true
            ],
            'emergency_contact_relationship' => [
                'type' => 'string',
                'max' => 100,
                'nullable' => true,
                'fillable' => true
            ],

            // Government IDs
            'primary_id_type' => [
                'type' => 'string',
                'max' => 100,
                'nullable' => true,
                'fillable' => true
            ],
            'id_number' => [
                'type' => 'string',
                'max' => 100,
                'nullable' => true,
                'fillable' => true
            ],
            'philhealth_number' => [
                'type' => 'string',
                'max' => 50,
                'nullable' => true,
                'fillable' => true
            ],
            'sss_number' => [
                'type' => 'string',
                'max' => 50,
                'nullable' => true,
                'fillable' => true
            ],
            'tin_number' => [
                'type' => 'string',
                'max' => 50,
                'nullable' => true,
                'fillable' => true
            ],
            'voters_id_number' => [
                'type' => 'string',
                'max' => 50,
                'nullable' => true,
                'fillable' => true
            ],
            'voter_status' => [
                'type' => 'enum',
                'values' => self::VOTER_STATUSES,
                'required' => true,
                'fillable' => true
            ],
            'precinct_number' => [
                'type' => 'string',
                'max' => 50,
                'nullable' => true,
                'fillable' => true
            ],

            // Health & Medical
            'medical_conditions' => [
                'type' => 'text',
                'nullable' => true,
                'fillable' => true
            ],
            'allergies' => [
                'type' => 'text',
                'nullable' => true,
                'fillable' => true
            ],

            // Special Classifications
            'senior_citizen' => [
                'type' => 'boolean',
                'default' => false,
                'fillable' => true,
                'cast' => 'boolean'
            ],
            'person_with_disability' => [
                'type' => 'boolean',
                'default' => false,
                'fillable' => true,
                'cast' => 'boolean'
            ],
            'disability_type' => [
                'type' => 'string',
                'max' => 255,
                'nullable' => true,
                'fillable' => true
            ],
            'indigenous_people' => [
                'type' => 'boolean',
                'default' => false,
                'fillable' => true,
                'cast' => 'boolean'
            ],
            'indigenous_group' => [
                'type' => 'string',
                'max' => 255,
                'nullable' => true,
                'fillable' => true
            ],
            'four_ps_beneficiary' => [
                'type' => 'boolean',
                'default' => false,
                'fillable' => true,
                'cast' => 'boolean'
            ],
            'four_ps_household_id' => [
                'type' => 'string',
                'max' => 100,
                'nullable' => true,
                'fillable' => true
            ],

            // Profile photo
            'profile_photo_url' => [
                'type' => 'string',
                'max' => 500,
                'nullable' => true,
                'fillable' => true
            ],

            // Status (REMOVED household_id and is_household_head since we use pivot table)
            'status' => [
                'type' => 'enum',
                'values' => self::RESIDENT_STATUSES,
                'default' => 'ACTIVE',
                'fillable' => true
            ],

            // Audit fields
            'created_by' => [
                'type' => 'foreignId',
                'references' => 'users.id',
                'nullable' => true,
                'fillable' => true
            ],
            'updated_by' => [
                'type' => 'foreignId',
                'references' => 'users.id',
                'nullable' => true,
                'fillable' => true
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
            // Skip system fields
            if (in_array($field, ['created_at', 'updated_at', 'deleted_at'])) {
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
                    break;

                case 'email':
                    $fieldRules[] = 'email';
                    if (isset($config['max'])) {
                        $fieldRules[] = "max:{$config['max']}";
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

                case 'date':
                    $fieldRules[] = 'date';
                    $fieldRules[] = 'before:today'; // Birth date must be in the past
                    break;

                case 'integer':
                    $fieldRules[] = 'integer';
                    if (isset($config['min'])) {
                        $fieldRules[] = "min:{$config['min']}";
                    }
                    if (isset($config['max'])) {
                        $fieldRules[] = "max:{$config['max']}";
                    }
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
        $fields = static::getFields();

        foreach ($fields as $field => $config) {
            if (isset($config['cast'])) {
                $casts[$field] = $config['cast'];
            }
        }

        return $casts;
    }
}