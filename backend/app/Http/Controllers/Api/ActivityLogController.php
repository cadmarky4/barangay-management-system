<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Response;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ActivityLogExport;
use Barryvdh\DomPDF\Facade\Pdf;

class ActivityLogController extends Controller
{
    /**
     * Get paginated list of activity logs with filtering
     */
    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'page' => 'integer|min:1',
            'per_page' => 'integer|min:1|max:100',
            'search' => 'string|max:255',
            'action_type' => 'string|in:created,updated,deleted,viewed,exported,imported,restored,archived,login,logout,password_changed,profile_updated,settings_changed,bulk_update,bulk_delete,file_upload,file_download,report_generated,backup_created,system_maintenance',
            'action_types' => 'array',
            'action_types.*' => 'string|in:created,updated,deleted,viewed,exported,imported,restored,archived,login,logout,password_changed,profile_updated,settings_changed,bulk_update,bulk_delete,file_upload,file_download,report_generated,backup_created,system_maintenance',
            'user_id' => 'uuid|exists:users,id',
            'user_name' => 'string|max:255',
            'table_name' => 'string|max:255',
            'table_names' => 'array',
            'table_names.*' => 'string|max:255',
            'record_id' => 'integer|min:1',
            'date_from' => 'date',
            'date_to' => 'date|after_or_equal:date_from',
            'time_range' => 'string|in:today,yesterday,last_7_days,last_30_days,last_3_months,last_6_months,last_year,custom',
            'ip_address' => 'ip',
            'user_agent_contains' => 'string|max:255',
            'sort_by' => 'string|in:timestamp,action_type,user_name,table_name',
            'sort_order' => 'string|in:asc,desc',
            'include' => 'string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $query = ActivityLog::query();

        // Include user relationship if requested
        if ($request->get('include') === 'user') {
            $query->with('user:id,name,email,role');
        }

        // Apply filters
        $this->applyFilters($query, $request);

        // Apply sorting
        $sortBy = $request->get('sort_by', 'timestamp');
        $sortOrder = $request->get('sort_order', 'desc');
        
        if ($sortBy === 'user_name') {
            $query->join('users', 'activity_logs.user_id', '=', 'users.id')
                  ->orderBy('users.name', $sortOrder)
                  ->select('activity_logs.*');
        } else {
            $query->orderBy($sortBy, $sortOrder);
        }

