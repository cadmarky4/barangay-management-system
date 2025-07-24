<?php

// ============================================================================
// App/Exports/UsersExport.php (for Excel export functionality)
// ============================================================================

namespace App\Exports;

use App\Models\User;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class UsersExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    protected $users;

    public function __construct($users)
    {
        $this->users = $users;
    }

    public function collection()
    {
        return $this->users;
    }

    public function headings(): array
    {
        return [
            'ID',
            'First Name',
            'Last Name',
            'Middle Name',
            'Email',
            'Phone',
            'Username',
            'Role',
            'Department',
            'Position',
            'Employee ID',
            'Is Active',
            'Is Verified',
            'Last Login',
            'Created At',
        ];
    }

    public function map($user): array
    {
        return [
            $user->id,
            $user->first_name,
            $user->last_name,
            $user->middle_name,
            $user->email,
            $user->phone,
            $user->username,
            $user->role_display_name,
            $user->department_display_name,
            $user->position,
            $user->employee_id,
            $user->is_active ? 'Yes' : 'No',
            $user->is_verified ? 'Yes' : 'No',
            $user->last_login_at ? $user->last_login_at->format('Y-m-d H:i:s') : 'Never',
            $user->created_at->format('Y-m-d H:i:s'),
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}

