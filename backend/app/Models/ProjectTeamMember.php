<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Carbon\Carbon;
use OwenIt\Auditing\Contracts\Auditable;
use Illuminate\Support\Facades\Auth;

class ProjectTeamMember extends Model implements Auditable
{
    use HasFactory, HasUuids, \OwenIt\Auditing\Auditable;

    protected $auditModel = ActivityLog::class;
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'project_id',
        'user_id',
        'member_name',
        'member_email',
        'member_contact',
        'role',
        'responsibilities',
        'is_active',
        'joined_date',
        'left_date',
        'expertise',
        'availability_percentage',
        'performance_rating',
        'contribution_notes',
        'receives_notifications',
        'communication_preference',
        'remarks',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'joined_date' => 'date',
        'left_date' => 'date',
        'is_active' => 'boolean',
        'receives_notifications' => 'boolean',
        'availability_percentage' => 'integer',
        'performance_rating' => 'integer'
    ];

    protected $appends = [
        'days_in_project',
        'is_current_member'
    ];

    // Relationships
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Computed attributes
    public function getDaysInProjectAttribute(): int
    {
        $endDate = $this->left_date ?? now();
        return Carbon::parse($this->joined_date)->diffInDays($endDate);
    }

    public function getIsCurrentMemberAttribute(): bool
    {
        return $this->is_active && !$this->left_date;
    }

    // Scopes
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true)
                    ->whereNull('left_date');
    }

    public function scopeInactive(Builder $query): Builder
    {
        return $query->where('is_active', false)
                    ->orWhereNotNull('left_date');
    }

    public function scopeByProject(Builder $query, int $projectId): Builder
    {
        return $query->where('project_id', $projectId);
    }

    public function scopeByRole(Builder $query, string $role): Builder
    {
        return $query->where('role', $role);
    }

    public function scopeManagers(Builder $query): Builder
    {
        return $query->whereIn('role', ['PROJECT_MANAGER', 'TEAM_LEADER']);
    }

    public function scopeMembers(Builder $query): Builder
    {
        return $query->where('role', 'MEMBER');
    }

    public function scopeExternal(Builder $query): Builder
    {
        return $query->whereIn('role', ['CONSULTANT', 'CONTRACTOR', 'SUPPLIER']);
    }

    public function scopeHighPerformers(Builder $query): Builder
    {
        return $query->where('performance_rating', '>=', 4);
    }

    // Helper methods
    public function deactivate(string $reason = null): void
    {
        $this->update([
            'is_active' => false,
            'left_date' => now(),
            'remarks' => $reason
        ]);
    }

    public function reactivate(): void
    {
        $this->update([
            'is_active' => true,
            'left_date' => null
        ]);
    }

    public function changeRole(string $newRole, string $newResponsibilities = null): void
    {
        $this->update([
            'role' => $newRole,
            'responsibilities' => $newResponsibilities ?? $this->responsibilities
        ]);
    }

    public function updateAvailability(int $percentage): void
    {
        $percentage = max(0, min(100, $percentage));
        
        $this->update([
            'availability_percentage' => $percentage
        ]);
    }

    public function ratePerformance(int $rating, string $notes = null): void
    {
        $rating = max(1, min(5, $rating));
        
        $this->update([
            'performance_rating' => $rating,
            'contribution_notes' => $notes
        ]);
    }

    public function updateContactInfo(string $email = null, string $contact = null): void
    {
        $updateData = [];
        
        if ($email) {
            $updateData['member_email'] = $email;
        }
        
        if ($contact) {
            $updateData['member_contact'] = $contact;
        }
        
        if (!empty($updateData)) {
            $this->update($updateData);
        }
    }

    public function setNotificationPreference(bool $receives, string $preference = null): void
    {
        $updateData = ['receives_notifications' => $receives];
        
        if ($preference) {
            $updateData['communication_preference'] = $preference;
        }
        
        $this->update($updateData);
    }

    public function addExpertise(string $expertise): void
    {
        $currentExpertise = $this->expertise ? $this->expertise . ', ' : '';
        
        $this->update([
            'expertise' => $currentExpertise . $expertise
        ]);
    }

    public function isManager(): bool
    {
        return in_array($this->role, ['PROJECT_MANAGER', 'TEAM_LEADER']);
    }

    public function isExternal(): bool
    {
        return in_array($this->role, ['CONSULTANT', 'CONTRACTOR', 'SUPPLIER']);
    }

    public function canReceiveNotifications(): bool
    {
        return $this->receives_notifications && $this->is_active && !$this->left_date;
    }

    public function getContactInfo(): array
    {
        // Return user contact info if available, otherwise member contact info
        if ($this->user) {
            return [
                'name' => $this->user->first_name . ' ' . $this->user->last_name,
                'email' => $this->user->email,
                'contact' => $this->member_contact
            ];
        }
        
        return [
            'name' => $this->member_name,
            'email' => $this->member_email,
            'contact' => $this->member_contact
        ];
    }

    public function calculateTenure(): array
    {
        $startDate = Carbon::parse($this->joined_date);
        $endDate = $this->left_date ? Carbon::parse($this->left_date) : now();
        
        $totalDays = $startDate->diffInDays($endDate);
        $months = $startDate->diffInMonths($endDate);
        $years = $startDate->diffInYears($endDate);
        
        return [
            'days' => $totalDays,
            'months' => $months,
            'years' => $years,
            'formatted' => $this->formatTenure($years, $months, $totalDays)
        ];
    }

    private function formatTenure(int $years, int $months, int $days): string
    {
        $parts = [];
        
        if ($years > 0) {
            $parts[] = $years . ' year' . ($years > 1 ? 's' : '');
        }
        
        if ($months > 0) {
            $parts[] = ($months % 12) . ' month' . (($months % 12) > 1 ? 's' : '');
        }
        
        if (empty($parts) && $days > 0) {
            $parts[] = $days . ' day' . ($days > 1 ? 's' : '');
        }
        
        return implode(', ', $parts) ?: '0 days';
    }

    public function getProjectStatus(): string
    {
        return $this->project->status ?? 'UNKNOWN';
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
            'created' => "$user added a new project team member",
            'updated' => "$user updated project team member information",
            'deleted' => "$user removed a project team member",
            default => "$user performed $event action"
        };
    }

    // Boot method
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($teamMember) {
            if (empty($teamMember->joined_date)) {
                $teamMember->joined_date = now();
            }
            
            // Set member name from user if not provided
            if (empty($teamMember->member_name) && $teamMember->user) {
                $teamMember->member_name = $teamMember->user->first_name . ' ' . $teamMember->user->last_name;
            }
        });
    }
}
