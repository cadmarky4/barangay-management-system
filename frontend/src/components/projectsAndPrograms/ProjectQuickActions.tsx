import React, { useState } from 'react';
import { Edit3, Download, Plus, Calendar } from 'lucide-react';

interface ProjectQuickActionsProps {
  onUpdateProject: () => void;
  onAddProject: () => void;
}

const ProjectQuickActions: React.FC<ProjectQuickActionsProps> = ({ onUpdateProject, onAddProject }) => {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showAddAgenda, setShowAddAgenda] = useState(false);

  const handleExportReport = () => {
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  const handleAgendaSave = (agendaData: any) => {
    console.log('Agenda saved:', agendaData);
    // Here you can handle the saved agenda data
    // For example, update your calendar state or make an API call
  };

  const actions = [
    {
      id: 1,
      title: 'Update Projects',
      shortTitle: 'Update',
      icon: Edit3,
      onClick: onUpdateProject
    },
    {
      id: 2,
      title: 'Add New Project',
      shortTitle: 'Add New',
      icon: Plus,
      onClick: onAddProject
    },
    {
      id: 3,
      title: 'Export Report',
      shortTitle: 'Export',
      icon: Download,
      onClick: handleExportReport
    }
  ];

  return (
    <>
      <style>{`
        @keyframes slideInUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        .animate-slide-in-up { animation: slideInUp 0.4s ease-out; }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        .animate-slide-in-right { animation: slideInRight 0.3s ease-out; }
      `}</style>

      <div className="bg-smblue-400 rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 animate-slide-in-up">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6 border-l-4 border-white pl-3 sm:pl-4 animate-fade-in">
          <span className="hidden sm:inline">Project Quick Actions</span>
          <span className="sm:hidden">Quick Actions</span>
        </h3>
        
        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
          {actions.map((action, index) => (
            <button
              key={action.id}
              onClick={action.onClick}
              className="group flex items-center justify-center sm:justify-start space-x-2 sm:space-x-3 bg-smblue-300 hover:bg-smblue-200 text-white p-3 sm:p-4 rounded-lg transition-all cursor-pointer duration-200 text-center sm:text-left shadow-sm animate-slide-in-right min-h-[3rem] sm:min-h-[3.5rem]"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <action.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-white" />
              
              {/* Responsive Text */}
              <div className="flex flex-col sm:block overflow-hidden">
                {/* Full title for larger screens */}
                <span className="hidden sm:inline text-xs sm:text-sm font-medium text-white leading-tight">
                  {action.title}
                </span>
                
                {/* Short title for small screens */}
                <span className="sm:hidden text-xs font-medium text-white leading-tight">
                  {action.shortTitle}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mt-3 sm:mt-4 p-3 bg-green-100 border border-green-200 text-green-800 rounded-lg animate-fade-in">
            <div className="flex items-center space-x-2">
              <Download className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium">
                <span className="hidden sm:inline">Report exported successfully!</span>
                <span className="sm:hidden">Export successful!</span>
              </span>
            </div>
          </div>
        )}
      </div>

    </>
  );
};

export default ProjectQuickActions;

