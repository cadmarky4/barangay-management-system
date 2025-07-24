<?php

namespace App\Models;

use App\Models\Schemas\DocumentSchema;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Support\Str;
use OwenIt\Auditing\Contracts\Auditable;
use Illuminate\Support\Facades\Auth;

class Document extends Model implements Auditable
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
    
    public function __construct(array $attributes = [])
    {
        // Set fillable and casts from schema
        $this->fillable = DocumentSchema::getFillableFields();
        $this->casts = DocumentSchema::getCasts();
        
        parent::__construct($attributes);
    }

    /**
     * Computed attributes
     */
    public function getDocumentTypeDisplayAttribute(): string
    {
        $types = DocumentSchema::getDocumentTypes();
        return $types[$this->document_type] ?? $this->document_type;
    }

    public function getPriorityDisplayAttribute(): string
    {
        $priorities = DocumentSchema::getPriorityOptions();
        return $priorities[$this->priority] ?? ucfirst($this->priority);
    }

    public function getStatusDisplayAttribute(): string
    {
        $statuses = DocumentSchema::getStatusOptions();
        return $statuses[$this->status] ?? ucfirst($this->status);
    }

    public function getPaymentStatusDisplayAttribute(): string
    {
        $paymentStatuses = DocumentSchema::getPaymentStatusOptions();
        return $paymentStatuses[$this->payment_status] ?? ucfirst($this->payment_status);
    }

    public function getIsExpiredAttribute(): bool
    {
        return $this->expiry_date && $this->expiry_date->isPast();
    }

    public function getIsExpiringSoonAttribute(): bool
    {
        if (!$this->expiry_date) {
            return false;
        }
        
        return $this->expiry_date->diffInDays(now()) <= 30 && $this->expiry_date->isFuture();
    }

    public function getProcessingDaysAttribute(): int
    {
        if (!$this->request_date) {
            return 0;
        }

        $endDate = $this->released_date ?? now();
        return $this->request_date->diffInDays($endDate);
    }

    public function getIsOverdueAttribute(): bool
    {
        if (!$this->needed_date || in_array($this->status, ['released', 'rejected', 'cancelled'])) {
            return false;
        }
        
        return $this->needed_date->isPast();
    }

    public function getFormattedDocumentNumberAttribute(): string
    {
        return $this->document_number ?? 'N/A';
    }

    public function getFormattedSerialNumberAttribute(): string
    {
        return $this->serial_number ?? 'N/A';
    }

    /**
     * Relationships
     */
    public function resident()
    {
        return $this->belongsTo(Resident::class);
    }

    public function processedByUser()
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function approvedByUser()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function releasedByUser()
    {
        return $this->belongsTo(User::class, 'released_by');
    }

    /**
     * Scopes
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeProcessing($query)
    {
        return $query->where('status', 'processing');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeReleased($query)
    {
        return $query->where('status', 'released');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    public function scopeByDocumentType($query, $type)
    {
        return $query->where('document_type', $type);
    }

    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    public function scopeByPaymentStatus($query, $status)
    {
        return $query->where('payment_status', $status);
    }

    public function scopeUrgent($query)
    {
        return $query->whereIn('priority', ['urgent', 'rush']);
    }

    public function scopeOverdue($query)
    {
        return $query->where('needed_date', '<', now())
                    ->whereNotIn('status', ['released', 'rejected', 'cancelled']);
    }

    public function scopeExpired($query)
    {
        return $query->where('expiry_date', '<', now());
    }

    public function scopeExpiringSoon($query, $days = 30)
    {
        return $query->whereBetween('expiry_date', [now(), now()->addDays($days)]);
    }

    public function scopeRequestedThisMonth($query)
    {
        return $query->whereMonth('request_date', now()->month)
                    ->whereYear('request_date', now()->year);
    }

    public function scopeRequestedThisYear($query)
    {
        return $query->whereYear('request_date', now()->year);
    }

    public function scopeReleasedThisMonth($query)
    {
        return $query->whereMonth('released_date', now()->month)
                    ->whereYear('released_date', now()->year);
    }

    public function scopeByResident($query, $residentId)
    {
        return $query->where('resident_id', $residentId);
    }

    /**
     * Helper methods for document-specific data
     */
    public function isBarangayClearance(): bool
    {
        return $this->document_type === 'BARANGAY_CLEARANCE';
    }

    public function isBusinessPermit(): bool
    {
        return $this->document_type === 'BUSINESS_PERMIT';
    }

    public function isCertificateOfIndigency(): bool
    {
        return $this->document_type === 'CERTIFICATE_OF_INDIGENCY';
    }

    public function isCertificateOfResidency(): bool
    {
        return $this->document_type === 'CERTIFICATE_OF_RESIDENCY';
    }

    public function hasRequiredDocuments(): bool
    {
        return !empty($this->requirements_submitted);
    }

    public function canBeProcessed(): bool
    {
        return $this->status === 'pending' && $this->hasRequiredDocuments();
    }

    public function canBeApproved(): bool
    {
        return $this->status === 'processing';
    }

    public function canBeReleased(): bool
    {
        return $this->status === 'approved' && $this->payment_status === 'paid';
    }

    public function canBeRejected(): bool
    {
        return !in_array($this->status, ['released', 'rejected', 'cancelled']);
    }

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();
        
        // Auto-generate document number and serial number when creating
        static::creating(function ($document) {
            if (!$document->document_number) {
                $document->document_number = static::generateDocumentNumber($document->document_type);
            }
            
            if (!$document->serial_number) {
                $document->serial_number = static::generateSerialNumber();
            }
            
            // Set request_date if not provided
            if (!$document->request_date) {
                $document->request_date = now();
            }
            
            // Set payment_status to 'paid' by default (assume all requests are paid upon submission)
            if (!$document->payment_status) {
                $document->payment_status = 'paid';
            }
        });

        // Update processed_date when status changes to processing
        static::updating(function ($document) {
            if ($document->isDirty('status')) {
                switch ($document->status) {
                    case 'processing':
                        if (!$document->processed_date) {
                            $document->processed_date = now();
                        }
                        break;
                    case 'approved':
                        if (!$document->approved_date) {
                            $document->approved_date = now();
                        }
                        break;
                    case 'released':
                        if (!$document->released_date) {
                            $document->released_date = now();
                        }
                        break;
                }
            }
        });
    }

    /**
     * Generate document number based on document type
     */
    protected static function generateDocumentNumber(string $documentType): string
    {
        $prefix = match ($documentType) {
            'BARANGAY_CLEARANCE' => 'BC',
            'CERTIFICATE_OF_RESIDENCY' => 'CR',
            'CERTIFICATE_OF_INDIGENCY' => 'CI',
            'BUSINESS_PERMIT' => 'BP',
            'BUILDING_PERMIT' => 'BDP',
            'FIRST_TIME_JOB_SEEKER' => 'FTJS',
            'SENIOR_CITIZEN_ID' => 'SCI',
            'PWD_ID' => 'PWD',
            'BARANGAY_ID' => 'BID',
            default => 'DOC',
        };

        $year = now()->year;
        $month = now()->format('m');
        
        // Get next sequence number for this document type and month
        $lastDocument = static::where('document_type', $documentType)
            ->whereYear('request_date', $year)
            ->whereMonth('request_date', $month)
            ->orderBy('id', 'desc')
            ->first();

        $sequence = 1;
        if ($lastDocument && $lastDocument->document_number) {
            // Extract sequence from last document number
            $parts = explode('-', $lastDocument->document_number);
            if (count($parts) >= 4) {
                $sequence = (int) end($parts) + 1;
            }
        }

        return sprintf('%s-%d-%s-%04d', $prefix, $year, $month, $sequence);
    }

    /**
     * Generate unique serial number
     */
    protected static function generateSerialNumber(): string
    {
        do {
            $serialNumber = 'SN-' . now()->format('Y') . '-' . strtoupper(Str::random(8));
        } while (static::where('serial_number', $serialNumber)->exists());

        return $serialNumber;
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
            'created' => "$user created a new document record",
            'updated' => "$user updated document information",
            'deleted' => "$user deleted a document record",
            default => "$user performed $event action"
        };
    }
}