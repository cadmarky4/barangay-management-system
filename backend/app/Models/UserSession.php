<?php

// ============================================================================
// App/Models/UserSession.php
// ============================================================================

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


class UserSession extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'user_id',
        'ip_address',
        'user_agent',
        'payload',
        'last_activity',
        'expires_at',
        'is_current',
    ];

    protected $casts = [
        'last_activity' => 'integer',
        'expires_at' => 'datetime',
        'is_current' => 'boolean',
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
    public function scopeActive($query)
    {
        return $query->where('expires_at', '>', now());
    }

    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<=', now());
    }

    public function scopeCurrent($query)
    {
        return $query->where('is_current', true);
    }

    /**
     * Accessors
     */
    public function getIsActiveAttribute(): bool
    {
        return $this->expires_at > now();
    }

    public function getFormattedLastActivityAttribute(): string
    {
        return \Carbon\Carbon::createFromTimestamp($this->last_activity)->format('M d, Y H:i:s');
    }

    public function getFormattedExpiresAtAttribute(): string
    {
        return $this->expires_at->format('M d, Y H:i:s');
    }

    public function getBrowserAttribute(): string
    {
        $userAgent = $this->user_agent;
        
        if (str_contains($userAgent, 'Chrome')) {
            return 'Chrome';
        } elseif (str_contains($userAgent, 'Firefox')) {
            return 'Firefox';
        } elseif (str_contains($userAgent, 'Safari')) {
            return 'Safari';
        } elseif (str_contains($userAgent, 'Edge')) {
            return 'Edge';
        } elseif (str_contains($userAgent, 'Opera')) {
            return 'Opera';
        }
        
        return 'Unknown';
    }

    public function getPlatformAttribute(): string
    {
        $userAgent = $this->user_agent;
        
        if (str_contains($userAgent, 'Windows')) {
            return 'Windows';
        } elseif (str_contains($userAgent, 'Mac OS')) {
            return 'macOS';
        } elseif (str_contains($userAgent, 'Linux')) {
            return 'Linux';
        } elseif (str_contains($userAgent, 'Android')) {
            return 'Android';
        } elseif (str_contains($userAgent, 'iOS')) {
            return 'iOS';
        }
        
        return 'Unknown';
    }

    public function getLocationAttribute(): string
    {
        // You can integrate with a GeoIP service here
        // For now, just return the IP address
        return $this->ip_address;
    }

    /**
     * Helper methods
     */
    public function isExpired(): bool
    {
        return $this->expires_at <= now();
    }

    public function timeUntilExpiry(): string
    {
        if ($this->isExpired()) {
            return 'Expired';
        }

        return $this->expires_at->diffForHumans();
    }

    public function lastActivityTime(): string
    {
        return \Carbon\Carbon::createFromTimestamp($this->last_activity)->diffForHumans();
    }
}