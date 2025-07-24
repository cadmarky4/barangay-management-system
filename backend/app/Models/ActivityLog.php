<?php

namespace App\Models;

use OwenIt\Auditing\Models\Audit as AuditModel;

class ActivityLog extends AuditModel
{
    protected $table = 'activity_logs';
    
    protected $fillable = [
        'user_id',
        'action_type',
        'event',
        'table_name', 
        'record_id',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
        'description'
    ];

    protected $casts = [
        'old_values' => 'json',
        'new_values' => 'json',
        'timestamp' => 'datetime'
    ];
}