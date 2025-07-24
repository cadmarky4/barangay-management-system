import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFolder, FaDollarSign, FaHourglassHalf } from 'react-icons/fa';
import ViewProject from './ViewProject';
import ProjectQuickActions from './ProjectQuickActions';
import SelectProject from './SelectProject';
import StatCard from '../_global/StatCard';
import RecentActivity from './RecentActivity';
import ProjectPortfolio from './ProjectPortfolio';
import Breadcrumb from '../_global/Breadcrumb';
import { FaCircleCheck } from 'react-icons/fa6';
import type { IconType } from 'react-icons';
import { ProjectsService } from '../../services/projects/projects.service';
import { type Project as ProjectType } from '../../services/projects/project.types';

// Use the service Project type for the component
type Project = ProjectType;

interface StatItem {
  title: string;
  value: number;
  icon: IconType;
}

interface ProjectStatistics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBudget: number;
}

const ProjectsAndPrograms: React.FC = () => {
  const navigate = useNavigate();
  const [showViewModal, setShowViewModal] = useState(false);
  const [showSelectProjectModal, setShowSelectProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [statistics, setStatistics] = useState<ProjectStatistics>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalBudget: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const projectsService = new ProjectsService();
  // Load projects and statistics
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
        // Load projects and statistics in parallel
      const [projectsResponse, statisticsResponse] = await Promise.all([
        projectsService.getProjects(),
        projectsService.getStatistics()
      ]);

      if (projectsResponse.data) {
        setProjects(projectsResponse.data);
      } else {
        setError('Failed to load projects');
      }

      if (statisticsResponse.data) {
        setStatistics(statisticsResponse.data);
      }

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Animation trigger on component mount
  useEffect(() => {
    loadData();
    
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleAddProject = () => {
    navigate('/projects/add');
  };

  const handleEditProject = (project: Project) => {
    navigate(`/projects/edit/${project.id}`);
  };

  const handleViewProject = (project: Project) => {
    console.log('Viewing project:', project);
    setSelectedProject(project);
    setShowViewModal(true);
  };

  const handleUpdateProjectClick = () => {
    setShowSelectProjectModal(true);
  };

  const handleSelectProjectForEdit = (project: Project) => {
    setSelectedProject(project);
    setShowSelectProjectModal(false);
    navigate(`/projects/edit/${project.id}`);
  };

  return (
    <main className="p-4 lg:p-6 bg-gray-50 min-h-screen flex flex-col gap-4">
      {/* Automatic Breadcrumbs */}
      <Breadcrumb isLoaded={isLoaded} />

      {/* Page Header */}
      <div className={`mb-2 transition-all duration-700 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}>
        <h1 className="text-xl lg:text-2xl font-bold text-darktext pl-0">Projects and Programs</h1>
      </div>

      {/* Statistics Overview */}
      <section className={`w-full bg-white flex flex-col gap-3 border p-4 lg:p-6 rounded-2xl border-gray-100 shadow-sm transition-all duration-700 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`} style={{ transitionDelay: '150ms' }}>
        <h3 className="text-base lg:text-lg font-semibold text-darktext mb-4 lg:mb-6 border-l-4 border-smblue-400 pl-4">
          Statistics Overview
        </h3>        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {([
            { title: "Total Projects", value: statistics.totalProjects, icon: FaFolder },
            { title: "Completed Projects", value: statistics.completedProjects, icon: FaCircleCheck },
            { title: "Active Projects", value: statistics.activeProjects, icon: FaHourglassHalf },
            { title: "Total Budget", value: statistics.totalBudget, icon: FaDollarSign }
          ] as StatItem[]).map((stat, index) => {
            // Format value for display
            const formatValue = (value: number): string => {
              if (value >= 1000000) {
                return `${(value / 1000000).toFixed(1)}M`;
              } else if (value >= 1000) {
                return `${(value / 1000).toFixed(1)}K`;
              }
              return value.toString();
            };

            return (
              <div
                key={stat.title}
                className={`transition-all duration-700 ease-out ${
                  isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
                }`}
                style={{ 
                  transitionDelay: `${300 + (index * 150)}ms`,
                  transformOrigin: 'center bottom'
                }}
              >
                <StatCard 
                  title={stat.title}
                  value={formatValue(stat.value)}
                  icon={stat.icon}
                />
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Main Content */}        <div className="lg:col-span-2">
          {/* Project Portfolio */}          <ProjectPortfolio 
            projects={projects}
            loading={loading}
            error={error}
            onAddProject={handleAddProject} 
            onEditProject={handleEditProject}
            onViewProject={handleViewProject}
            onProjectsChange={loadData}
          />
          {/* Debug info */}        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1 space-y-4 lg:space-y-6">
          {/* Project Quick Actions */}
          <ProjectQuickActions 
            onUpdateProject={handleUpdateProjectClick}
            onAddProject={handleAddProject}
          />

          {/* Recent Activity */}
          <RecentActivity />
        </div>
      </div>      {/* SelectProject Modal */}
      <SelectProject 
        isOpen={showSelectProjectModal}
        projects={projects}
        loading={loading}
        onClose={() => setShowSelectProjectModal(false)}
        onSelectProject={handleSelectProjectForEdit}
      />

      {/* ViewProject Modal */}
      {selectedProject && (
        <ViewProject 
          project={selectedProject}
          isOpen={showViewModal}
          onClose={() => {
            console.log('Closing modal');
            setShowViewModal(false);
            setSelectedProject(null);
          }}
        />
      )}
    </main>
  );
};

export default ProjectsAndPrograms;