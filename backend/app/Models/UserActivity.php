<?php

// ============================================================================
// App/Models/UserActivity.php
// ============================================================================

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class UserActivity extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'user_id',
        'action',
        'resource',
        'resource_id',
        'ip_address',
        'user_agent',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relationships
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scopes
     */
    public function scopeByAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    public function scopeByResource($query, string $resource)
    {
        return $query->where('resource', $resource);
    }

    public function scopeRecent($query, int $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    /**
     * Accessors
     */
    public function getFormattedCreatedAtAttribute(): string
    {
        return $this->created_at->format('M d, Y H:i:s');
    }

    public function getActionDisplayAttribute(): string
    {
        $actionMap = [
            'created' => 'Created',
            'updated' => 'Updated',
            'deleted' => 'Deleted',
            'viewed' => 'Viewed',
            'login' => 'Logged In',
            'logout' => 'Logged Out',
            'password_changed' => 'Changed Password',
            'password_reset' => 'Reset Password',
            'status_changed' => 'Changed Status',
            'verified' => 'Verified',
            'verification_resent' => 'Resent Verification',
            'credentials_sent' => 'Sent Credentials',
            'session_terminated' => 'Terminated Session',
            'all_sessions_terminated' => 'Terminated All Sessions',
            'bulk_activate' => 'Bulk Activated',
            'bulk_deactivate' => 'Bulk Deactivated',
            'bulk_delete' => 'Bulk Deleted',
            'bulk_reset_password' => 'Bulk Reset Password',
            'exported_users' => 'Exported Users',
            'imported_users' => 'Imported Users',
        ];

        return $actionMap[$this->action] ?? ucfirst(str_replace('_', ' ', $this->action));
    }

    public function getResourceDisplayAttribute(): string
    {
        $resourceMap = [
            'user' => 'User',
            'resident' => 'Resident',
            'document' => 'Document',
            'system' => 'System',
            'user_session' => 'User Session',
        ];

        return $resourceMap[$this->resource] ?? ucfirst(str_replace('_', ' ', $this->resource));
    }
}