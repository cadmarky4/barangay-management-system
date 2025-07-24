<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class OtherPersonInvolved extends Model
{
    use HasFactory;

    protected $table = 'other_people_involved';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'blotter_id',
        'full_name',
        'address',
        'contact_number',
        'involvement',
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

    public function blotter()
    {
        return $this->belongsTo(Blotter::class);
    }
}