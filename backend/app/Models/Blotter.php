<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Blotter extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'base_ticket_id',
        'type_of_incident',
        'date_of_incident',
        'time_of_incident',
        'location_of_incident',
    ];

    protected $casts = [
        'date_of_incident' => 'date',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = Str::uuid()->toString();
            }
        });
    }

    public function ticket()
    {
        return $this->belongsTo(Ticket::class, 'base_ticket_id');
    }

    public function otherPeopleInvolved()
    {
        return $this->hasMany(OtherPersonInvolved::class);
    }

    public function supportingDocuments()
    {
        return $this->hasMany(SupportingDocument::class);
    }
}