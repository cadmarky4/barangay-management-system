// Project-specific types and interfaces

export interface Project {
  id: number;
  title: string;
  category: string;
  description: string;
  budget: string;
  progress: number | null;
  status: 'Active' | 'Pending' | 'Completed';
  startDate: string | null;
  completedDate: string | null;
  priority: 'high' | 'medium' | 'low';
  teamSize: number;
  lastUpdated: string;
}

export interface ProjectFormData {
  title: string;
  category: string;
  description: string;
  budget: string;
  status: 'Active' | 'Pending' | 'Completed';
  startDate: string;
  completedDate: string;
  priority: 'high' | 'medium' | 'low';
  teamSize: number;
}

export interface CreateProjectData {
  title: string;
  category: string;
  description: string;
  budget: string;
  status: 'Active' | 'Pending' | 'Completed';
  startDate: string | null;
  completedDate: string | null;
  priority: 'high' | 'medium' | 'low';
  teamSize: number;
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
  nonce?: string,
}