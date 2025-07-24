<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use OwenIt\Auditing\Contracts\Auditable;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class BarangayOfficial extends Model implements Auditable
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
        return match($event) {
            'created' => "{$user} created a new appointment record",
            'updated' => "{$user} updated appointment information", 
            'deleted' => "{$user} deleted a appointment record",
            default => "{$user} performed {$event} action"
        };
    }

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'prefix',
        'resident_id',
        'position',
        'committee_assignment',
        'term_start',
        'term_end',
        'term_number',
        'is_current_term',
        'status'
    ];

    protected $casts = [
        'term_start' => 'date',
        'term_end' => 'date',
        'is_current_term' => 'boolean',
        'term_number' => 'integer'
    ];

    // Define enum constants
    const POSITIONS = [
        'BARANGAY_CAPTAIN',
        'BARANGAY_SECRETARY',
        'BARANGAY_TREASURER',
        'KAGAWAD',
        'SK_CHAIRPERSON', 
        'SK_KAGAWAD', 
        'BARANGAY_CLERK', 
        'BARANGAY_TANOD',
    ];

    const COMMITTEES = [
        'Health',
        'Education',
        'Public Safety',
        'Environment',
        'Peace and Order',
        'Sports and Recreation',
        'Women and Family',
        'Senior Citizens'
    ];

    const STATUSES = [
        'ACTIVE',
        'INACTIVE',
        'SUSPENDED',
        'RESIGNED',
        'TERMINATED',
        'DECEASED'
    ];

    // Relationships
    public function resident(): BelongsTo
    {
        return $this->belongsTo(Resident::class);
    }

    // Scopes
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'ACTIVE');
    }

    public function scopeCurrentTerm(Builder $query): Builder
    {
        return $query->where('is_current_term', true);
    }

    public function scopeByPosition(Builder $query, string $position): Builder
    {
        return $query->where('position', $position);
    }

    // Helper methods
    public function updateStatus(string $status): void
    {
        $this->update([
            'status' => $status,
            'is_current_term' => $status === 'ACTIVE'
        ]);
    }

    public function startNewTerm(Carbon $startDate, Carbon $endDate, int $termNumber = null): void
    {
        $this->update([
            'term_start' => $startDate,
            'term_end' => $endDate,
            'term_number' => $termNumber ?? ($this->term_number + 1),
            'is_current_term' => true,
            'status' => 'ACTIVE'
        ]);
    }
}