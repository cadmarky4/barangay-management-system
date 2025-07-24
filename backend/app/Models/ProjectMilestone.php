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

class ProjectMilestone extends Model implements Auditable
{
    use HasFactory, HasUuids, \OwenIt\Auditing\Auditable;

    protected $auditModel = ActivityLog::class;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'project_id',
        'title',
        'description',
        'sequence_order',
        'target_date',
        'actual_completion_date',
        'estimated_duration_days',
        'status',
        'progress_percentage',
        'weight_percentage',
        'deliverables',
        'requirements',
        'attachments',
        'allocated_budget',
        'actual_cost',
        'responsible_user_id',
        'responsible_team',
        'quality_score',
        'completion_notes',
        'remarks',
        'dependencies',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'target_date' => 'date',
        'actual_completion_date' => 'date',
        'estimated_duration_days' => 'integer',
        'progress_percentage' => 'integer',
        'weight_percentage' => 'decimal:2',
        'allocated_budget' => 'decimal:2',
        'actual_cost' => 'decimal:2',
        'quality_score' => 'integer',
        'sequence_order' => 'integer',
        'deliverables' => 'array',
        'requirements' => 'array',
        'attachments' => 'array',
        'dependencies' => 'array'
    ];

    protected $appends = [
        'is_overdue',
        'days_remaining',
        'budget_variance'
    ];

    // Relationships
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function responsibleUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responsible_user_id');
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
    public function getIsOverdueAttribute(): bool
    {
        if (in_array($this->status, ['COMPLETED', 'CANCELLED'])) {
            return false;
        }
        
        return $this->target_date && $this->target_date->isPast();
    }

    public function getDaysRemainingAttribute(): int
    {
        if ($this->status === 'COMPLETED' || !$this->target_date) return 0;
        
        return max(0, Carbon::now()->diffInDays($this->target_date, false));
    }

    public function getBudgetVarianceAttribute(): float
    {
        if (!$this->allocated_budget || !$this->actual_cost) return 0;
        
        return $this->actual_cost - $this->allocated_budget;
    }

    // Scopes
    public function scopeByProject(Builder $query, int $projectId): Builder
    {
        return $query->where('project_id', $projectId);
    }

    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('status', 'COMPLETED');
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', 'PENDING');
    }

    public function scopeInProgress(Builder $query): Builder
    {
        return $query->where('status', 'IN_PROGRESS');
    }

    public function scopeOverdue(Builder $query): Builder
    {
        return $query->where('target_date', '<', now())
                    ->whereNotIn('status', ['COMPLETED', 'CANCELLED']);
    }

    public function scopeOrderedBySequence(Builder $query): Builder
    {
        return $query->orderBy('sequence_order');
    }

    public function scopeByResponsible(Builder $query, int $userId): Builder
    {
        return $query->where('responsible_user_id', $userId);
    }

    // Helper methods
    public function start(): void
    {
        $this->update([
            'status' => 'IN_PROGRESS'
        ]);
    }

    public function complete(string $notes = null, int $qualityScore = null): void
    {
        $this->update([
            'status' => 'COMPLETED',
            'actual_completion_date' => now(),
            'progress_percentage' => 100,
            'completion_notes' => $notes,
            'quality_score' => $qualityScore
        ]);

        // Update project progress
        $this->updateProjectProgress();
    }

    public function markAsDelayed(string $reason = null): void
    {
        $this->update([
            'status' => 'DELAYED',
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

    public function updateProgress(int $percentage): void
    {
        $percentage = max(0, min(100, $percentage));
        
        $this->update([
            'progress_percentage' => $percentage
        ]);

        if ($percentage >= 100 && $this->status !== 'COMPLETED') {
            $this->complete();
        } elseif ($percentage > 0 && $this->status === 'PENDING') {
            $this->start();
        }

        // Update project progress
        $this->updateProjectProgress();
    }

    public function assignResponsible(int $userId, string $team = null): void
    {
        $this->update([
            'responsible_user_id' => $userId,
            'responsible_team' => $team
        ]);
    }

    public function updateBudget(float $allocatedBudget, float $actualCost = null): void
    {
        $this->update([
            'allocated_budget' => $allocatedBudget,
            'actual_cost' => $actualCost
        ]);
    }

    public function reschedule(Carbon $newTargetDate, string $reason = null): void
    {
        $this->update([
            'target_date' => $newTargetDate,
            'remarks' => $reason
        ]);
    }

    public function addDeliverable(string $deliverable): void
    {
        $deliverables = $this->deliverables ?? [];
        $deliverables[] = $deliverable;
        
        $this->update([
            'deliverables' => $deliverables
        ]);
    }

    public function addRequirement(string $requirement): void
    {
        $requirements = $this->requirements ?? [];
        $requirements[] = $requirement;
        
        $this->update([
            'requirements' => $requirements
        ]);
    }

    public function addDependency(int $milestoneId): void
    {
        $dependencies = $this->dependencies ?? [];
        
        if (!in_array($milestoneId, $dependencies)) {
            $dependencies[] = $milestoneId;
            
            $this->update([
                'dependencies' => $dependencies
            ]);
        }
    }

    public function removeDependency(int $milestoneId): void
    {
        $dependencies = $this->dependencies ?? [];
        $dependencies = array_diff($dependencies, [$milestoneId]);
        
        $this->update([
            'dependencies' => array_values($dependencies)
        ]);
    }

    public function canStart(): bool
    {
        if (!$this->dependencies || empty($this->dependencies)) {
            return true;
        }

        // Check if all dependencies are completed
        $completedDependencies = static::whereIn('id', $this->dependencies)
            ->where('status', 'COMPLETED')
            ->count();

        return $completedDependencies === count($this->dependencies);
    }

    public function getDependentMilestones()
    {
        return static::where('project_id', $this->project_id)
            ->whereJsonContains('dependencies', $this->id)
            ->get();
    }

    public function isOverBudget(): bool
    {
        if (!$this->allocated_budget || !$this->actual_cost) {
            return false;
        }
        
        return $this->actual_cost > $this->allocated_budget;
    }

    public function calculateDuration(): void
    {
        if ($this->actual_completion_date && $this->status === 'COMPLETED') {
            // Calculate actual duration if completed
            $startDate = $this->created_at;
            $actualDuration = $startDate->diffInDays($this->actual_completion_date);
            
            $this->update([
                'estimated_duration_days' => $actualDuration
            ]);
        }
    }

    private function updateProjectProgress(): void
    {
        // Calculate weighted progress for the project
        $project = $this->project;
        $milestones = $project->milestones;
        
        $totalWeight = $milestones->sum('weight_percentage');
        
        if ($totalWeight > 0) {
            $weightedProgress = $milestones->sum(function ($milestone) {
                return ($milestone->progress_percentage * $milestone->weight_percentage) / 100;
            });
            
            $projectProgress = ($weightedProgress / $totalWeight) * 100;
            
            $project->updateProgress(round($projectProgress));
        }
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
            'created' => "$user created a new project milestone record",
            'updated' => "$user updated project milestone information",
            'deleted' => "$user deleted a project milestone record",
            default => "$user performed $event action"
        };
    }

    // Boot method
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($milestone) {
            // Auto-assign sequence order if not provided
            if (empty($milestone->sequence_order)) {
                $maxOrder = static::where('project_id', $milestone->project_id)
                    ->max('sequence_order') ?? 0;
                $milestone->sequence_order = $maxOrder + 1;
            }
        });
    }
}
