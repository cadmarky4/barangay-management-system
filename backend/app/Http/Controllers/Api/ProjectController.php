<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class ProjectController extends Controller
{
    /**
     * Display a listing of projects.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Project::query();

            // Apply filters
            if ($request->has('category')) {
                $query->where('category', $request->category);
            }

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('priority')) {
                $query->where('priority', $request->priority);
            }

            // Apply sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            $projects = $query->get();

            // Transform to frontend format
            $frontendProjects = $projects->map(function ($project) {
                return $project->toFrontendFormat();
            });

            return response()->json([
                'message' => 'Projects retrieved successfully',
                'data' => $frontendProjects,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve projects',
                'errors' => ['general' => [$e->getMessage()]]
            ], 500);
        }
    }

    /**
     * Store a newly created project.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'category' => 'required|string|max:255',
                'description' => 'required|string',
                'budget' => 'required|string',
                'status' => 'sometimes|in:Active,Pending,Completed',
                'startDate' => 'nullable|date',
                'completedDate' => 'nullable|date',
                'priority' => 'sometimes|in:high,medium,low',
                'teamSize' => 'sometimes|integer|min:0',
            ]);

            // Transform frontend data to backend format
            $projectData = [
                'title' => $validated['title'],
                'category' => $validated['category'],
                'description' => $validated['description'],
                'total_budget' => (float) str_replace(',', '', $validated['budget']),
                'status' => $validated['status'] ?? 'Pending',
                'start_date' => $validated['startDate'] ?? null,
                'actual_end_date' => $validated['completedDate'] ?? null,
                'priority' => $validated['priority'] ?? 'medium',
                'team_size' => $validated['teamSize'] ?? 0,
                'progress_percentage' => 0,
            ];

            $project = Project::create($projectData);

            return response()->json([
                'message' => 'Project created successfully',
                'data' => $project->toFrontendFormat(),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create project',
                'errors' => ['general' => [$e->getMessage()]]
            ], 500);
        }
    }

    /**
     * Display the specified project.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $project = Project::findOrFail($id);

            return response()->json([
                'message' => 'Project retrieved successfully',
                'data' => $project->toFrontendFormat(),
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Project not found',
                'errors' => ['general' => ['Project not found']]
            ], 404);
        }
    }

    /**
     * Update the specified project.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $project = Project::findOrFail($id);

            $validated = $request->validate([
                'title' => 'sometimes|string|max:255',
                'category' => 'sometimes|string|max:255',
                'description' => 'sometimes|string',
                'budget' => 'sometimes|string',
                'status' => 'sometimes|in:Active,Pending,Completed',
                'startDate' => 'nullable|date',
                'completedDate' => 'nullable|date',
                'priority' => 'sometimes|in:high,medium,low',
                'teamSize' => 'sometimes|integer|min:0',
            ]);

            $project->updateFromFrontend($validated);

            return response()->json([
                'message' => 'Project updated successfully',
                'data' => $project->fresh()->toFrontendFormat(),
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Project not found',
                'errors' => ['general' => ['Project not found']]
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update project',
                'errors' => ['general' => [$e->getMessage()]]
            ], 500);
        }
    }

    /**
     * Remove the specified project from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $project = Project::findOrFail($id);
            $project->delete();

            return response()->json([
                'message' => 'Project deleted successfully',
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Project not found',
                'errors' => ['general' => ['Project not found']]
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete project',
                'errors' => ['general' => [$e->getMessage()]]
            ], 500);
        }
    }

    /**
     * Get project statistics.
     */
    public function statistics(): JsonResponse
    {
        try {
            $totalProjects = Project::count();
            $activeProjects = Project::where('status', 'Active')->count();
            $completedProjects = Project::where('status', 'Completed')->count();
            $totalBudget = Project::sum('total_budget');

            return response()->json([
                'message' => 'Project statistics retrieved successfully',
                'data' => [
                    'totalProjects' => $totalProjects,
                    'activeProjects' => $activeProjects,
                    'completedProjects' => $completedProjects,
                    'totalBudget' => $totalBudget,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve project statistics',
                'errors' => ['general' => [$e->getMessage()]]
            ], 500);
        }
    }
}
