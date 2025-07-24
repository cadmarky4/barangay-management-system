<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Carbon\Carbon;
use OwenIt\Auditing\Contracts\Auditable;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Complaint extends Model implements Auditable
{
    use HasFactory, HasUuids, \OwenIt\Auditing\Auditable;

    protected $auditModel = ActivityLog::class;
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'base_ticket_id',
        'c_category',
        'department',
        'location',
    ];

    const CATEGORIES = [
        'PUBLIC_SERVICES',
        'INFRASTRUCTURE',
        'SOCIAL_WELFARE',
        'PUBLIC_SAFETY',
        'HEALTH_SERVICES',
        'ENVIRONMENTAL',
        'EDUCATION',
        'BUSINESS_PERMITS',
        'COMMUNITY_PROGRAMS',
        'OTHERS'
    ];

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

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = Str::uuid()->toString();
            }
        });
    }

    // OwenIt Auditing
    public function transformAudit(array $data): array
    {
        return [
            'user_id' => Auth::id() ?? null,
            'action_type' => $data['event'],
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
        return match($event) {
            'created' => "$user created a new complaint record",
            'updated' => "$user updated complaint information",
            'deleted' => "$user deleted a complaint record",
            default => "$user performed $event action"
        };
    }

    public function ticket()
    {
        return $this->belongsTo(Ticket::class, 'base_ticket_id');
    }
}