        // Paginate results
        $perPage = $request->get('per_page', 20);
        $logs = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $logs->items(),
            'current_page' => $logs->currentPage(),
            'last_page' => $logs->lastPage(),
            'per_page' => $logs->perPage(),
            'total' => $logs->total(),
            'from' => $logs->firstItem(),
            'to' => $logs->lastItem()
        ]);
    }

    /**
     * Get single activity log with detailed information
     */
    public function show(string $id): JsonResponse
    {
        $log = ActivityLog::with(['user:id,name,email,role'])
            ->find($id);

        if (!$log) {
            return response()->json([
                'success' => false,
                'message' => 'Activity log not found'
            ], 404);
        }

        // Parse user agent for additional info
        $browserInfo = $this->parseUserAgent($log->user_agent);
        
        // Get related activities (same record, different actions)
        $relatedActivities = ActivityLog::where('table_name', $log->table_name)
            ->where('record_id', $log->record_id)
            ->where('id', '!=', $log->id)
            ->with('user:id,name,email')
            ->orderBy('timestamp', 'desc')
            ->limit(10)
            ->get();

        // Generate changes summary for update actions
        $changesSummary = [];
        if ($log->action_type === 'updated' && $log->old_values && $log->new_values) {
            $changesSummary = $this->generateChangesSummary($log->old_values, $log->new_values);
        }

        $logData = $log->toArray();
        $logData['browser_info'] = $browserInfo;
        $logData['related_activities'] = $relatedActivities;
        $logData['changes_summary'] = $changesSummary;

        return response()->json([
            'success' => true,
            'data' => $logData
        ]);
    }

    /**
     * Get activity statistics
     */
    public function statistics(): JsonResponse
    {
        $now = Carbon::now();
        
        $stats = [
            'total_activities' => ActivityLog::count(),
            'today_activities' => ActivityLog::whereDate('timestamp', $now->toDateString())->count(),
            'this_week_activities' => ActivityLog::whereBetween('timestamp', [
                $now->startOfWeek()->toDateTimeString(),
                $now->endOfWeek()->toDateTimeString()
            ])->count(),
            'this_month_activities' => ActivityLog::whereMonth('timestamp', $now->month)
                ->whereYear('timestamp', $now->year)
                ->count(),
        ];

        // By action type
        $stats['by_action_type'] = ActivityLog::select('action_type', DB::raw('count(*) as count'))
            ->groupBy('action_type')
            ->pluck('count', 'action_type')
            ->toArray();

        // By table
        $stats['by_table'] = ActivityLog::select('table_name', DB::raw('count(*) as count'))
            ->groupBy('table_name')
            ->pluck('count', 'table_name')
            ->toArray();

        // By user (top 10)
        $stats['by_user'] = ActivityLog::join('users', 'activity_logs.user_id', '=', 'users.id')
            ->select('users.name', DB::raw('count(*) as count'))
            ->groupBy('users.id', 'users.name')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->pluck('count', 'name')
            ->toArray();

        // By hour (last 24 hours)
        $stats['by_hour'] = ActivityLog::where('timestamp', '>=', $now->subDay())
            ->select(DB::raw('HOUR(timestamp) as hour'), DB::raw('count(*) as count'))
            ->groupBy('hour')
            ->pluck('count', 'hour')
            ->toArray();

        // By day (last 30 days)
        $stats['by_day'] = ActivityLog::where('timestamp', '>=', $now->subDays(30))
            ->select(DB::raw('DATE(timestamp) as date'), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->pluck('count', 'date')
            ->toArray();

        // Peak activity times
        $peakHour = ActivityLog::select(DB::raw('HOUR(timestamp) as hour'), DB::raw('count(*) as count'))
            ->groupBy('hour')
            ->orderBy('count', 'desc')
            ->first();

        $peakDay = ActivityLog::select(DB::raw('DAYNAME(timestamp) as day'), DB::raw('count(*) as count'))
            ->groupBy('day')
            ->orderBy('count', 'desc')
            ->first();

        $stats['peak_hour'] = $peakHour ? $peakHour->hour . ':00' : null;
        $stats['peak_day'] = $peakDay ? $peakDay->day : null;

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Get activity summary for dashboard
     */
    public function summary(): JsonResponse
    {
        $now = Carbon::now();

        // Recent activities (last 10)
        $recentActivities = ActivityLog::with('user:id,name,email')
            ->orderBy('timestamp', 'desc')
            ->limit(10)
            ->get();

        // Today's total
        $todayTotal = ActivityLog::whereDate('timestamp', $now->toDateString())->count();

        // Most active user today
        $mostActiveUser = ActivityLog::join('users', 'activity_logs.user_id', '=', 'users.id')
            ->whereDate('activity_logs.timestamp', $now->toDateString())
            ->select('users.name', DB::raw('count(*) as activity_count'))
            ->groupBy('users.id', 'users.name')
            ->orderBy('activity_count', 'desc')
            ->first();

        // Most affected table today
        $mostAffectedTable = ActivityLog::whereDate('timestamp', $now->toDateString())
            ->select('table_name', DB::raw('count(*) as activity_count'))
            ->groupBy('table_name')
            ->orderBy('activity_count', 'desc')
            ->first();

        // Last login
        $lastLogin = ActivityLog::where('action_type', 'login')
            ->orderBy('timestamp', 'desc')
            ->first();

        $summary = [
            'recent_activities' => $recentActivities,
            'total_today' => $todayTotal,
            'most_active_user' => $mostActiveUser ? [
                'user_name' => $mostActiveUser->name,
                'activity_count' => $mostActiveUser->activity_count
            ] : null,
            'most_affected_table' => $mostAffectedTable ? [
                'table_name' => $mostAffectedTable->table_name,
                'activity_count' => $mostAffectedTable->activity_count
            ] : null,
            'last_login' => $lastLogin ? $lastLogin->timestamp : null
        ];

        return response()->json([
            'success' => true,
            'data' => $summary
        ]);
    }

    /**
     * Get top active users
     */
    public function topUsers(Request $request): JsonResponse
    {
        $limit = $request->get('limit', 10);
        $timeRange = $request->get('time_range', 'last_30_days');

        $query = ActivityLog::join('users', 'activity_logs.user_id', '=', 'users.id')
            ->select('users.id', 'users.name', 'users.email', DB::raw('count(*) as activity_count'));

        $this->applyTimeRangeFilter($query, $timeRange);

        $topUsers = $query->groupBy('users.id', 'users.name', 'users.email')
            ->orderBy('activity_count', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($user) {
                return [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email
                    ],
                    'activity_count' => $user->activity_count
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $topUsers
        ]);
    }

    /**
     * Get most affected tables
     */
    public function topTables(Request $request): JsonResponse
    {
        $limit = $request->get('limit', 10);
        $timeRange = $request->get('time_range', 'last_30_days');

        $query = ActivityLog::select('table_name', DB::raw('count(*) as activity_count'));

        $this->applyTimeRangeFilter($query, $timeRange);

        $topTables = $query->groupBy('table_name')
            ->orderBy('activity_count', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($table) {
                return [
                    'table_name' => $table->table_name,
                    'activity_count' => $table->activity_count
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $topTables
        ]);
    }

    /**
     * Export activity logs
     */
    public function export(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'format' => 'required|in:csv,excel,pdf',
            'include_user_details' => 'boolean',
            'include_old_values' => 'boolean',
            'include_new_values' => 'boolean',
            'date_format' => 'in:iso,human_readable'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $format = $request->get('format');
        $includeUserDetails = $request->get('include_user_details', true);
        $includeOldValues = $request->get('include_old_values', false);
        $includeNewValues = $request->get('include_new_values', false);
        $dateFormat = $request->get('date_format', 'human_readable');

        // Build query with filters
        $query = ActivityLog::query();
        if ($includeUserDetails) {
            $query->with('user:id,name,email');
        }

        $this->applyFilters($query, $request);
        $query->orderBy('timestamp', 'desc');

        $logs = $query->get();

        $filename = 'activity-logs-' . now()->format('Y-m-d-H-i-s');

        switch ($format) {
            case 'csv':
                return $this->exportCsv($logs, $filename, $includeUserDetails, $includeOldValues, $includeNewValues, $dateFormat);
            
            case 'excel':
                return Excel::download(
                    new ActivityLogExport($logs, $includeUserDetails, $includeOldValues, $includeNewValues, $dateFormat),
                    $filename . '.xlsx'
                );
            
            case 'pdf':
                return $this->exportPdf($logs, $filename, $includeUserDetails, $dateFormat);
            
            default:
                return response()->json(['success' => false, 'message' => 'Invalid format'], 400);
        }
    }

    /**
     * Clear old activity logs
     */
    public function cleanup(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'older_than_days' => 'required|integer|min:1'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $olderThanDays = $request->get('older_than_days');
        $cutoffDate = Carbon::now()->subDays($olderThanDays);

        $deletedCount = ActivityLog::where('timestamp', '<', $cutoffDate)->delete();

        return response()->json([
            'success' => true,
            'data' => [
                'deleted_count' => $deletedCount
            ],
            'message' => "Successfully deleted {$deletedCount} activity logs older than {$olderThanDays} days"
        ]);
    }

    /**
     * Apply filters to query
     */
    private function applyFilters($query, Request $request): void
    {
        // Search filter
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('description', 'LIKE', "%{$search}%")
                  ->orWhereHas('user', function ($userQuery) use ($search) {
                      $userQuery->where('name', 'LIKE', "%{$search}%")
                               ->orWhere('email', 'LIKE', "%{$search}%");
                  });
            });
        }

        // Action type filters
        if ($request->filled('action_type')) {
            $query->where('action_type', $request->get('action_type'));
        }

        if ($request->filled('action_types')) {
            $query->whereIn('action_type', $request->get('action_types'));
        }

        // User filters
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->get('user_id'));
        }

        if ($request->filled('user_name')) {
            $query->whereHas('user', function ($userQuery) use ($request) {
                $userQuery->where('name', 'LIKE', '%' . $request->get('user_name') . '%');
            });
        }

        // Table filters
        if ($request->filled('table_name')) {
            $query->where('table_name', $request->get('table_name'));
        }

        if ($request->filled('table_names')) {
            $query->whereIn('table_name', $request->get('table_names'));
        }

        // Record ID filter
        if ($request->filled('record_id')) {
            $query->where('record_id', $request->get('record_id'));
        }

        // IP address filter
        if ($request->filled('ip_address')) {
            $query->where('ip_address', $request->get('ip_address'));
        }

        // User agent filter
        if ($request->filled('user_agent_contains')) {
            $query->where('user_agent', 'LIKE', '%' . $request->get('user_agent_contains') . '%');
        }

        // Time range filters
        if ($request->filled('time_range')) {
            $this->applyTimeRangeFilter($query, $request->get('time_range'));
        } elseif ($request->filled('date_from') || $request->filled('date_to')) {
            if ($request->filled('date_from')) {
                $query->where('timestamp', '>=', $request->get('date_from'));
            }
            if ($request->filled('date_to')) {
                $query->where('timestamp', '<=', $request->get('date_to'));
            }
        }
    }

    /**
     * Apply time range filter
     */
    private function applyTimeRangeFilter($query, string $timeRange): void
    {
        $now = Carbon::now();

        switch ($timeRange) {
            case 'today':
                $query->whereDate('timestamp', $now->toDateString());
                break;
            case 'yesterday':
                $query->whereDate('timestamp', $now->subDay()->toDateString());
                break;
            case 'last_7_days':
                $query->where('timestamp', '>=', $now->subDays(7));
                break;
            case 'last_30_days':
                $query->where('timestamp', '>=', $now->subDays(30));
                break;
            case 'last_3_months':
                $query->where('timestamp', '>=', $now->subMonths(3));
                break;
            case 'last_6_months':
                $query->where('timestamp', '>=', $now->subMonths(6));
                break;
            case 'last_year':
                $query->where('timestamp', '>=', $now->subYear());
                break;
        }
    }

    /**
     * Parse user agent string
     */
    private function parseUserAgent(string $userAgent): array
    {
        $browser = 'Unknown';
        $version = 'Unknown';
        $os = 'Unknown';
        $device = 'Desktop';

        // Simple browser detection
        if (preg_match('/Chrome\/([0-9.]+)/', $userAgent, $matches)) {
            $browser = 'Chrome';
            $version = $matches[1];
        } elseif (preg_match('/Firefox\/([0-9.]+)/', $userAgent, $matches)) {
            $browser = 'Firefox';
            $version = $matches[1];
        } elseif (preg_match('/Safari\/([0-9.]+)/', $userAgent, $matches)) {
            $browser = 'Safari';
            $version = $matches[1];
        } elseif (preg_match('/Edge\/([0-9.]+)/', $userAgent, $matches)) {
            $browser = 'Edge';
            $version = $matches[1];
        }

        // Simple OS detection
        if (strpos($userAgent, 'Windows') !== false) {
            $os = 'Windows';
        } elseif (strpos($userAgent, 'Mac') !== false) {
            $os = 'macOS';
        } elseif (strpos($userAgent, 'Linux') !== false) {
            $os = 'Linux';
        } elseif (strpos($userAgent, 'Android') !== false) {
            $os = 'Android';
            $device = 'Mobile';
        } elseif (strpos($userAgent, 'iOS') !== false) {
            $os = 'iOS';
            $device = 'Mobile';
        }

        // Device type detection
        if (strpos($userAgent, 'Mobile') !== false) {
            $device = 'Mobile';
        } elseif (strpos($userAgent, 'Tablet') !== false) {
            $device = 'Tablet';
        }

        return [
            'browser' => $browser,
            'version' => $version,
            'os' => $os,
            'device' => $device
        ];
    }

    /**
     * Generate changes summary for updated records
     */
    private function generateChangesSummary(array $oldValues, array $newValues): array
    {
        $changes = [];

        foreach ($newValues as $field => $newValue) {
            $oldValue = $oldValues[$field] ?? null;
            
            if ($oldValue !== $newValue) {
                $changes[] = [
                    'field' => $field,
                    'old_value' => $oldValue,
                    'new_value' => $newValue,
                    'field_label' => ucfirst(str_replace('_', ' ', $field))
                ];
            }
        }

        return $changes;
    }

    /**
     * Export as CSV
     */
    private function exportCsv($logs, $filename, $includeUserDetails, $includeOldValues, $includeNewValues, $dateFormat)
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '.csv"',
        ];

        $callback = function() use ($logs, $includeUserDetails, $includeOldValues, $includeNewValues, $dateFormat) {
            $file = fopen('php://output', 'w');
            
            // CSV Headers
            $csvHeaders = ['Timestamp', 'Action', 'Table', 'Record ID', 'Description', 'IP Address'];
            if ($includeUserDetails) {
                $csvHeaders = array_merge(['User Name', 'User Email'], $csvHeaders);
            }
            if ($includeOldValues) {
                $csvHeaders[] = 'Old Values';
            }
            if ($includeNewValues) {
                $csvHeaders[] = 'New Values';
            }
            fputcsv($file, $csvHeaders);

            // CSV Data
            foreach ($logs as $log) {
                $row = [];
                
                if ($includeUserDetails) {
                    $row[] = $log->user->name ?? 'Unknown';
                    $row[] = $log->user->email ?? 'Unknown';
                }
                
                $row[] = $dateFormat === 'iso' ? $log->timestamp : Carbon::parse($log->timestamp)->format('Y-m-d H:i:s');
                $row[] = $log->action_type;
                $row[] = $log->table_name;
                $row[] = $log->record_id;
                $row[] = $log->description;
                $row[] = $log->ip_address;
                
                if ($includeOldValues) {
                    $row[] = $log->old_values ? json_encode($log->old_values) : '';
                }
                if ($includeNewValues) {
                    $row[] = $log->new_values ? json_encode($log->new_values) : '';
                }
                
                fputcsv($file, $row);
            }
            
            fclose($file);
        };

        return Response::stream($callback, 200, $headers);
    }

    /**
     * Export as PDF
     */
    private function exportPdf($logs, $filename, $includeUserDetails, $dateFormat)
    {
        $data = [
            'logs' => $logs,
            'includeUserDetails' => $includeUserDetails,
            'dateFormat' => $dateFormat,
            'generatedAt' => now()->format('Y-m-d H:i:s')
        ];

        $pdf = Pdf::loadView('exports.activity-logs-pdf', $data);
        
        return $pdf->download($filename . '.pdf');
    }
}