<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use App\Models\Schemas\AgendaSchema;
use Carbon\Carbon;

class Agenda extends Model
{
    use HasFactory;

    /**
     * Indicates if the model should use UUIDs
     */
    public $incrementing = false;
    protected $keyType = 'string';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'title',
        'description',
        'date',
        'time',
        'end_time',
        'duration_minutes',
        'category',
        'priority',
        'status',
        'location',
        'venue',
        'participants',
        'organizer',
        'notes',
        'attachments',
        'reminder_enabled',
        'reminder_minutes_before',
        'created_by',
        'updated_by',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'id' => 'string',
        'date' => 'datetime',
        'participants' => 'array',
        'attachments' => 'array',
        'reminder_enabled' => 'boolean',
        'reminder_minutes_before' => 'integer',
        'created_by' => 'integer',
        'updated_by' => 'integer',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the validation rules for creating a new agenda
     */
    public static function getCreateRules(): array
    {
        return AgendaSchema::getCreateValidationRules();
    }

    /**
     * Get the validation rules for updating an agenda
     */
    public static function getUpdateRules(): array
    {
        return AgendaSchema::getUpdateValidationRules();
    }

    /**
     * Relations
     */
    
    /**
     * Get the user who created this agenda
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this agenda
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Scopes
     */

    /**
     * Scope to filter by category
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope to filter by priority
     */
    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    /**
     * Scope to filter by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to filter by date range
     */
    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    /**
     * Scope to filter by specific date
     */
    public function scopeByDate($query, $date)
    {
        return $query->where('date', $date);
    }

    /**
     * Scope to filter by month and year
     */
    public function scopeByMonthYear($query, $month, $year)
    {
        return $query->whereMonth('date', $month)->whereYear('date', $year);
    }

    /**
     * Scope to filter upcoming agendas
     */
    public function scopeUpcoming($query, $days = 7)
    {
        $endDate = now()->addDays($days)->toDateString();
        return $query->where('date', '>=', now()->toDateString())
                    ->where('date', '<=', $endDate)
                    ->orderBy('date')
                    ->orderBy('time');
    }

    /**
     * Scope to filter today's agendas
     */
    public function scopeToday($query)
    {
        return $query->where('date', now()->toDateString())
                    ->orderBy('time');
    }

    /**
     * Scope to filter overdue agendas
     */
    public function scopeOverdue($query)
    {
        return $query->where('date', '<', now()->toDateString())
                    ->where('status', 'SCHEDULED');
    }

    /**
     * Scope to search agendas
     */
    public function scopeSearch($query, $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('title', 'LIKE', "%{$term}%")
              ->orWhere('description', 'LIKE', "%{$term}%")
              ->orWhere('location', 'LIKE', "%{$term}%")
              ->orWhere('venue', 'LIKE', "%{$term}%")
              ->orWhere('organizer', 'LIKE', "%{$term}%")
              ->orWhere('notes', 'LIKE', "%{$term}%");
        });
    }

    /**
     * Accessors & Mutators
     */

    /**
     * Get the formatted date time
     */
    public function getFormattedDateTimeAttribute()
    {
        $date = Carbon::parse($this->date);
        return $date->format('M d, Y') . ' at ' . $this->time;
    }

    /**
     * Get the color for calendar display based on category
     */
    public function getColorAttribute()
    {
        $colors = [
            'MEETING' => '#60a5fa',      // blue-400
            'REVIEW' => '#4ade80',       // green-400
            'PRESENTATION' => '#a78bfa', // purple-400
            'EVALUATION' => '#facc15',   // yellow-400
            'BUDGET' => '#f87171',       // red-400
            'PLANNING' => '#818cf8',     // indigo-400
            'INSPECTION' => '#fb923c',   // orange-400
            'OTHER' => '#9ca3af',        // gray-400
        ];

        return $colors[$this->category] ?? $colors['OTHER'];
    }

    /**
     * Check if the agenda is overdue
     */
    public function getIsOverdueAttribute()
    {
        return Carbon::parse($this->date)->isPast() && $this->status === 'SCHEDULED';
    }

    /**
     * Check if the agenda is today
     */
    public function getIsTodayAttribute()
    {
        return Carbon::parse($this->date)->isToday();
    }

    /**
     * Check if the agenda is upcoming
     */
    public function getIsUpcomingAttribute()
    {
        return Carbon::parse($this->date)->isFuture();
    }

    /**
     * Get the duration in hours
     */
    public function getDurationHoursAttribute()
    {
        return $this->duration_minutes ? round($this->duration_minutes / 60, 2) : null;
    }

    /**
     * Methods
     */

    /**
     * Mark agenda as completed
     */
    public function markAsCompleted($notes = null)
    {
        $this->update([
            'status' => 'COMPLETED',
            'notes' => $notes ? $this->notes . "\n\n" . $notes : $this->notes,
            'updated_by' => Auth::id(),
        ]);

        return $this;
    }

    /**
     * Mark agenda as cancelled
     */
    public function markAsCancelled($reason = null)
    {
        $this->update([
            'status' => 'CANCELLED',
            'notes' => $reason ? $this->notes . "\n\nCancelled: " . $reason : $this->notes,
            'updated_by' => Auth::id(),
        ]);

        return $this;
    }

    /**
     * Duplicate the agenda to a new date
     */
    public function duplicate($newDate = null, $newTime = null)
    {
        $duplicate = $this->replicate();
        $duplicate->id = (string) Str::uuid();
        $duplicate->date = $newDate ?: $this->date;
        $duplicate->time = $newTime ?: $this->time;
        $duplicate->status = 'SCHEDULED';
        $duplicate->created_by = Auth::id();
        $duplicate->updated_by = null;
        $duplicate->save();

        return $duplicate;
    }
}
