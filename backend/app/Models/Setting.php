<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class Setting extends Model
{
    protected $fillable = [
        // General Information
        'barangay',
        'city',
        'province',
        'region',
        'type',
        'contact_number',
        'email_address',
        'opening_hours',
        'closing_hours',
        'primary_language',
        'secondary_language',
        
        // Privacy and Security
        'session_timeout',
        'max_login_attempts',
        'data_retention',
        'backup_frequency',
        
        // System
        'system_name',
        'version_number',
    ];

    protected $casts = [
        'session_timeout' => 'integer',
        'max_login_attempts' => 'integer',
        'data_retention' => 'integer',
    ];

    /**
     * Get the current settings (singleton pattern)
     * Settings should only have one record
     */
    public static function current()
    {
        $settings = static::first();
        
        if (!$settings) {
            // Use firstOrCreate to prevent race conditions
            $settings = static::firstOrCreate(
                ['id' => 1], // Ensure only one record with ID 1
                [
                    'system_name' => 'Barangay Management System',
                    'version_number' => '1.0.0',
                    'primary_language' => 'Filipino',
                    'secondary_language' => 'English',
                    'opening_hours' => '8:00 AM',
                    'closing_hours' => '5:00 PM',
                    'type' => 'Urban',
                    'session_timeout' => 30,
                    'max_login_attempts' => 3,
                    'data_retention' => 7,
                    'backup_frequency' => 'Daily',
                ]
            );
        }
        
        return $settings;
    }

    /**
     * Transform for frontend (camelCase conversion)
     */
    public function toFrontendFormat()
    {
        return [
            'barangay' => $this->barangay ?? '',
            'city' => $this->city ?? '',
            'province' => $this->province ?? '',
            'region' => $this->region ?? '',
            'type' => $this->type ?? 'Urban',
            'contactNumber' => $this->contact_number ?? '',
            'emailAddress' => $this->email_address ?? '',
            'openingHours' => $this->opening_hours ?? '8:00 AM',
            'closingHours' => $this->closing_hours ?? '5:00 PM',
            'primaryLanguage' => $this->primary_language ?? 'Filipino',
            'secondaryLanguage' => $this->secondary_language ?? 'English',
            'sessionTimeout' => (string)($this->session_timeout ?? 30),
            'maxLoginAttempts' => (string)($this->max_login_attempts ?? 3),
            'dataRetention' => (string)($this->data_retention ?? 7),
            'backupFrequency' => $this->backup_frequency ?? 'Daily',
            'systemName' => $this->system_name ?? 'Barangay Management System',
            'versionNumber' => $this->version_number ?? '1.0.0',
        ];
    }

    /**
     * Update from frontend format (snake_case conversion)
     */
    public function updateFromFrontend(array $data)
    {
        $backendData = [
            'barangay' => isset($data['barangay']) ? trim($data['barangay']) : null,
            'city' => isset($data['city']) ? trim($data['city']) : null,
            'province' => isset($data['province']) ? trim($data['province']) : null,
            'region' => isset($data['region']) ? trim($data['region']) : null,
            'type' => isset($data['type']) ? trim($data['type']) : null,
            'contact_number' => isset($data['contactNumber']) ? trim($data['contactNumber']) : null,
            'email_address' => isset($data['emailAddress']) ? trim(strtolower($data['emailAddress'])) : null,
            'opening_hours' => isset($data['openingHours']) ? trim($data['openingHours']) : null,
            'closing_hours' => isset($data['closingHours']) ? trim($data['closingHours']) : null,
            'primary_language' => isset($data['primaryLanguage']) ? trim($data['primaryLanguage']) : null,
            'secondary_language' => isset($data['secondaryLanguage']) ? trim($data['secondaryLanguage']) : null,
            'session_timeout' => isset($data['sessionTimeout']) ? (int)$data['sessionTimeout'] : null,
            'max_login_attempts' => isset($data['maxLoginAttempts']) ? (int)$data['maxLoginAttempts'] : null,
            'data_retention' => isset($data['dataRetention']) ? (int)$data['dataRetention'] : null,
            'backup_frequency' => isset($data['backupFrequency']) ? trim($data['backupFrequency']) : null,
            'system_name' => isset($data['systemName']) ? trim($data['systemName']) : null,
            'version_number' => isset($data['versionNumber']) ? trim($data['versionNumber']) : null,
        ];

        // Remove null values to avoid overwriting existing data with nulls
        $backendData = array_filter($backendData, function($value) {
            return $value !== null && $value !== '';
        });

        return $this->update($backendData);
    }
}
