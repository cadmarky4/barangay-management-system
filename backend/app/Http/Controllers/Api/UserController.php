<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserActivity;
use App\Models\UserSession;
use App\Models\Schemas\UserSchema;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\UsersExport;
use App\Imports\UsersImport;

class UserController extends Controller
{
    /**
     * Display a listing of users with advanced filtering and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = User::query();

            // Apply filters
            if ($request->has('role')) {
                $query->where('role', $request->role);
            }

            if ($request->has('department')) {
                $query->where('department', $request->department);
            }

            if ($request->has('is_active')) {
                $query->where('is_active', $request->boolean('is_active'));
            }

            if ($request->has('is_verified')) {
                $query->where('is_verified', $request->boolean('is_verified'));
            }

            // Advanced search functionality
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%")
                      ->orWhere('username', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('employee_id', 'like', "%{$search}%")
                      ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$search}%"])
                      ->orWhereRaw("CONCAT(first_name, ' ', IFNULL(middle_name, ''), ' ', last_name) LIKE ?", ["%{$search}%"]);
                });
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            
            // Validate sort fields
            $allowedSortFields = ['first_name', 'last_name', 'email', 'username', 'role', 'department', 'created_at', 'last_login_at'];
            if (!in_array($sortBy, $allowedSortFields)) {
                $sortBy = 'created_at';
            }
            
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = min($request->get('per_page', 15), 100); // Max 100 per page
            $users = $query->paginate($perPage);

            return response()->json([
                'status' => 'success',
                'data' => $users->items(),
                'meta' => [
                    'current_page' => $users->currentPage(),
                    'last_page' => $users->lastPage(),
                    'per_page' => $users->perPage(),
                    'total' => $users->total(),
                    'from' => $users->firstItem(),
                    'to' => $users->lastItem(),
                ],
                'message' => 'Users retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve users: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            // Get validation rules from schema
            $rules = UserSchema::getCreateValidationRules();
            $rules['confirm_password'] = 'required|same:password';
            
            $validatedData = $request->validate($rules);
            
            // Remove confirm_password from data to be saved
            unset($validatedData['confirm_password']);
            
            // Hash the password
            $validatedData['password'] = Hash::make($validatedData['password']);
            
            // Set created_by if authenticated
            if (Auth::check()) {
                $validatedData['created_by'] = Auth::id();
            }

            // Set default values
            $validatedData['is_active'] = $validatedData['is_active'] ?? true;
            $validatedData['is_verified'] = false; // Always start unverified

            $user = User::create($validatedData);

            // Log activity
            $this->logUserActivity($user->id, 'created', 'user', $user->id);

            // Send credentials email if requested
            if ($request->boolean('send_credentials')) {
                $this->sendUserCredentials($user, $request->password);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'data' => $user->fresh(),
                'message' => 'User created successfully'
            ], 201);

        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified user.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);

            // Log activity
            if (Auth::check()) {
                $this->logUserActivity(Auth::id(), 'viewed', 'user', $user->id);
            }

            return response()->json([
                'status' => 'success',
                'data' => $user,
                'message' => 'User retrieved successfully'
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get current authenticated user.
     */
    public function me(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User not authenticated'
                ], 401);
            }

            return response()->json([
                'status' => 'success',
                'data' => $user,
                'message' => 'Current user retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve current user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            DB::beginTransaction();

            $user = User::findOrFail($id);

            // Get validation rules from schema for updates
            $rules = UserSchema::getUpdateValidationRules();
            
            // Handle unique validation for current user
            if (isset($rules['username'])) {
                $rules['username'] = str_replace('{id}', $id, $rules['username']);
            }
            if (isset($rules['email'])) {
                $rules['email'] = str_replace('{id}', $id, $rules['email']);
            }
            
            // Add password confirmation if password is being updated
            if ($request->has('password') && $request->password) {
                $rules['confirm_password'] = 'required|same:password';
            }

            $validatedData = $request->validate($rules);
            
            // Remove confirm_password from data to be saved
            if (isset($validatedData['confirm_password'])) {
                unset($validatedData['confirm_password']);
            }
            
            // Hash password if provided
            if (isset($validatedData['password']) && $validatedData['password']) {
                $validatedData['password'] = Hash::make($validatedData['password']);
            }

            // Set updated_by if authenticated
            if (Auth::check()) {
                $validatedData['updated_by'] = Auth::id();
            }

            // Store old values for activity log
            $oldValues = $user->only(array_keys($validatedData));

            $user->update($validatedData);

            // Log activity
            $this->logUserActivity(Auth::id(), 'updated', 'user', $user->id, [
                'old_values' => $oldValues,
                'new_values' => $validatedData
            ]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'data' => $user->fresh(),
                'message' => 'User updated successfully'
            ]);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'User not found'
            ], 404);
        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update current user profile.
     */
    public function updateMe(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User not authenticated'
                ], 401);
            }

            return $this->update($request, $user->id);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update profile: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            DB::beginTransaction();

            $user = User::findOrFail($id);
            
            // Prevent deletion of current user
            if (Auth::check() && Auth::id() == $id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Cannot delete your own account'
                ], 403);
            }

            // Prevent deletion of super admin by non-super admin
            if ($user->role === 'SUPER_ADMIN' && Auth::user()->role !== 'SUPER_ADMIN') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Insufficient permissions to delete super admin'
                ], 403);
            }

            // Store user data for activity log
            $userData = $user->toArray();

            $user->delete();

            // Log activity
            $this->logUserActivity(Auth::id(), 'deleted', 'user', $id, ['deleted_user' => $userData]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'User deleted successfully'
            ]);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'User not found'
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Change user password.
     */
    public function changePassword(Request $request, string $id): JsonResponse
    {
        try {
            DB::beginTransaction();

            $user = User::findOrFail($id);

            $request->validate([
                'current_password' => 'required|string',
                'new_password' => 'required|string|min:8|confirmed',
            ]);

            // Verify current password
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Current password is incorrect'
                ], 422);
            }

            $user->update([
                'password' => Hash::make($request->new_password),
                'updated_by' => Auth::id()
            ]);

            // Log activity
            $this->logUserActivity(Auth::id(), 'password_changed', 'user', $user->id);

            // Terminate all other sessions for security
            $this->terminateAllUserSessions($user->id, false);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Password changed successfully'
            ]);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'User not found'
            ], 404);
        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to change password: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Change current user password.
     */
    public function changeMyPassword(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User not authenticated'
                ], 401);
            }

            return $this->changePassword($request, $user->id);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to change password: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reset user password (admin only).
     */
    public function resetPassword(Request $request, string $id): JsonResponse
    {
        try {
            DB::beginTransaction();

            $user = User::findOrFail($id);

            $request->validate([
                'send_email' => 'boolean',
            ]);

            // Generate temporary password
            $temporaryPassword = Str::random(12);

            $user->update([
                'password' => Hash::make($temporaryPassword),
                'updated_by' => Auth::id()
            ]);

            $response = ['message' => 'Password reset successfully'];

            // Send email or return password
            if ($request->boolean('send_email', true)) {
                $this->sendPasswordResetEmail($user, $temporaryPassword);
            } else {
                $response['temporary_password'] = $temporaryPassword;
            }

            // Log activity
            $this->logUserActivity(Auth::id(), 'password_reset', 'user', $user->id);

            // Terminate all user sessions
            $this->terminateAllUserSessions($user->id, false);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'data' => $response,
                'message' => 'Password reset successfully'
            ]);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'User not found'
            ], 404);
        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to reset password: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Change user status.
     */
    public function changeStatus(Request $request, string $id): JsonResponse
    {
        try {
            DB::beginTransaction();

            $user = User::findOrFail($id);

            $request->validate([
                'status' => 'required|in:ACTIVE,INACTIVE,SUSPENDED',
                'reason' => 'nullable|string|max:500',
            ]);

            // Prevent status change of current user
            if (Auth::check() && Auth::id() == $id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Cannot change status of your own account'
                ], 403);
            }

            $oldStatus = $user->is_active;
            $newStatus = $request->status === 'ACTIVE';

            $user->update([
                'is_active' => $newStatus,
                'updated_by' => Auth::id()
            ]);

            // Log activity
            $this->logUserActivity(Auth::id(), 'status_changed', 'user', $user->id, [
                'old_status' => $oldStatus ? 'ACTIVE' : 'INACTIVE',
                'new_status' => $request->status,
                'reason' => $request->reason
            ]);

            // Terminate sessions if deactivated or suspended
            if ($request->status !== 'ACTIVE') {
                $this->terminateAllUserSessions($user->id, false);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'data' => $user->fresh(),
                'message' => 'User status updated successfully'
            ]);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'User not found'
            ], 404);
        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update user status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user statistics.
     */
    public function statistics(): JsonResponse
    {
        try {
            $totalUsers = User::count();
            $activeUsers = User::where('is_active', true)->count();
            $inactiveUsers = User::where('is_active', false)->count();
            $pendingVerification = User::where('is_verified', false)->count();
            
            // Users by role
            $byRole = User::select('role')
                ->selectRaw('count(*) as count')
                ->groupBy('role')
                ->get()
                ->pluck('count', 'role')
                ->toArray();

            // Users by department
            $byDepartment = User::select('department')
                ->selectRaw('count(*) as count')
                ->groupBy('department')
                ->get()
                ->pluck('count', 'department')
                ->toArray();

            // Recent logins (last 30 days)
            $recentLogins = User::where('last_login_at', '>=', now()->subDays(30))->count();

            // Never logged in
            $neverLoggedIn = User::whereNull('last_login_at')->count();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'total_users' => $totalUsers,
                    'active_users' => $activeUsers,
                    'inactive_users' => $inactiveUsers,
                    'pending_verification' => $pendingVerification,
                    'by_role' => $byRole,
                    'by_department' => $byDepartment,
                    'recent_logins' => $recentLogins,
                    'never_logged_in' => $neverLoggedIn,
                ],
                'message' => 'User statistics retrieved successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve statistics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check username availability.
     */
    public function checkUsername(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'username' => 'required|string',
                'exclude_user_id' => 'nullable|integer',
            ]);

            $query = User::where('username', $request->username);

            if ($request->exclude_user_id) {
                $query->where('id', '!=', $request->exclude_user_id);
            }

            $exists = $query->exists();

            return response()->json([
                'status' => 'success',
                'data' => ['available' => !$exists],
                'message' => 'Username availability checked'
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to check username availability: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check email availability.
     */
    public function checkEmail(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'exclude_user_id' => 'nullable|integer',
            ]);

            $query = User::where('email', $request->email);

            if ($request->exclude_user_id) {
                $query->where('id', '!=', $request->exclude_user_id);
            }

            $exists = $query->exists();

            return response()->json([
                'status' => 'success',
                'data' => ['available' => !$exists],
                'message' => 'Email availability checked'
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to check email availability: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get users by role.
     */
    public function byRole(string $role): JsonResponse
    {
        try {
            $users = User::where('role', $role)->get();

            return response()->json([
                'status' => 'success',
                'data' => $users,
                'message' => "Users with role '{$role}' retrieved successfully"
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve users: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get users by department.
     */
    public function byDepartment(string $department): JsonResponse
    {
        try {
            $users = User::where('department', $department)->get();

            return response()->json([
                'status' => 'success',
                'data' => $users,
                'message' => "Users in department '{$department}' retrieved successfully"
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve users: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Private helper methods follow in next part...
     */
    /**
     * Get user activity log.
     */
    public function activity(string $id, Request $request): JsonResponse
    {
        try {
            $user = User::findOrFail($id);

            $limit = min($request->get('limit', 50), 100);

            $activities = UserActivity::where('user_id', $id)
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $activities,
                'message' => 'User activity retrieved successfully'
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve user activity: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user sessions.
     */
    public function sessions(string $id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);

            $sessions = UserSession::where('user_id', $id)
                ->where('expires_at', '>', now())
                ->orderBy('last_activity', 'desc')
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $sessions,
                'message' => 'User sessions retrieved successfully'
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve user sessions: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Terminate specific user session.
     */
    public function terminateSession(string $userId, string $sessionId): JsonResponse
    {
        try {
            $user = User::findOrFail($userId);

            $session = UserSession::where('user_id', $userId)
                ->where('id', $sessionId)
                ->first();

            if (!$session) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Session not found'
                ], 404);
            }

            $session->delete();

            // Log activity
            $this->logUserActivity(Auth::id(), 'session_terminated', 'user_session', $sessionId, [
                'target_user_id' => $userId
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Session terminated successfully'
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to terminate session: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Terminate all user sessions.
     */
    public function terminateAllSessions(string $id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);

            $sessionCount = $this->terminateAllUserSessions($id, true);

            return response()->json([
                'status' => 'success',
                'message' => "Terminated {$sessionCount} session(s) successfully"
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to terminate sessions: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify user email.
     */
    public function verify(string $id): JsonResponse
    {
        try {
            DB::beginTransaction();

            $user = User::findOrFail($id);

            $user->update([
                'is_verified' => true,
                'email_verified_at' => now(),
                'updated_by' => Auth::id()
            ]);

            // Log activity
            $this->logUserActivity(Auth::id(), 'verified', 'user', $user->id);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'data' => $user->fresh(),
                'message' => 'User verified successfully'
            ]);

        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'User not found'
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to verify user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Resend verification email.
     */
    public function resendVerification(string $id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);

            if ($user->is_verified) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User is already verified'
                ], 422);
            }

            // Send verification email logic here
            // Mail::to($user->email)->send(new UserVerificationMail($user));

            // Log activity
            $this->logUserActivity(Auth::id(), 'verification_resent', 'user', $user->id);

            return response()->json([
                'status' => 'success',
                'message' => 'Verification email sent successfully'
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to send verification email: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send user credentials.
     */
    public function sendCredentials(Request $request, string $id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);

            $request->validate([
                'include_password' => 'boolean',
            ]);

            $includePassword = $request->boolean('include_password', false);

            // Send credentials email logic here
            // Mail::to($user->email)->send(new UserCredentialsMail($user, $includePassword));

            // Log activity
            $this->logUserActivity(Auth::id(), 'credentials_sent', 'user', $user->id, [
                'include_password' => $includePassword
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Credentials sent successfully'
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not found'
            ], 404);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to send credentials: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk user actions.
     */
    public function bulkAction(Request $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            $request->validate([
                'user_ids' => 'required|array|min:1',
                'user_ids.*' => 'integer|exists:users,id',
                'action' => 'required|in:activate,deactivate,delete,reset_password',
                'reason' => 'nullable|string|max:500',
            ]);

            $userIds = $request->user_ids;
            $action = $request->action;
            $reason = $request->reason;

            // Prevent action on current user
            if (in_array(Auth::id(), $userIds)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Cannot perform bulk action on your own account'
                ], 403);
            }

            $processedCount = 0;

            foreach ($userIds as $userId) {
                try {
                    $user = User::find($userId);
                    if (!$user) continue;

                    switch ($action) {
                        case 'activate':
                            $user->update(['is_active' => true, 'updated_by' => Auth::id()]);
                            break;
                        case 'deactivate':
                            $user->update(['is_active' => false, 'updated_by' => Auth::id()]);
                            $this->terminateAllUserSessions($userId, false);
                            break;
                        case 'delete':
                            // Prevent deletion of super admin
                            if ($user->role !== 'SUPER_ADMIN' || Auth::user()->role === 'SUPER_ADMIN') {
                                $user->delete();
                            }
                            break;
                        case 'reset_password':
                            $tempPassword = Str::random(12);
                            $user->update([
                                'password' => Hash::make($tempPassword),
                                'updated_by' => Auth::id()
                            ]);
                            $this->terminateAllUserSessions($userId, false);
                            // Send email with temp password
                            break;
                    }

                    // Log activity
                    $this->logUserActivity(Auth::id(), "bulk_{$action}", 'user', $userId, [
                        'reason' => $reason
                    ]);

                    $processedCount++;
                } catch (\Exception $e) {
                    // Continue with next user if one fails
                    continue;
                }
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => "Bulk action completed successfully on {$processedCount} user(s)"
            ]);

        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to perform bulk action: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export users data.
     */
    public function export(Request $request)
    {
        try {
            $format = $request->get('format', 'csv');

            if (!in_array($format, ['csv', 'excel'])) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid export format'
                ], 422);
            }

            // Apply same filters as index method
            $query = User::query();

            // Apply filters (same as index method)
            if ($request->has('role')) {
                $query->where('role', $request->role);
            }

            if ($request->has('department')) {
                $query->where('department', $request->department);
            }

            if ($request->has('is_active')) {
                $query->where('is_active', $request->boolean('is_active'));
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%")
                      ->orWhere('username', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            $users = $query->get();

            // Log activity
            $this->logUserActivity(Auth::id(), 'exported_users', 'system', null, [
                'format' => $format,
                'count' => $users->count()
            ]);

            $fileName = 'users_export_' . now()->format('Y-m-d_H-i-s');

            if ($format === 'excel') {
                return Excel::download(new UsersExport($users), $fileName . '.xlsx');
            } else {
                return Excel::download(new UsersExport($users), $fileName . '.csv');
            }

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to export users: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Import users from file.
     */
    public function import(Request $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            $request->validate([
                'file' => 'required|file|mimes:csv,xlsx,xls|max:10240', // 10MB max
                'options' => 'nullable|json',
            ]);

            $file = $request->file('file');
            $options = json_decode($request->options ?? '{}', true);

            $import = new UsersImport($options);
            Excel::import($import, $file);

            $results = $import->getResults();

            // Log activity
            $this->logUserActivity(Auth::id(), 'imported_users', 'system', null, [
                'success_count' => $results['success_count'],
                'error_count' => $results['error_count'],
                'filename' => $file->getClientOriginalName()
            ]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'data' => $results,
                'message' => 'Users imported successfully'
            ]);

        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to import users: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Private helper methods
     */

    /**
     * Log user activity.
     */
    private function logUserActivity(int $userId, string $action, string $resource, ?int $resourceId = null, array $metadata = []): void
    {
        try {
            UserActivity::create([
                'user_id' => $userId,
                'action' => $action,
                'resource' => $resource,
                'resource_id' => $resourceId,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'metadata' => json_encode($metadata),
            ]);
        } catch (\Exception $e) {
            // Log activity creation should not fail the main operation
            \Log::error('Failed to log user activity: ' . $e->getMessage());
        }
    }

    /**
     * Terminate all user sessions.
     */
    private function terminateAllUserSessions(int $userId, bool $logActivity = true): int
    {
        try {
            $count = UserSession::where('user_id', $userId)->count();
            UserSession::where('user_id', $userId)->delete();

            if ($logActivity && Auth::check()) {
                $this->logUserActivity(Auth::id(), 'all_sessions_terminated', 'user', $userId, [
                    'terminated_count' => $count
                ]);
            }

            return $count;
        } catch (\Exception $e) {
            \Log::error('Failed to terminate user sessions: ' . $e->getMessage());
            return 0;
        }
    }

    /**
     * Send user credentials email.
     */
    private function sendUserCredentials(User $user, string $password): void
    {
        try {
            // Mail::to($user->email)->send(new UserCredentialsMail($user, $password));
        } catch (\Exception $e) {
            \Log::error('Failed to send user credentials email: ' . $e->getMessage());
        }
    }

    /**
     * Send password reset email.
     */
    private function sendPasswordResetEmail(User $user, string $temporaryPassword): void
    {
        try {
            // Mail::to($user->email)->send(new PasswordResetMail($user, $temporaryPassword));
        } catch (\Exception $e) {
            \Log::error('Failed to send password reset email: ' . $e->getMessage());
        }
    }
}