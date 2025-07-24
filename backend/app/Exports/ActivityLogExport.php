<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class ActivityLogExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithColumnWidths, WithTitle
{
    protected $logs;
    protected $includeUserDetails;
    protected $includeOldValues;
    protected $includeNewValues;
    protected $dateFormat;

    public function __construct(
        $logs, 
        bool $includeUserDetails = true, 
        bool $includeOldValues = false, 
        bool $includeNewValues = false, 
        string $dateFormat = 'human_readable'
    ) {
        $this->logs = $logs;
        $this->includeUserDetails = $includeUserDetails;
        $this->includeOldValues = $includeOldValues;
        $this->includeNewValues = $includeNewValues;
        $this->dateFormat = $dateFormat;
    }

    /**
     * @return Collection
     */
    public function collection()
    {
        return $this->logs;
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        $headers = [];

        if ($this->includeUserDetails) {
            $headers[] = 'User Name';
            $headers[] = 'User Email';
            $headers[] = 'User Role';
        }

        $headers = array_merge($headers, [
            'Timestamp',
            'Action Type',
            'Table Name',
            'Record ID',
            'Description',
            'IP Address',
            'Browser Info'
        ]);

        if ($this->includeOldValues) {
            $headers[] = 'Old Values';
        }

        if ($this->includeNewValues) {
            $headers[] = 'New Values';
        }

        return $headers;
    }

    /**
     * @param mixed $log
     * @return array
     */
    public function map($log): array
    {
        $row = [];

        if ($this->includeUserDetails) {
            $row[] = $log->user->name ?? 'Unknown';
            $row[] = $log->user->email ?? 'Unknown';
            $row[] = $log->user->role ?? 'Unknown';
        }

        // Format timestamp
        $timestamp = $this->dateFormat === 'iso' 
            ? $log->timestamp 
            : Carbon::parse($log->timestamp)->format('Y-m-d H:i:s');

        $row[] = $timestamp;
        $row[] = strtoupper(str_replace('_', ' ', $log->action_type));
        $row[] = strtoupper(str_replace('_', ' ', $log->table_name));
        $row[] = $log->record_id;
        $row[] = $log->description;
        $row[] = $log->ip_address;
        $row[] = $this->getBrowserInfo($log->user_agent);

        if ($this->includeOldValues) {
            $row[] = $log->old_values ? $this->formatJsonForExcel($log->old_values) : '';
        }

        if ($this->includeNewValues) {
            $row[] = $log->new_values ? $this->formatJsonForExcel($log->new_values) : '';
        }

        return $row;
    }

    /**
     * @param Worksheet $sheet
     * @return array
     */
    public function styles(Worksheet $sheet)
    {
        return [
            // Style the first row as bold text
            1 => ['font' => ['bold' => true, 'size' => 12]],
            
            // Style all cells to wrap text
            'A:Z' => [
                'alignment' => [
                    'wrapText' => true,
                    'vertical' => 'top'
                ]
            ]
        ];
    }

    /**
     * @return array
     */
    public function columnWidths(): array
    {
        $widths = [];

        $columnIndex = 0;
        if ($this->includeUserDetails) {
            $widths[chr(65 + $columnIndex++)] = 20; // User Name
            $widths[chr(65 + $columnIndex++)] = 25; // User Email
            $widths[chr(65 + $columnIndex++)] = 15; // User Role
        }

        $widths[chr(65 + $columnIndex++)] = 20; // Timestamp
        $widths[chr(65 + $columnIndex++)] = 15; // Action Type
        $widths[chr(65 + $columnIndex++)] = 15; // Table Name
        $widths[chr(65 + $columnIndex++)] = 12; // Record ID
        $widths[chr(65 + $columnIndex++)] = 40; // Description
        $widths[chr(65 + $columnIndex++)] = 15; // IP Address
        $widths[chr(65 + $columnIndex++)] = 20; // Browser Info

        if ($this->includeOldValues) {
            $widths[chr(65 + $columnIndex++)] = 30; // Old Values
        }

        if ($this->includeNewValues) {
            $widths[chr(65 + $columnIndex++)] = 30; // New Values
        }

        return $widths;
    }

    /**
     * @return string
     */
    public function title(): string
    {
        return 'Activity Logs - ' . now()->format('Y-m-d');
    }

    /**
     * Format JSON data for Excel display
     */
    private function formatJsonForExcel($jsonData): string
    {
        if (is_array($jsonData)) {
            $formatted = [];
            foreach ($jsonData as $key => $value) {
                if (is_array($value) || is_object($value)) {
                    $formatted[] = $key . ': ' . json_encode($value);
                } else {
                    $formatted[] = $key . ': ' . $value;
                }
            }
            return implode("\n", $formatted);
        }

        return json_encode($jsonData, JSON_PRETTY_PRINT);
    }

    /**
     * Extract browser info from user agent
     */
    private function getBrowserInfo(string $userAgent): string
    {
        $browser = 'Unknown';
        $os = 'Unknown';
        $device = 'Desktop';

        // Simple browser detection
        if (preg_match('/Chrome\/([0-9.]+)/', $userAgent, $matches)) {
            $browser = 'Chrome ' . explode('.', $matches[1])[0];
        } elseif (preg_match('/Firefox\/([0-9.]+)/', $userAgent, $matches)) {
            $browser = 'Firefox ' . explode('.', $matches[1])[0];
        } elseif (preg_match('/Safari\/([0-9.]+)/', $userAgent, $matches)) {
            $browser = 'Safari';
        } elseif (preg_match('/Edge\/([0-9.]+)/', $userAgent, $matches)) {
            $browser = 'Edge ' . explode('.', $matches[1])[0];
        }

        // Simple OS detection
        if (strpos($userAgent, 'Windows') !== false) {
            $os = 'Windows';
        } elseif (strpos($userAgent, 'Mac') !== false) {
            $os = 'macOS';
        } elseif (strpos($userAgent, 'Linux') !== false) {
            $os = 'Linux';
        } elseif (strpos($userAgent, 'Android') !== false) {
            $os = 'Android';
            $device = 'Mobile';
        } elseif (strpos($userAgent, 'iOS') !== false) {
            $os = 'iOS';
            $device = 'Mobile';
        }

        // Device type detection
        if (strpos($userAgent, 'Mobile') !== false) {
            $device = 'Mobile';
        } elseif (strpos($userAgent, 'Tablet') !== false) {
            $device = 'Tablet';
        }

        return $browser . ' (' . $os . ', ' . $device . ')';
    }
}