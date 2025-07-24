<?php

namespace App\Models;

use App\Models\Schemas\HouseholdSchema;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use OwenIt\Auditing\Contracts\Auditable;
use Illuminate\Support\Facades\Auth;

class Household extends Model implements Auditable
{
    use HasFactory, HasUuids, \OwenIt\Auditing\Auditable;

    protected $auditModel = ActivityLog::class;
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
        'created_by',
        'updated_by',
    ];

    /**
     * The attributes that should be appended to the model's array form.
     */
    protected $appends = [
        'member_count',
        'has_head_resident',
    ];
    
    public function __construct(array $attributes = [])
    {
        // Set fillable and casts from schema
        $this->fillable = HouseholdSchema::getFillableFields();
        $this->casts = array_merge([
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ], HouseholdSchema::getCasts());
        
        parent::__construct($attributes);
    }

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();
        
        // Household number is now generated on the frontend side
        // Following the principle that frontend is the source of truth
    }

    /**
     * Relationship: Head Resident
     */
    public function headResident(): BelongsTo
    {
        return $this->belongsTo(Resident::class, 'head_resident_id');
    }

    /**
     * Relationship: All Members (including head) via pivot table
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(Resident::class, 'household_members')
            ->withPivot('relationship')
            ->withTimestamps()
            ->orderBy('household_members.relationship')
            ->orderBy('residents.last_name');
    }

    /**
     * Relationship: Non-head members only
     */
    public function nonHeadMembers(): BelongsToMany
    {
        return $this->members()->wherePivot('relationship', '!=', 'HEAD');
    }

    /**
     * Relationship: Head member via pivot table
     */
    public function headMember(): BelongsToMany
    {
        return $this->members()->wherePivot('relationship', 'HEAD');
    }

    /**
     * Relationship: Created by user
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Relationship: Updated by user
     */
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Relationship: Document requests from any household member
     */
    public function documentRequests(): HasMany
    {
        return $this->hasMany(Document::class, 'household_id');
    }

    /**
     * Scopes for filtering
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'ACTIVE');
    }

    public function scopeFourPs($query)
    {
        return $query->where('four_ps_beneficiary', true);
    }

    public function scopeIndigent($query)
    {
        return $query->where('indigent_family', true);
    }

    public function scopeWithSeniorCitizen($query)
    {
        return $query->where('has_senior_citizen', true);
    }

    public function scopeWithPwd($query)
    {
        return $query->where('has_pwd_member', true);
    }

    public function scopeByBarangay($query, $barangay)
    {
        return $query->where('barangay', $barangay);
    }

    public function scopeByHouseType($query, $houseType)
    {
        return $query->where('house_type', $houseType);
    }

    public function scopeByOwnershipStatus($query, $ownershipStatus)
    {
        return $query->where('ownership_status', $ownershipStatus);
    }

    public function scopeByIncomeRange($query, $incomeRange)
    {
        return $query->where('monthly_income', $incomeRange);
    }

    public function scopeSearch($query, $search)
    {
        if (empty($search)) {
            return $query;
        }

        return $query->where(function ($q) use ($search) {
            $q->where('household_number', 'like', "%{$search}%")
              ->orWhere('complete_address', 'like', "%{$search}%")
              ->orWhereHas('headResident', function ($headQuery) use ($search) {
                  $headQuery->where('first_name', 'like', "%{$search}%")
                           ->orWhere('last_name', 'like', "%{$search}%")
                           ->orWhere('middle_name', 'like', "%{$search}%");
              });
        });
    }

    /**
     * Accessors
     */
    public function getMemberCountAttribute(): int
    {
        return $this->members()->count();
    }

    public function getHasHeadResidentAttribute(): bool
    {
        return !is_null($this->head_resident_id);
    }

    public function getFullAddressAttribute(): string
    {
        return "{$this->house_number} {$this->street_sitio}, {$this->barangay}";
    }

    /**
     * Methods for managing household members
     */
    public function addMember(Resident $resident, string $relationship = 'OTHER'): void
    {
        $this->members()->attach($resident->id, [
            'relationship' => $relationship,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // If adding as head, update the head_resident_id
        if ($relationship === 'HEAD') {
            $this->update(['head_resident_id' => $resident->id]);
        }
    }

    public function removeMember(Resident $resident): void
    {
        $this->members()->detach($resident->id);

        // If removing the head, clear head_resident_id
        if ($this->head_resident_id == $resident->id) {
            $this->update(['head_resident_id' => null]);
        }
    }

    public function updateMemberRelationship(Resident $resident, string $relationship): void
    {
        $this->members()->updateExistingPivot($resident->id, [
            'relationship' => $relationship,
            'updated_at' => now(),
        ]);

        // Handle head relationship changes
        if ($relationship === 'HEAD') {
            $this->update(['head_resident_id' => $resident->id]);
        } elseif ($this->head_resident_id == $resident->id) {
            $this->update(['head_resident_id' => null]);
        }
    }

    public function syncMembers(array $memberData): void
    {
        $syncData = [];
        $newHeadId = null;

        foreach ($memberData as $member) {
            $syncData[$member['resident_id']] = [
                'relationship' => $member['relationship'],
                'created_at' => now(),
                'updated_at' => now(),
            ];

            if ($member['relationship'] === 'HEAD') {
                $newHeadId = $member['resident_id'];
            }
        }

        $this->members()->sync($syncData);
        $this->update(['head_resident_id' => $newHeadId]);
    }

    /**
     * Check if household has a specific resident as member
     */
    public function hasMember(Resident $resident): bool
    {
        return $this->members()->where('residents.id', $resident->id)->exists();
    }

    /**
     * Get member relationship
     */
    public function getMemberRelationship(Resident $resident): ?string
    {
        $member = $this->members()->where('residents.id', $resident->id)->first();
        return $member ? $member->pivot->relationship : null;
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
            'created' => "$user created a new household record",
            'updated' => "$user updated household information",
            'deleted' => "$user deleted a household record",
            default => "$user performed $event action"
        };
    }
}