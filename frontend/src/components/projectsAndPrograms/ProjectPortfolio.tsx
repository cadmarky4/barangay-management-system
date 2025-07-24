import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Calendar, DollarSign, TrendingUp, ChevronDown, ChevronUp, Eye, Edit3 } from 'lucide-react';
import { type Project } from '../../services/projects/project.types';

interface ProjectPortfolioProps {
  projects: Project[];
  loading: boolean;
  error: string | null;
  onAddProject: () => void;
  onEditProject: (project: Project) => void;
  onViewProject: (project: Project) => void;
  onProjectsChange: () => void;
}

const ProjectPortfolio: React.FC<ProjectPortfolioProps> = ({ 
  projects, 
  loading, 
  error, 
  onAddProject, 
  onEditProject, 
  onViewProject,
  onProjectsChange
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Projects');
  const [selectedPriority, setSelectedPriority] = useState('All Priorities');
  const [sortBy, setSortBy] = useState<'title' | 'status' | 'budget' | 'progress'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAll, setShowAll] = useState(false);
  const [animateNewItems, setAnimateNewItems] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);
  const categories = ['All Projects', 'Infrastructure', 'Community', 'Health', 'Education', 'Environment'];
  const priorities = ['All Priorities', 'high', 'medium', 'low'];

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-100';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-100';
      case 'Completed':
        return 'bg-blue-100 text-blue-800 border-blue-100';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-400 bg-red-50/30';
      case 'medium':
        return 'border-l-yellow-400 bg-yellow-50/30';
      case 'low':
        return 'border-l-green-400 bg-green-50/30';
      default:
        return 'border-l-gray-200 bg-gray-50/30';
    }
  };

  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case 'high':
        return <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>;
      case 'medium':
        return <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>;
      case 'low':
        return <div className="w-2 h-2 bg-green-400 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-300 rounded-full"></div>;
    }
  };

  const handleSort = (field: 'title' | 'status' | 'budget' | 'progress') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        project.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All Projects' || project.category === selectedCategory;
    const matchesPriority = selectedPriority === 'All Priorities' || project.priority === selectedPriority;
    
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'budget':
        comparison = parseInt(a.budget.replace(/[^\d]/g, '')) - parseInt(b.budget.replace(/[^\d]/g, ''));
        break;
      case 'progress':
        comparison = (a.progress || 0) - (b.progress || 0);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const displayedProjects = showAll ? sortedProjects : sortedProjects.slice(0, 4);

  // Handle show more animation
  const handleShowMore = () => {
    if (!showAll) {
      setShowAll(true);
      setAnimateNewItems(true);
      setTimeout(() => setAnimateNewItems(false), 500);
    } else {
      setAnimateOut(true);
      setTimeout(() => {
        setShowAll(false);
        setAnimateOut(false);
      }, 250);
    }
  };

  // Reset animation when filters change
  useEffect(() => {
    setAnimateNewItems(true);
    setTimeout(() => setAnimateNewItems(false), 500);
  }, [selectedCategory, selectedPriority, searchTerm]);

  const handleProjectClick = (project: Project, e: React.MouseEvent) => {
    // Don't trigger if clicking on action buttons
    if ((e.target as HTMLElement).closest('button[data-action]')) {
      return;
    }
    onViewProject(project);
  };

  const handleEditClick = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    // Use router navigation instead of prop function
    navigate(`/projects/edit/${project.id}`);
  };

  return (
    <>
      <style>{`
        @keyframes slideInUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeInLeft {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInFromBottom {
          from { transform: translateY(15px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideOutToBottom {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(15px); opacity: 0; }
        }
        @keyframes progressBar {
          from { width: 0%; }
          to { width: var(--progress-width); }
        }
        @keyframes subtleGlow {
          0% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
          100% { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(59, 130, 246, 0.1); }
        }
        @keyframes borderPulse {
          0% { border-left-width: 4px; }
          100% { border-left-width: 6px; }
        }
        
        .animate-slide-in-up { animation: slideInUp 0.4s ease-out; }
        .animate-fade-in-left { animation: fadeInLeft 0.3s ease-out; }
        .animate-progress-bar { animation: progressBar 1s ease-out 0.5s both; }
        .animate-slide-in-bottom { animation: slideInFromBottom 0.3s ease-out; }
        .animate-slide-out-bottom { animation: slideOutToBottom 0.25s ease-in; }
        .project-card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .project-card-hover:hover {
          animation: subtleGlow 0.3s ease-out forwards, borderPulse 0.3s ease-out forwards;
        }
      `}</style>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6 animate-slide-in-up">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 border-l-4 border-smblue-400 pl-4 animate-fade-in-left">
              Project Portfolio
            </h2>
            <button 
              onClick={onAddProject}
              className="bg-smblue-400 cursor-pointer hover:bg-smblue-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Project</span>
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search projects by title, description, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
            />
          </div>

          {/* Filters and Sorting */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
            {/* Category and Priority Filters */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700 self-center mr-2">Category:</span>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 ${
                      selectedCategory === category
                        ? 'bg-smblue-400 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700 self-center mr-2">Priority:</span>
                {priorities.map((priority) => (
                  <button
                    key={priority}
                    onClick={() => setSelectedPriority(priority)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 flex items-center space-x-1 ${
                      selectedPriority === priority
                        ? 'bg-smblue-400 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {priority !== 'All Priorities' && getPriorityIndicator(priority)}
                    <span className="capitalize">{priority}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              {['title', 'status', 'budget', 'progress'].map((field) => (
                <button
                  key={field}
                  onClick={() => handleSort(field as any)}
                  className={`px-3 py-1 text-sm rounded-md cursor-pointer transition-all duration-200 flex items-center space-x-1 ${
                    sortBy === field
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="capitalize">{field}</span>
                  {sortBy === field && (
                    sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                  )}
                </button>
              ))}
            </div>
          </div>          {/* Results Summary */}
          {!loading && !error && (
            <div className="text-sm text-gray-600 mb-4">
              Showing {displayedProjects.length} of {filteredProjects.length} projects
              {searchTerm && ` for "${searchTerm}"`}
              {selectedCategory !== 'All Projects' && ` in ${selectedCategory}`}
              {selectedPriority !== 'All Priorities' && ` with ${selectedPriority} priority`}
            </div>
          )}
        </div>        {/* Projects List */}
        <div className="p-6 space-y-6">
          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center animate-pulse">
                <TrendingUp className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">Loading projects...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-red-500 mb-4">{error}</p>
              <button 
                onClick={onProjectsChange}
                className="bg-smblue-400 text-white px-4 py-2 rounded-lg hover:bg-smblue-500 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Projects */}
          {!loading && !error && displayedProjects.map((project, index) => {
            const shouldAnimateIn = index < 4 || (showAll && animateNewItems && index >= 4);
            const shouldAnimateOut = showAll && animateOut && index >= 4;
            
            let animationClass = '';
            let delay = '0ms';
            
            if (shouldAnimateOut) {
              animationClass = 'animate-slide-out-bottom';
              delay = `${(index - 4) * 30}ms`;
            } else if (shouldAnimateIn) {
              animationClass = index < 4 ? 'animate-slide-in-up' : 'animate-slide-in-bottom';
              delay = index < 4 ? `${index * 100}ms` : `${(index - 4) * 50}ms`;
            }

            return (
              <div
                key={project.id}
                onClick={(e) => handleProjectClick(project, e)}
                className={`rounded-lg p-6 transition-all duration-200 shadow-md border-l-4 cursor-pointer hover:shadow-lg hover:scale-[1.001] ${getPriorityColor(project.priority)} ${animationClass}`}
                style={{animationDelay: delay}}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadgeColor(project.status)}`}>
                        {project.status}
                      </span>
                      {getPriorityIndicator(project.priority)}
                    </div>
                    
                    <div className="flex items-center space-x-4 mb-3">
                      <span className="text-sm text-smblue-400 bg-blue-50 px-2 py-1 rounded-md">
                        {project.category}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        Updated {project.lastUpdated}
                      </span>
                      <span className="text-sm text-gray-500">
                        Team: {project.teamSize} members
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">{project.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-lg font-semibold text-green-600 flex items-center">
                          {project.budget}
                        </span>
                        {project.progress !== null && (
                          <span className="text-sm text-gray-600 flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Progress: {project.progress}%
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={(e) => handleEditClick(e, project)}
                          data-action="edit"
                          className="p-2 cursor-pointer text-gray-400 hover:text-smblue-400 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          title="Edit project"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Date Information */}
                <div className="flex justify-between text-sm text-gray-500 mb-4">
                  {project.startDate && (
                    <span>Started: {project.startDate}</span>
                  )}
                  {project.completedDate && (
                    <span>Completed: {project.completedDate}</span>
                  )}
                </div>
                
                {/* Progress Bar */}
                {project.progress !== null && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-smblue-400 h-2 rounded-full transition-all duration-1000 ease-out animate-progress-bar"
                      style={{'--progress-width': `${project.progress}%`} as React.CSSProperties}
                    ></div>
                  </div>
                )}
              </div>
            );
          })}          
          {/* Empty State */}
          {!loading && !error && filteredProjects.length === 0 && (
            <div className="text-center py-12 animate-slide-in-up">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? `No projects match "${searchTerm}" in ${selectedCategory} with ${selectedPriority} priority`
                  : `No projects found in ${selectedCategory} with ${selectedPriority} priority`
                }
              </p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All Projects');
                  setSelectedPriority('All Priorities');
                }}
                className="text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                Clear filters
              </button>
            </div>
          )}
          
          {/* Show More/Less Button */}
          {!loading && !error && filteredProjects.length > 4 && (
            <div className="text-center pt-4 border-t border-gray-200">
              <button 
                onClick={handleShowMore}
                className="cursor-pointer text-smblue-400 hover:text-white text-sm font-medium flex items-center space-x-2 mx-auto transition-all duration-200 transform hover:scale-105 active:scale-95 px-4 py-2 rounded-2xl hover:bg-smblue-400"
              >
                <span>
                  {showAll 
                    ? 'Show Less' 
                    : `Show ${filteredProjects.length - 4} More Projects`
                  }
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showAll ? 'rotate-180' : ''}`} />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProjectPortfolio;

