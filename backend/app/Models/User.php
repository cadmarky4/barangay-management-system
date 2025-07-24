<?php

namespace App\Models;

use App\Models\Schemas\UserSchema;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Auth;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    /**
     * Get fillable fields from schema
     */
    protected $fillable;
    
    /**
     * Get casts from schema
     */
    protected $casts;

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Additional dates for Carbon instances
     */
    protected $dates = ['deleted_at'];

    /**
     * The attributes that should be appended to the model's array form.
     */
    protected $appends = [
        'full_name',
        'initials',
        'display_name',
        'role_display',
        'department_display',
        'is_user_active',
        'has_logged_in',
        'is_barangay_official',
        'can_manage_residents',
        'can_manage_users',
        'can_generate_reports'
    ];

    public function __construct(array $attributes = [])
    {
        // Set fillable and casts from schema
        $this->fillable = UserSchema::getFillableFields();
        $this->casts = array_merge(
            UserSchema::getCasts(),
            [
                'email_verified_at' => 'datetime',
                'last_login_at' => 'datetime',
                'is_active' => 'boolean',
                'is_verified' => 'boolean',
                'created_at' => 'datetime',
                'updated_at' => 'datetime',
                'password' => 'hashed',
            ]
        );
        
        parent::__construct($attributes);
    }

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();
        
        // Auto-set created_by and updated_by
        static::creating(function ($model) {
            if (Auth::check() && !$model->created_by) {
                $model->created_by = Auth::id();
            }
            
            // Auto-verify super admin and admin users
            if (in_array($model->role, ['SUPER_ADMIN', 'ADMIN'])) {
                $model->is_verified = true;
            }
        });

        static::updating(function ($model) {
            if (Auth::check() && !$model->updated_by) {
                $model->updated_by = Auth::id();
            }
            
            // Update last login when logging in
            if ($model->isDirty('last_login_at')) {
                $model->timestamps = false;
            }
        });
    }

    /**
     * Computed attributes
     */
    public function getFullNameAttribute(): string
    {
        $parts = array_filter([
            $this->first_name,
            $this->middle_name,
            $this->last_name
        ]);
        
        return implode(' ', $parts);
    }

    public function getInitialsAttribute(): string
    {
        $firstInitial = $this->first_name ? strtoupper(substr($this->first_name, 0, 1)) : '';
        $lastInitial = $this->last_name ? strtoupper(substr($this->last_name, 0, 1)) : '';
        
        return $firstInitial . $lastInitial;
    }

    public function getDisplayNameAttribute(): string
    {
        return $this->full_name;
    }

    public function getRoleDisplayAttribute(): string
    {
        $roleMap = [
            'SUPER_ADMIN' => 'Super Administrator',
            'ADMIN' => 'Administrator',
            'BARANGAY_CAPTAIN' => 'Barangay Captain',
            'BARANGAY_SECRETARY' => 'Barangay Secretary',
            'BARANGAY_TREASURER' => 'Barangay Treasurer',
            'BARANGAY_COUNCILOR' => 'Barangay Councilor',
            'BARANGAY_CLERK' => 'Barangay Clerk',
            'HEALTH_WORKER' => 'Health Worker',
            'SOCIAL_WORKER' => 'Social Worker',
            'SECURITY_OFFICER' => 'Security Officer',
            'DATA_ENCODER' => 'Data Encoder',
            'VIEWER' => 'Viewer',
        ];

        return $roleMap[$this->role] ?? 'Viewer';
    }

    public function getDepartmentDisplayAttribute(): string
    {
        $departmentMap = [
            'ADMINISTRATION' => 'Administration',
            'HEALTH_SERVICES' => 'Health Services',
            'SOCIAL_SERVICES' => 'Social Services',
            'SECURITY_PUBLIC_SAFETY' => 'Security & Public Safety',
            'FINANCE_TREASURY' => 'Finance & Treasury',
            'RECORDS_MANAGEMENT' => 'Records Management',
            'COMMUNITY_DEVELOPMENT' => 'Community Development',
            'DISASTER_RISK_REDUCTION' => 'Disaster Risk Reduction',
            'ENVIRONMENTAL_MANAGEMENT' => 'Environmental Management',
            'YOUTH_SPORTS_DEVELOPMENT' => 'Youth & Sports Development',
            'SENIOR_CITIZEN_AFFAIRS' => 'Senior Citizen Affairs',
            'WOMENS_AFFAIRS' => "Women's Affairs",
            'BUSINESS_PERMITS' => 'Business Permits',
            'INFRASTRUCTURE_DEVELOPMENT' => 'Infrastructure Development',
        ];

        return $departmentMap[$this->department] ?? 'Administration';
    }

    public function getIsUserActiveAttribute(): bool
    {
        return $this->is_active && $this->is_verified;
    }

    public function getHasLoggedInAttribute(): bool
    {
        return !is_null($this->last_login_at);
    }

    public function getIsBarangayOfficialAttribute(): bool
    {
        return in_array($this->role, [
            'BARANGAY_CAPTAIN',
            'BARANGAY_SECRETARY',
            'BARANGAY_TREASURER',
            'BARANGAY_COUNCILOR'
        ]);
    }

    public function getCanManageResidentsAttribute(): bool
    {
        return in_array($this->role, [
            'SUPER_ADMIN',
            'ADMIN',
            'BARANGAY_CAPTAIN',
            'BARANGAY_SECRETARY',
            'BARANGAY_CLERK',
            'DATA_ENCODER'
        ]);
    }

    public function getCanManageUsersAttribute(): bool
    {
        return in_array($this->role, [
            'SUPER_ADMIN',
            'ADMIN'
        ]);
    }

    public function getCanGenerateReportsAttribute(): bool
    {
        return in_array($this->role, [
            'SUPER_ADMIN',
            'ADMIN',
            'BARANGAY_CAPTAIN',
            'BARANGAY_SECRETARY',
            'BARANGAY_TREASURER'
        ]);
    }

    /**
     * Relationships
     */
    public function resident(): BelongsTo
    {
        return $this->belongsTo(Resident::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Records created/updated by this user
    public function createdResidents(): HasMany
    {
        return $this->hasMany(Resident::class, 'created_by');
    }

    public function updatedResidents(): HasMany
    {
        return $this->hasMany(Resident::class, 'updated_by');
    }

    public function createdUsers(): HasMany
    {
        return $this->hasMany(User::class, 'created_by');
    }

    public function updatedUsers(): HasMany
    {
        return $this->hasMany(User::class, 'updated_by');
    }

    // Future relationships for other entities
    public function documents(): HasMany
    {
        return $this->hasMany(Document::class, 'processed_by');
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'assigned_to');
    }

    /**
     * Scopes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)->where('is_verified', true);
    }

    public function scopeInactive($query)
    {
        return $query->where('is_active', false);
    }

    public function scopeUnverified($query)
    {
        return $query->where('is_verified', false);
    }

    public function scopeByRole($query, $role)
    {
        return $query->where('role', $role);
    }

    public function scopeByDepartment($query, $department)
    {
        return $query->where('department', $department);
    }

    public function scopeBarangayOfficials($query)
    {
        return $query->whereIn('role', [
            'BARANGAY_CAPTAIN',
            'BARANGAY_SECRETARY',
            'BARANGAY_TREASURER',
            'BARANGAY_COUNCILOR'
        ]);
    }

    public function scopeAdministrators($query)
    {
        return $query->whereIn('role', ['SUPER_ADMIN', 'ADMIN']);
    }

    public function scopeWithResident($query)
    {
        return $query->whereNotNull('resident_id');
    }

    public function scopeWithoutResident($query)
    {
        return $query->whereNull('resident_id');
    }

    public function scopeRecentlyLoggedIn($query, $days = 30)
    {
        return $query->where('last_login_at', '>=', now()->subDays($days));
    }

    public function scopeNeverLoggedIn($query)
    {
        return $query->whereNull('last_login_at');
    }

    public function scopeSearch($query, $search)
    {
        if (empty($search)) {
            return $query;
        }

        return $query->where(function ($q) use ($search) {
            $q->where('first_name', 'like', "%{$search}%")
              ->orWhere('last_name', 'like', "%{$search}%")
              ->orWhere('middle_name', 'like', "%{$search}%")
              ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$search}%"])
              ->orWhereRaw("CONCAT(first_name, ' ', IFNULL(middle_name, ''), ' ', last_name) LIKE ?", ["%{$search}%"])
              ->orWhere('email', 'like', "%{$search}%")
              ->orWhere('username', 'like', "%{$search}%")
              ->orWhere('employee_id', 'like', "%{$search}%");
        });
    }

    /**
     * Helper methods
     */
    public function isActive(): bool
    {
        return $this->is_user_active;
    }

    public function isBarangayOfficial(): bool
    {
        return $this->is_barangay_official;
    }

    public function hasResident(): bool
    {
        return !is_null($this->resident_id) && $this->resident()->exists();
    }

    public function canEdit(User $targetUser): bool
    {
        $roleHierarchy = [
            'VIEWER' => 1,
            'DATA_ENCODER' => 2,
            'SECURITY_OFFICER' => 3,
            'SOCIAL_WORKER' => 3,
            'HEALTH_WORKER' => 3,
            'BARANGAY_CLERK' => 4,
            'BARANGAY_COUNCILOR' => 5,
            'BARANGAY_TREASURER' => 6,
            'BARANGAY_SECRETARY' => 7,
            'BARANGAY_CAPTAIN' => 8,
            'ADMIN' => 9,
            'SUPER_ADMIN' => 10,
        ];

        $currentUserLevel = $roleHierarchy[$this->role] ?? 0;
        $targetUserLevel = $roleHierarchy[$targetUser->role] ?? 0;
        
        // Super admin can edit anyone
        if ($this->role === 'SUPER_ADMIN') return true;
        
        // Users can edit themselves (basic info only)
        if ($this->id === $targetUser->id) return true;
        
        // Higher level users can edit lower level users
        return $currentUserLevel > $targetUserLevel;
    }

    public function canDelete(User $targetUser): bool
    {
        // Only super admin and admin can delete users
        if (!in_array($this->role, ['SUPER_ADMIN', 'ADMIN'])) return false;
        
        // Cannot delete yourself
        if ($this->id === $targetUser->id) return false;
        
        // Super admin can delete anyone except other super admins
        if ($this->role === 'SUPER_ADMIN') {
            return $targetUser->role !== 'SUPER_ADMIN';
        }
        
        // Admin can only delete users below admin level
        $adminLevelRoles = ['SUPER_ADMIN', 'ADMIN'];
        return !in_array($targetUser->role, $adminLevelRoles);
    }

    /**
     * Authentication helpers
     */
    public function activate(): void
    {
        $this->update(['is_active' => true]);
    }

    public function deactivate(): void
    {
        $this->update(['is_active' => false]);
    }

    public function verify(): void
    {
        $this->update(['is_verified' => true]);
    }

    public function unverify(): void
    {
        $this->update(['is_verified' => false]);
    }

    public function updateLastLogin(): void
    {
        $this->timestamps = false;
        $this->update(['last_login_at' => now()]);
        $this->timestamps = true;
    }

    public function linkToResident(Resident $resident): void
    {
        $this->update(['resident_id' => $resident->id]);
    }

    public function unlinkFromResident(): void
    {
        $this->update(['resident_id' => null]);
    }

    /**
     * Override the default serialization to include computed attributes
     */
    public function toArray()
    {
        $array = parent::toArray();
        
        // Add computed attributes
        $array['full_name'] = $this->full_name;
        $array['initials'] = $this->initials;
        $array['display_name'] = $this->display_name;
        $array['role_display'] = $this->role_display;
        $array['department_display'] = $this->department_display;
        $array['is_user_active'] = $this->is_user_active;
        $array['has_logged_in'] = $this->has_logged_in;
        $array['is_barangay_official'] = $this->is_barangay_official;
        $array['can_manage_residents'] = $this->can_manage_residents;
        $array['can_manage_users'] = $this->can_manage_users;
        $array['can_generate_reports'] = $this->can_generate_reports;

        return $array;
    }
}