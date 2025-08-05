import React from 'react';
import { X, Calendar, Users, DollarSign, TrendingUp, MapPin, Flag, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { type Project } from '../../services/projects/project.types';

interface ViewProjectProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

const ViewProject: React.FC<ViewProjectProps> = ({ project, isOpen, onClose }) => {
  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'Pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Completed':
        return 'text-smblue-400 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <TrendingUp className="w-4 h-4" />;
      case 'Pending':
        return <Clock className="w-4 h-4" />;
      case 'Completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getPriorityIcon = (priority: string) => {
    return <Flag className="w-4 h-4" />;
  };

  // Sample additional data for the project view
  const projectDetails = {
    location: 'Brgy. West Triangle, Zone 1-3',
    projectManager: 'Juan Dela Cruz',
    expectedBeneficiaries: '12,000 residents',
    fundingSource: 'Barangay Fund',
    totalBudget: project.budget,
    spentAmount: project.progress ? `₱${Math.round(parseInt(project.budget.replace(/[^\d]/g, '')) * (project.progress / 100)).toLocaleString()}` : 'N/A',
    milestones: [
      { name: 'Project Planning', status: 'completed', date: '2025-01-15' },
      { name: 'Site Survey', status: 'completed', date: '2025-02-10' },
      { name: 'Material Procurement', status: 'active', date: '2025-03-01' },
      { name: 'Installation Phase', status: 'pending', date: '2025-04-15' },
      { name: 'Testing & Commissioning', status: 'pending', date: '2025-05-30' }
    ],
    risks: [
      'Weather delays during installation',
      'Supply chain disruptions for materials',
      'Coordination with utility companies'
    ]
  };

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
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes progressBarGrow {
          from { width: 0%; }
          to { width: var(--progress-width); }
        }
        
        .animate-modal-fade-in { 
          opacity: 0;
          animation: modalFadeIn 0.3s ease-out forwards; 
        }
        .animate-modal-slide-in { 
          opacity: 0;
          animation: modalSlideIn 0.4s ease-out forwards; 
        }
        .animate-slide-in-up { 
          opacity: 0;
          animation: slideInUp 0.4s ease-out forwards; 
        }
        .animate-progress-grow { animation: progressBarGrow 1.5s ease-out 0.5s both; }
      `}</style>

      {/* Modal Backdrop */}
      <div 
        className="fixed inset-0  bg-[rgba(0,0,0,0.2)] flex items-center justify-center z-50 p-4 animate-modal-fade-in"
        onClick={onClose}
      >
        {/* Modal Content */}
        <div 
          className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-modal-slide-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-smblue-400 to-smblue-300 text-white p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-smblue-400 to-smblue-300"></div>
            <div className="relative z-10 flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-2xl font-bold">{project.title}</h2>
                  <span className="text-blue-100 bg-blue-500/30 px-3 py-1 rounded-full text-sm font-medium">
                    {project.category}
                  </span>
                </div>
                <p className="text-blue-100 text-sm">Project ID: PRJ-{project.id.toString().padStart(4, '0')}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Project Overview */}
                <div className="animate-slide-in-up" style={{animationDelay: '0.1s'}}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 border-l-4 border-smblue-400 pl-4">
                    Project Overview
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{project.description}</p>
                </div>

                {/* Status & Progress */}
                <div className="animate-slide-in-up" style={{animationDelay: '0.2s'}}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 border-l-4 border-smblue-400 pl-4">
                    Status & Progress
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className={`p-4 rounded-lg border ${getStatusColor(project.status)}`}>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(project.status)}
                        <span className="font-medium">Current Status</span>
                      </div>
                      <p className="mt-1 font-semibold">{project.status}</p>
                    </div>
                    
                    <div className={`p-4 rounded-lg border ${getPriorityColor(project.priority)}`}>
                      <div className="flex items-center space-x-2">
                        {getPriorityIcon(project.priority)}
                        <span className="font-medium">Priority Level</span>
                      </div>
                      <p className="mt-1 font-semibold capitalize">{project.priority}</p>
                    </div>
                  </div>

                  {project.progress !== null && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                        <span className="text-sm font-semibold text-smblue-400">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-smblue-400 h-3 rounded-full animate-progress-grow"
                          style={{'--progress-width': `${project.progress}%`} as React.CSSProperties}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Project Milestones */}
                <div className="animate-slide-in-up" style={{animationDelay: '0.3s'}}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 border-l-4 border-smblue-400 pl-4">
                    Project Milestones
                  </h3>
                  <div className="space-y-3">
                    {projectDetails.milestones.map((milestone, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-3 h-3 rounded-full ${
                          milestone.status === 'completed' ? 'bg-green-500' :
                          milestone.status === 'active' ? 'bg-blue-500' : 'bg-gray-300'
                        }`}></div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{milestone.name}</p>
                          <p className="text-sm text-gray-500">{milestone.date}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                          milestone.status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {milestone.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Potential Risks */}
                <div className="animate-slide-in-up" style={{animationDelay: '0.4s'}}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 border-l-4 border-smblue-400 pl-4">
                    Potential Risks & Challenges
                  </h3>
                  <ul className="space-y-2">
                    {projectDetails.risks.map((risk, index) => (
                      <li key={index} className="flex items-start space-x-2 text-gray-600">
                        <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Key Details */}
                <div className="animate-slide-in-up" style={{animationDelay: '0.2s'}}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 border-l-4 border-smblue-400 pl-4">
                    Key Details
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Location</p>
                        <p className="text-sm text-gray-600">{projectDetails.location}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Project Manager</p>
                        <p className="text-sm text-gray-600">{projectDetails.projectManager}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Team Size</p>
                        <p className="text-sm text-gray-600">{project.teamSize} members</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Expected Beneficiaries</p>
                        <p className="text-sm text-gray-600">{projectDetails.expectedBeneficiaries}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Timeline</p>
                        <p className="text-sm text-gray-600">
                          {project.startDate && `Started: ${project.startDate}`}
                          {project.completedDate && <><br />Completed: {project.completedDate}</>}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Last Updated</p>
                        <p className="text-sm text-gray-600">{project.lastUpdated}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Budget Information */}
                <div className="animate-slide-in-up" style={{animationDelay: '0.3s'}}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 border-l-4 border-smblue-400 pl-4">
                    Budget Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Total Budget</span>
                      <span className="text-sm font-semibold text-green-600">{projectDetails.totalBudget}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Amount Spent</span>
                      <span className="text-sm font-semibold text-blue-600">{projectDetails.spentAmount}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Funding Source</span>
                      <span className="text-sm text-gray-600">{projectDetails.fundingSource}</span>
                    </div>

                    {project.progress !== null && (
                      <div className="pt-2 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Budget Utilization</span>
                          <span className="text-sm font-semibold text-purple-600">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full animate-progress-grow"
                            style={{'--progress-width': `${project.progress}%`} as React.CSSProperties}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t p-4 bg-gray-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-smblue-400 hover:bg-smblue-400/90 text-white rounded-lg transition-all duration-200 hover:shadow-md cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewProject;

