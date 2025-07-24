import React, { useState } from 'react';
import { FiX, FiSearch, FiEdit3, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { type Project } from '../../services/projects/project.types';

interface SelectProjectProps {
  isOpen: boolean;
  projects: Project[];
  loading: boolean;
  onClose: () => void;
  onSelectProject: (project: Project) => void;
}

const SelectProject: React.FC<SelectProjectProps> = ({ 
  isOpen, 
  projects, 
  loading, 
  onClose, 
  onSelectProject 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  if (!isOpen) return null;

  const categories = ['All', 'Infrastructure', 'Health', 'Education', 'Environment', 'Community'];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <FiClock className="w-4 h-4 text-green-500" />;
      case 'Pending':
        return <FiAlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'Completed':
        return <FiCheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <FiClock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-300';
      case 'medium':
        return 'border-l-yellow-300';
      case 'low':
        return 'border-l-green-300';
      default:
        return 'border-l-gray-500';
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        project.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || project.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideIn {
          from { transform: scale(0.95) translateY(-20px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes slideInUp {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .animate-modal-fade-in { animation: modalFadeIn 0.3s ease-out; }
        .animate-modal-slide-in { animation: modalSlideIn 0.4s ease-out; }
        .animate-slide-in-up { animation: slideInUp 0.3s ease-out; }
      `}</style>

      {/* Modal Backdrop */}
      <div 
        className="fixed inset-0 bg-[rgba(0,0,0,0.1)] flex items-center justify-center z-50 p-4 animate-modal-fade-in"
        onClick={onClose}
      >
        {/* Modal Content */}
        <div 
          className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden animate-modal-slide-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-smblue-400 to-smblue-300 text-white p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Select Project to Update</h2>
                <p className="text-blue-100 text-sm mt-1">Choose a project from the list below to edit</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search projects by name or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-smblue-400 focus:border-smblue-400 transition-all duration-200"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedCategory === category
                        ? 'bg-smblue-400 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-sm text-gray-600 mt-3">
              Found {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
            </p>
          </div>          {/* Projects List */}
          <div className="p-6 overflow-y-auto max-h-96">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center animate-pulse">
                  <FiSearch className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">Loading projects...</p>
              </div>
            ) : filteredProjects.length > 0 ? (
              <div className="space-y-4">
                {filteredProjects.map((project, index) => (
                  <div
                    key={project.id}
                    className={`rounded-lg  p-4 shadow-md hover:scale-[1.01]  transition-all duration-200 cursor-pointer animate-slide-in-up border-l-4 ${getPriorityColor(project.priority)}`}
                    style={{animationDelay: `${index * 0.1}s`}}
                    onClick={() => onSelectProject(project)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{project.title}</h3>
                          <div className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(project.status)}`}>
                            {getStatusIcon(project.status)}
                            <span>{project.status}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 mb-2">
                          <span className="text-sm text-smblue-400 bg-blue-50 px-2 py-1 rounded-md">
                            {project.category}
                          </span>
                          <span className="text-sm text-green-600 font-medium">
                            {project.budget}
                          </span>
                          {project.progress !== null && (
                            <span className="text-sm text-gray-600">
                              {project.progress}% Complete
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {project.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Team: {project.teamSize} members</span>
                          <span>Updated {project.lastUpdated}</span>
                        </div>
                      </div>
                      
                      <div className="ml-4 flex items-center">
                        <FiEdit3 className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FiSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? `No projects match "${searchTerm}" in ${selectedCategory}`
                    : `No projects found in ${selectedCategory}`
                  }
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t p-4 bg-gray-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SelectProject;

