import { BaseApiService } from '../__shared/api';
import { type ApiResponse, ApiResponseSchema } from '../__shared/types';
import { z } from 'zod';
import { type Project, type CreateProjectData, type UpdateProjectData } from './project.types';

// Define Zod schemas for validation
const ProjectSchema = z.object({
  id: z.number(),
  title: z.string(),
  category: z.string(),
  description: z.string(),
  budget: z.string(),
  progress: z.number().nullable(),
  status: z.enum(['Active', 'Pending', 'Completed']),
  startDate: z.string().nullable(),
  completedDate: z.string().nullable(),
  priority: z.enum(['high', 'medium', 'low']),
  teamSize: z.number(),
  lastUpdated: z.string(),
});

const ProjectStatisticsSchema = z.object({
  totalProjects: z.number(),
  activeProjects: z.number(),
  completedProjects: z.number(),
  totalBudget: z.number(),
});

export class ProjectsService extends BaseApiService {
  /**
   * Get all projects
   */
  async getProjects(): Promise<ApiResponse<Project[]>> {
    const schema = ApiResponseSchema(z.array(ProjectSchema));
    const response = await this.request('/projects', schema);
    return response;
  }

  /**
   * Get a specific project by ID
   */
  async getProject(id: number): Promise<ApiResponse<Project>> {
    const schema = ApiResponseSchema(ProjectSchema);
    const response = await this.request(`/projects/${id}`, schema);
    return response;
  }

  /**
   * Create a new project
   */
  async createProject(projectData: CreateProjectData): Promise<ApiResponse<Project>> {
    const schema = ApiResponseSchema(ProjectSchema);
    const response = await this.request('/projects', schema, {
      method: 'POST',
      data: projectData,
    });
    return response;
  }

  /**
   * Update an existing project
   */
  async updateProject(id: number, projectData: UpdateProjectData): Promise<ApiResponse<Project>> {
    const schema = ApiResponseSchema(ProjectSchema);
    const response = await this.request(`/projects/${id}`, schema, {
      method: 'PUT',
      data: projectData,
    });
    return response;
  }

  /**
   * Delete a project
   */
  async deleteProject(id: number): Promise<ApiResponse<void>> {
    const schema = ApiResponseSchema(z.void());
    const response = await this.request(`/projects/${id}`, schema, {
      method: 'DELETE',
    });
    return response;
  }

  /**
   * Get project statistics
   */
  async getStatistics(): Promise<ApiResponse<{
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalBudget: number;
  }>> {
    const schema = ApiResponseSchema(ProjectStatisticsSchema);
    const response = await this.request('/projects/statistics', schema);
    return response;
  }
}