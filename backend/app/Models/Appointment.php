<?php

// app/Models/Appointment.php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use OwenIt\Auditing\Contracts\Auditable;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appointment extends Model implements Auditable
{
    use HasFactory, HasUuids;

    use \OwenIt\Auditing\Auditable;

    protected $auditModel = ActivityLog::class;

    public function transformAudit(array $data): array
    {
        return [
            'user_id' => Auth::id() ?? null,
            'action_type' => $data['event'], // created, updated, deleted
            'auditable_type' => get_class($this),
            'auditable_id' => $this->getKey(),
            'table_name' => $this->getTable(),
            'record_id' => $this->getKey(),
            'old_values' => $data['old_values'] ?? null,
            'new_values' => $data['new_values'] ?? null,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'timestamp' => now(),
            'description' => $this->generateDescription($data['event'])
        ];
    }

    private function generateDescription($event)
    {
        $user = Auth::user() ? Auth::user()->name : 'System';
        return match ($event) {
            'created' => "{$user} created a new appointment record",
            'updated' => "{$user} updated appointment information",
            'deleted' => "{$user} deleted a appointment record",
            default => "{$user} performed {$event} action"
        };
    }

    protected $keyType = 'string';
    public $incrementing = false;

    // Use static initialization instead of constructor
    protected $fillable = [
        'base_ticket_id',
        'department',
        'date',
        'time',
        'additional_notes',
    ];

    protected $casts = [
        'date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Constants for departments (adjust based on your DepartmentSchema)
    const DEPARTMENTS = [
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

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class, 'base_ticket_id');
    }

    // // Scope for checking schedule conflicts
    // public function scopeByDateAndTime($query, $date, $time)
    // {
    //     return $query->where('date', $date)->where('time', $time);
    // }
    public function scopeByDateAndTime($query, $date, $time)
    {
        return $query->whereRaw('DATE(date) = ?', [$date])
            ->where('time', $time);
    }

    public function scopeByDepartment($query, $department)
    {
        return $query->where('department', $department);
    }
}