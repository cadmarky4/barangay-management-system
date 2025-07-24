<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Carbon\Carbon;
use OwenIt\Auditing\Contracts\Auditable;
use Illuminate\Support\Facades\Auth;

class Project extends Model implements Auditable
{
    use HasFactory, HasUuids, \OwenIt\Auditing\Auditable;

    protected $auditModel = ActivityLog::class;
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'project_code',
        'title',
        'description',
        'objectives',
        'expected_outcomes',
        'category',
        'type',
        'priority',
        'start_date',
        'end_date',
        'actual_start_date',
        'actual_end_date',
        'duration_days',
        'total_budget',
        'allocated_budget',
        'utilized_budget',
        'remaining_budget',
        'funding_source',
        'funding_agency',
        'location',
        'target_puroks',
        'target_beneficiaries',
        'actual_beneficiaries',
        'beneficiary_criteria',
        'status',
        'progress_percentage',
        'team_size',
        'project_manager_id',
        'approving_official_id',
        'approved_date',
        'attachments',
        'remarks',
        'completion_report',
        'lessons_learned',
        'last_monitoring_date',
        'monitoring_remarks',
        'quality_rating',
        'evaluation_notes',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'actual_start_date' => 'date',
        'actual_end_date' => 'date',
        'approved_date' => 'date',
        'last_monitoring_date' => 'date',
        'total_budget' => 'decimal:2',
        'allocated_budget' => 'decimal:2',
        'utilized_budget' => 'decimal:2',
        'remaining_budget' => 'decimal:2',
        'target_beneficiaries' => 'integer',
        'actual_beneficiaries' => 'integer',
        'duration_days' => 'integer',
        'progress_percentage' => 'integer',
        'quality_rating' => 'integer',
        'target_puroks' => 'array',
        'attachments' => 'array',
        'lessons_learned' => 'array'
    ];

    protected $appends = [
        'budget_utilization_rate',
        'days_remaining',
        'is_overdue',
        'beneficiary_reach_rate'
    ];

    // Relationships
    public function projectManager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'project_manager_id');
    }

    public function approvingOfficial(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approving_official_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function milestones(): HasMany
    {
        return $this->hasMany(ProjectMilestone::class);
    }

    public function teamMembers(): HasMany
    {
        return $this->hasMany(ProjectTeamMember::class);
    }

    // Computed attributes
    public function getBudgetUtilizationRateAttribute(): float
    {
        if ($this->allocated_budget == 0) return 0;
        return round(($this->utilized_budget / $this->allocated_budget) * 100, 2);
    }

    public function getDaysRemainingAttribute(): int
    {
        if ($this->status === 'COMPLETED' || !$this->end_date) return 0;
        
        $endDate = $this->actual_end_date ?? $this->end_date;
        return max(0, Carbon::parse($endDate)->diffInDays(now(), false));
    }

    public function getIsOverdueAttribute(): bool
    {
        if (in_array($this->status, ['COMPLETED', 'CANCELLED', 'SUSPENDED'])) {
            return false;
        }
        
        return $this->end_date && $this->end_date->isPast();
    }

    public function getBeneficiaryReachRateAttribute(): float
    {
        if ($this->target_beneficiaries == 0) return 0;
        return round(($this->actual_beneficiaries / $this->target_beneficiaries) * 100, 2);
    }

    // Scopes
    public function scopeActive(Builder $query): Builder
    {
        return $query->whereIn('status', ['APPROVED', 'IN_PROGRESS']);
    }

    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('status', 'COMPLETED');
    }

    public function scopeOverdue(Builder $query): Builder
    {
        return $query->where('end_date', '<', now())
                    ->whereNotIn('status', ['COMPLETED', 'CANCELLED', 'SUSPENDED']);
    }

    public function scopeByCategory(Builder $query, string $category): Builder
    {
        return $query->where('category', $category);
    }

    public function scopeHighPriority(Builder $query): Builder
    {
        return $query->whereIn('priority', ['HIGH', 'CRITICAL']);
    }

    public function scopeByManager(Builder $query, int $managerId): Builder
    {
        return $query->where('project_manager_id', $managerId);
    }

    public function scopeWithinBudget(Builder $query, float $minBudget, float $maxBudget): Builder
    {
        return $query->whereBetween('total_budget', [$minBudget, $maxBudget]);
    }

    // Helper methods
    public function generateProjectCode(): string
    {
        $year = date('Y');
        $categoryCode = $this->getCategoryCode();
        $count = static::where('category', $this->category)
                      ->whereYear('created_at', $year)
                      ->count() + 1;
        
        return "PROJ-{$categoryCode}-{$year}-" . str_pad($count, 3, '0', STR_PAD_LEFT);
    }

    private function getCategoryCode(): string
    {
        $codes = [
            'INFRASTRUCTURE' => 'INF',
            'HEALTH' => 'HLT',
            'EDUCATION' => 'EDU',
            'SOCIAL_SERVICES' => 'SOC',
            'ENVIRONMENT' => 'ENV',
            'LIVELIHOOD' => 'LIV',
            'DISASTER_PREPAREDNESS' => 'DIS',
            'YOUTH_DEVELOPMENT' => 'YTH',
            'SENIOR_CITIZEN_PROGRAM' => 'SNR',
            'WOMEN_EMPOWERMENT' => 'WMN',
            'OTHER' => 'OTH'
        ];

        return $codes[$this->category] ?? 'GEN';
    }

    public function approve(int $approvingOfficialId): void
    {
        $this->update([
            'status' => 'APPROVED',
            'approving_official_id' => $approvingOfficialId,
            'approved_date' => now()
        ]);
    }

    public function start(): void
    {
        $this->update([
            'status' => 'IN_PROGRESS',
            'actual_start_date' => now()
        ]);
    }

    public function complete(string $completionReport = null): void
    {
        $this->update([
            'status' => 'COMPLETED',
            'actual_end_date' => now(),
            'progress_percentage' => 100,
            'completion_report' => $completionReport
        ]);
    }

    public function suspend(string $reason): void
    {
        $this->update([
            'status' => 'SUSPENDED',
            'remarks' => $reason
        ]);
    }

    public function cancel(string $reason): void
    {
        $this->update([
            'status' => 'CANCELLED',
            'remarks' => $reason
        ]);
    }

    public function putOnHold(string $reason): void
    {
        $this->update([
            'status' => 'ON_HOLD',
            'remarks' => $reason
        ]);
    }

    public function updateProgress(int $percentage): void
    {
        $percentage = max(0, min(100, $percentage));
        
        $this->update([
            'progress_percentage' => $percentage
        ]);

        if ($percentage >= 100 && $this->status !== 'COMPLETED') {
            $this->complete();
        }
    }

    public function addBudgetUtilization(float $amount, string $description = null): void
    {
        $newUtilized = $this->utilized_budget + $amount;
        $newRemaining = $this->allocated_budget - $newUtilized;

        $this->update([
            'utilized_budget' => $newUtilized,
            'remaining_budget' => $newRemaining
        ]);
    }

    public function assignManager(int $managerId): void
    {
        $this->update([
            'project_manager_id' => $managerId
        ]);
    }

    public function updateBeneficiaries(int $actualCount): void
    {
        $this->update([
            'actual_beneficiaries' => $actualCount
        ]);
    }

    public function addMonitoringEntry(string $remarks, int $qualityRating = null): void
    {
        $this->update([
            'last_monitoring_date' => now(),
            'monitoring_remarks' => $remarks,
            'quality_rating' => $qualityRating
        ]);
    }

    public function calculateDuration(): void
    {
        if ($this->start_date && $this->end_date) {
            $this->update([
                'duration_days' => $this->start_date->diffInDays($this->end_date)
            ]);
        }
    }

    public function calculateRemainingBudget(): void
    {
        $this->update([
            'remaining_budget' => $this->allocated_budget - $this->utilized_budget
        ]);
    }

    public function isWithinBudget(): bool
    {
        return $this->utilized_budget <= $this->allocated_budget;
    }

    public function isBehindSchedule(): bool
    {
        if ($this->status === 'COMPLETED') return false;
        
        $today = now();
        $totalDays = $this->start_date->diffInDays($this->end_date);
        $elapsedDays = $this->start_date->diffInDays($today);
        
        if ($totalDays == 0) return false;
        
        $expectedProgress = ($elapsedDays / $totalDays) * 100;
        return $this->progress_percentage < $expectedProgress;
    }

    /**
     * Transform project data to frontend format
     */
    public function toFrontendFormat(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'category' => $this->category,
            'description' => $this->description,
            'budget' => number_format($this->total_budget, 2),
            'progress' => $this->progress_percentage,
            'status' => $this->status,
            'startDate' => $this->start_date ? $this->start_date->toDateString() : null,
            'completedDate' => $this->actual_end_date ? $this->actual_end_date->toDateString() : null,
            'priority' => strtolower($this->priority),
            'teamSize' => $this->team_size,
            'lastUpdated' => $this->updated_at->toISOString(),
        ];
    }

    /**
     * Update project from frontend data
     */
    public function updateFromFrontend(array $data): void
    {
        $mappedData = [
            'title' => $data['title'] ?? $this->title,
            'category' => $data['category'] ?? $this->category,
            'description' => $data['description'] ?? $this->description,
            'total_budget' => isset($data['budget']) ? (float) str_replace(',', '', $data['budget']) : $this->total_budget,
            'progress_percentage' => $data['progress'] ?? $this->progress_percentage,
            'status' => $data['status'] ?? $this->status,
            'start_date' => $data['startDate'] ?? $this->start_date,
            'actual_end_date' => $data['completedDate'] ?? $this->actual_end_date,
            'priority' => isset($data['priority']) ? strtolower($data['priority']) : $this->priority,
            'team_size' => $data['teamSize'] ?? $this->team_size,
        ];

        $this->update($mappedData);
    }

    // Boot method
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($project) {
            if (empty($project->project_code)) {
                $project->project_code = $project->generateProjectCode();
            }
            
            // Calculate duration if dates are provided
            if ($project->start_date && $project->end_date) {
                $project->duration_days = Carbon::parse($project->start_date)
                    ->diffInDays(Carbon::parse($project->end_date));
            }
            
            // Set remaining budget
            if ($project->allocated_budget && !isset($project->remaining_budget)) {
                $project->remaining_budget = $project->allocated_budget;
            }
        });

        static::updating(function ($project) {
            // Recalculate remaining budget when utilized budget changes
            if ($project->isDirty('utilized_budget') || $project->isDirty('allocated_budget')) {
                $project->remaining_budget = $project->allocated_budget - $project->utilized_budget;
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
            'created' => "$user created a new project record",
            'updated' => "$user updated project information",
            'deleted' => "$user deleted a project record",
            default => "$user performed $event action"
        };
    }
}
