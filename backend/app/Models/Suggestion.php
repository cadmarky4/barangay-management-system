<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Suggestion extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'base_ticket_id',
        's_category',
        'expected_benefits',
        'implementation_ideas',
        'resources_needed',
    ];

    const CATEGORIES = [
        'PUBLIC_SERVICES',
        'INFRASTRUCTURE',
        'SOCIAL_WELFARE',
        'PUBLIC_SAFETY',
        'HEALTH_SERVICES',
        'ENVIRONMENTAL',
        'EDUCATION',
        'BUSINESS_PERMITS',
        'COMMUNITY_PROGRAMS',
        'OTHERS'
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
}