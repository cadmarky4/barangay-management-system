<?php

namespace App\Traits;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;

trait LogsActivity
{
    /**
     * Boot the trait
     */
    public static function bootLogsActivity()
    {
        static::created(function ($model) {
            $model->logActivity('created');
        });

        static::updated(function ($model) {
            $model->logActivity('updated', $model->getOriginal());
        });

        static::deleted(function ($model) {
            $model->logActivity('deleted', $model->getAttributes());
        });
    }

    /**
     * Log activity for the model
     */
    public function logActivity(string $action, array $oldValues = null): void
    {
        // Skip logging if no authenticated user (unless it's a system action)
        if (!Auth::check() && !$this->shouldLogSystemActions()) {
            return;
        }

        $user = Auth::user();
        $description = $this->generateActivityDescription($action, $user);

        ActivityLog::createLog([
            'user_id' => $user ? $user->id : null,
            'action_type' => $action,
            'table_name' => $this->getTable(),
            'record_id' => $this->getKey(),
            'old_values' => $this->formatValuesForLogging($oldValues),
            'new_values' => $action !== 'deleted' ? $this->formatValuesForLogging($this->getAttributes()) : null,
            'description' => $description,
        ]);
    }

    /**
     * Log a custom activity
     */
    public function logCustomActivity(string $action, string $description = null, array $oldValues = null, array $newValues = null): void
    {
        $user = Auth::user();

        ActivityLog::createLog([
            'user_id' => $user ? $user->id : null,
            'action_type' => $action,
            'table_name' => $this->getTable(),
            'record_id' => $this->getKey(),
            'old_values' => $this->formatValuesForLogging($oldValues),
            'new_values' => $this->formatValuesForLogging($newValues),
            'description' => $description ?? $this->generateActivityDescription($action, $user),
        ]);
    }

    /**
     * Generate activity description
     */
    protected function generateActivityDescription(string $action, $user = null): string
    {
        $userName = $user ? $user->name : 'System';
        $modelName = class_basename($this);

        return match($action) {
            'created' => "{$userName} created a new {$modelName}",
            'updated' => "{$userName} updated {$modelName} information",
            'deleted' => "{$userName} deleted a {$modelName}",
            'viewed' => "{$userName} viewed {$modelName} details",
            'exported' => "{$userName} exported {$modelName} data",
            'restored' => "{$userName} restored a {$modelName}",
            'archived' => "{$userName} archived a {$modelName}",
            default => "{$userName} performed {$action} action on {$modelName}"
        };
    }

    /**
     * Format values for logging (remove sensitive data)
     */
    protected function formatValuesForLogging($values): ?array
    {
        if (!$values) {
            return null;
        }

        // Remove sensitive fields
        $sensitiveFields = $this->getSensitiveFields();
        
        $filteredValues = collect($values)
            ->except($sensitiveFields)
            ->map(function ($value) {
                // Convert dates to string format
                if ($value instanceof \DateTime) {
                    return $value->format('Y-m-d H:i:s');
                }
                return $value;
            })
            ->toArray();

        return empty($filteredValues) ? null : $filteredValues;
    }

    /**
     * Get sensitive fields that should not be logged
     */
    protected function getSensitiveFields(): array
    {
        return [
            'password',
            'password_confirmation',
            'remember_token',
            'api_token',
            'two_factor_secret',
            'two_factor_recovery_codes',
            'email_verified_at',
            'created_at',
            'updated_at',
        ];
    }

    /**
     * Determine if system actions should be logged
     */
    protected function shouldLogSystemActions(): bool
    {
        return property_exists($this, 'logSystemActions') ? $this->logSystemActions : false;
    }

    /**
     * Get the activity logs for this model
     */
    public function activityLogs()
    {
        return ActivityLog::where('table_name', $this->getTable())
                         ->where('record_id', $this->getKey())
                         ->orderBy('timestamp', 'desc');
    }

    /**
     * Get recent activity logs
     */
    public function recentActivityLogs(int $limit = 10)
    {
        return $this->activityLogs()->limit($limit)->get();
    }

    /**
     * Check if model has activity logs
     */
    public function hasActivityLogs(): bool
    {
        return $this->activityLogs()->exists();
    }

    /**
     * Get activity logs count
     */
    public function getActivityLogsCount(): int
    {
        return $this->activityLogs()->count();
    }

    /**
     * Get last activity log
     */
    public function getLastActivityLog()
    {
        return $this->activityLogs()->first();
    }

    /**
     * Get activity logs by action type
     */
    public function getActivityLogsByAction(string $action)
    {
        return $this->activityLogs()->where('action_type', $action)->get();
    }

    /**
     * Disable activity logging for specific operations
     */
    public function withoutActivityLogging(\Closure $callback)
    {
        $this->skipActivityLogging = true;
        
        try {
            return $callback();
        } finally {
            $this->skipActivityLogging = false;
        }
    }

    /**
     * Check if activity logging should be skipped
     */
    protected function shouldSkipActivityLogging(): bool
    {
        return property_exists($this, 'skipActivityLogging') && $this->skipActivityLogging;
    }
}