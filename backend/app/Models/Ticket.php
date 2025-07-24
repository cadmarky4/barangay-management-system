<?php

// app/Models/Ticket.php
namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Ticket extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'ticket_number',
        'subject',
        'description',
        'priority',
        'requester_name',
        'resident_id',
        'contact_number',
        'email_address',
        'complete_address',
        'category',
        'status',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Constants for enums
    const CATEGORIES = ['APPOINTMENT', 'BLOTTER', 'COMPLAINT', 'SUGGESTION'];
    const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const STATUSES = ['OPEN', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED'];

    public function appointment(): HasOne
    {
        return $this->hasOne(Appointment::class, 'base_ticket_id');
    }

    public function resident(): BelongsTo
    {
        return $this->belongsTo(Resident::class);
    }

    // Scopes
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    // Boot method to generate ticket number
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($ticket) {
            if (empty($ticket->ticket_number)) {
                $ticket->ticket_number = static::generateTicketNumber($ticket->category);
            }
            if (empty($ticket->status)) {
                $ticket->status = 'OPEN';
            }
        });
    }

    private static function generateTicketNumber($category): string
    {
        $prefix = match ($category) {
            'APPOINTMENT' => 'APT',
            'BLOTTER' => 'BLT',
            'COMPLAINT' => 'CMP',
            'SUGGESTION' => 'SUG',
            default => 'TKT'
        };

        $year = date('Y');
        $month = date('m');

        // Get the latest ticket number for this category and month
        $lastTicket = static::where('category', $category)
            ->where('ticket_number', 'like', "{$prefix}-{$year}{$month}%")
            ->orderBy('ticket_number', 'desc')
            ->first();

        if ($lastTicket) {
            $lastNumber = (int) substr($lastTicket->ticket_number, -4);
            $nextNumber = $lastNumber + 1;
        } else {
            $nextNumber = 1;
        }

        return sprintf('%s-%s%s-%04d', $prefix, $year, $month, $nextNumber);
    }
}