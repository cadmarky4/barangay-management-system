<?php

// ============================================================================
// App/Imports/UsersImport.php (for Excel import functionality)
// ============================================================================

namespace App\Imports;

use App\Models\User;
use App\Models\Schemas\UserSchema;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class UsersImport implements ToCollection, WithHeadingRow
{
    protected $options;
    protected $results = [
        'success_count' => 0,
        'error_count' => 0,
        'errors' => []
    ];

    public function __construct($options = [])
    {
        $this->options = $options;
    }

    public function collection(Collection $rows)
    {
        foreach ($rows as $index => $row) {
            try {
                $userData = [
                    'first_name' => $row['first_name'] ?? '',
                    'last_name' => $row['last_name'] ?? '',
                    'middle_name' => $row['middle_name'] ?? null,
                    'email' => $row['email'] ?? '',
                    'phone' => $row['phone'] ?? '',
                    'username' => $row['username'] ?? '',
                    'role' => $row['role'] ?? 'VIEWER',
                    'department' => $row['department'] ?? 'ADMINISTRATION',
                    'position' => $row['position'] ?? null,
                    'employee_id' => $row['employee_id'] ?? null,
                    'is_active' => $this->parseBoolean($row['is_active'] ?? true),
                    'password' => Hash::make($this->options['default_password'] ?? 'password123'),
                    'is_verified' => false,
                ];

                // Validate data
                $validator = Validator::make($userData, UserSchema::getCreateValidationRules());

                if ($validator->fails()) {
                    $this->results['errors'][] = [
                        'row' => $index + 2, // +2 because of heading row and 0-based index
                        'error' => implode(', ', $validator->errors()->all())
                    ];
                    $this->results['error_count']++;
                    continue;
                }

                // Check if user exists and update_existing option is enabled
                $existingUser = null;
                if (isset($this->options['update_existing']) && $this->options['update_existing']) {
                    $existingUser = User::where('email', $userData['email'])
                        ->orWhere('username', $userData['username'])
                        ->first();
                }

                if ($existingUser) {
                    $existingUser->update($userData);
                } else {
                    User::create($userData);
                }

                $this->results['success_count']++;

            } catch (\Exception $e) {
                $this->results['errors'][] = [
                    'row' => $index + 2,
                    'error' => $e->getMessage()
                ];
                $this->results['error_count']++;
            }
        }
    }

    public function getResults(): array
    {
        return $this->results;
    }

    private function parseBoolean($value): bool
    {
        if (is_bool($value)) {
            return $value;
        }

        if (is_string($value)) {
            return in_array(strtolower($value), ['true', '1', 'yes', 'active']);
        }

        return (bool) $value;
    }
}