<?php

namespace App\Models\Schemas;


class HouseholdSchema
{
    /**
     * Complete field definitions based on frontend Zod schema
     */
    public static function getFields(): array
    {
        return [
            // Household Identification
            'household_number' => ['type' => 'string', 'max' => 50, 'required' => true, 'unique' => true], // Changed to required since frontend generates it
            'household_type' => ['type' => 'enum', 'values' => ['NUCLEAR', 'EXTENDED', 'SINGLE', 'SINGLE_PARENT', 'OTHER'], 'required' => true, 'default' => 'NUCLEAR'],
            'head_resident_id' => ['type' => 'string', 'references' => 'residents.id', 'nullable' => true],
            
            // Address Information
            'complete_address' => ['type' => 'text', 'required' => true],
            
            // Socioeconomic Information
            'monthly_income' => ['type' => 'enum', 'values' => ['BELOW_10000', 'RANGE_10000_25000', 'RANGE_25000_50000', 'RANGE_50000_100000', 'ABOVE_100000'], 'nullable' => true],
            'primary_income_source' => ['type' => 'string', 'max' => 255, 'nullable' => true],
            
            // Household Classification
            'four_ps_beneficiary' => ['type' => 'boolean', 'default' => false],
            'indigent_family' => ['type' => 'boolean', 'default' => false],
            'has_senior_citizen' => ['type' => 'boolean', 'default' => false],
            'has_pwd_member' => ['type' => 'boolean', 'default' => false],
            
            // Housing Information
            'house_type' => ['type' => 'enum', 'values' => ['CONCRETE', 'SEMI_CONCRETE', 'WOOD', 'BAMBOO', 'MIXED'], 'nullable' => true],
            'ownership_status' => ['type' => 'enum', 'values' => ['OWNED', 'RENTED', 'SHARED', 'INFORMAL_SETTLER'], 'nullable' => true],
            
            // Utilities Access
            'has_electricity' => ['type' => 'boolean', 'default' => false],
            'has_water_supply' => ['type' => 'boolean', 'default' => false],
            'has_internet_access' => ['type' => 'boolean', 'default' => false],
            
            // Status
            'status' => ['type' => 'enum', 'values' => ['ACTIVE', 'INACTIVE', 'TRANSFERRED'], 'default' => 'ACTIVE'],
            
            // Additional Information
            'remarks' => ['type' => 'text', 'nullable' => true],
            
            // System Fields
            'created_by' => ['type' => 'string', 'references' => 'users.id', 'nullable' => true],
            'updated_by' => ['type' => 'string', 'references' => 'users.id', 'nullable' => true],
        ];
    }
    
    /**
     * Get fillable fields for the model
     */
    public static function getFillableFields(): array
    {
        $fields = static::getFields();
        // Exclude system timestamps and primary key
        unset($fields['created_at'], $fields['updated_at'], $fields['id']);
        return array_keys($fields);
    }
    
    /**
     * Get validation rules for create operations
     */
    public static function getCreateValidationRules(): array
    {
        $rules = [];
        foreach (static::getFields() as $field => $config) {
            $fieldRules = [];
            
            // Handle nullable fields
            if (isset($config['nullable']) && $config['nullable']) {
                $fieldRules[] = 'nullable';
            } elseif (isset($config['required']) && $config['required']) {
                $fieldRules[] = 'required';
            } else {
                $fieldRules[] = 'nullable';
            }
            
            // Type-specific rules
            if ($config['type'] === 'string') {
                $fieldRules[] = 'string';
                if (isset($config['max'])) {
                    $fieldRules[] = "max:{$config['max']}";
                }
                if (isset($config['unique']) && $config['unique']) {
                    $fieldRules[] = 'unique:households,' . $field;
                }
            } elseif ($config['type'] === 'text') {
                $fieldRules[] = 'string';
            } elseif ($config['type'] === 'enum') {
                $fieldRules[] = 'in:' . implode(',', $config['values']);
            } elseif ($config['type'] === 'boolean') {
                $fieldRules[] = 'boolean';
            } elseif ($config['type'] === 'foreignId') {
                if (isset($config['references'])) {
                    $table = explode('.', $config['references'])[0];
                    $column = explode('.', $config['references'])[1];
                    $fieldRules[] = "exists:{$table},{$column}";
                }
            }
            
            $rules[$field] = implode('|', array_filter($fieldRules));
        }
        
        return $rules;
    }
    
    /**
     * Get validation rules for update operations
     */
    public static function getUpdateValidationRules($id = null): array
    {
        $rules = static::getCreateValidationRules();
        
        // Make required fields optional for updates
        foreach ($rules as $field => $rule) {
            if (str_contains($rule, 'required')) {
                $rules[$field] = 'sometimes|' . $rule;
            }
        }
        
        // Handle unique validation for updates
        if (isset($rules['household_number']) && $id) {
            $rules['household_number'] = str_replace(
                'unique:households,household_number',
                "unique:households,household_number,{$id}",
                $rules['household_number']
            );
        }
        
        return $rules;
    }
    
    /**
     * Get validation rules for member relationships
     */
    public static function getMemberValidationRules(): array
    {
        return [
            'member_ids' => 'nullable|array',
            'member_ids.*.resident_id' => [
                'required',
                'string',
                'exists:residents,id',
                function ($attribute, $value, $fail) {
                    // Get the head_resident_id from the request
                    $headResidentId = request()->input('head_resident_id');
                    if ($headResidentId && $value === $headResidentId) {
                        $fail('A resident cannot be both household head and a member.');
                    }
                },
            ],
            'member_ids.*.relationship' => 'required|string|in:HEAD,SPOUSE,SON,DAUGHTER,FATHER,MOTHER,BROTHER,SISTER,GRANDFATHER,GRANDMOTHER,GRANDSON,GRANDDAUGHTER,UNCLE,AUNT,NEPHEW,NIECE,COUSIN,IN_LAW,BOARDER,OTHER',
        ];
    }
    
    /**
     * Get casts for the model
     */
    public static function getCasts(): array
    {
        $casts = [
            'id' => 'string', // UUID cast
        ];
        
        foreach (static::getFields() as $field => $config) {
            if ($config['type'] === 'boolean') {
                $casts[$field] = 'boolean';
            }
        }
        
        return $casts;
    }
    
    /**
     * Get relationship type enum values
     */
    public static function getRelationshipTypes(): array
    {
        return [
            'HEAD',
            'SPOUSE', 
            'SON',
            'DAUGHTER',
            'FATHER',
            'MOTHER',
            'BROTHER',
            'SISTER',
            'GRANDFATHER',
            'GRANDMOTHER',
            'GRANDSON',
            'GRANDDAUGHTER',
            'UNCLE',
            'AUNT',
            'NEPHEW',
            'NIECE',
            'COUSIN',
            'IN_LAW',
            'BOARDER',
            'OTHER'
        ];
    }
}