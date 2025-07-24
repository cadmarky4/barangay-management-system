import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUserPlus, FiHome, FiFileText, FiAlertTriangle } from 'react-icons/fi';

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      id: 1,
      title: 'Add New Resident',
      icon: FiUserPlus,
      path: '/residents/add',
    },
    {
      id: 2,
      title: 'Add New Household',
      icon: FiHome,
      path: '/household/add',
    },
    {
      id: 3,
      title: 'Issue Barangay Certificate',
      icon: FiFileText,
      path: '/process-document',
    },
    {
      id: 4,
      title: 'Add Blotter Case',
      icon: FiAlertTriangle,
      path: '/help-desk/file-blotter',
    }
  ];

  const handleActionClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="bg-smblue-400 rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-white mb-6 border-l-4 border-white border-opacity-30 pl-4">
        Quick Actions
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleActionClick(action.path)}
            className="cursor-pointer no-underline flex items-center space-x-3 bg-smblue-300 hover:bg-smblue-200 text-white p-4 rounded-lg transition-all duration-200 text-left shadow-sm hover:shadow-md transform hover:scale-105"
          >
            <action.icon className="w-5 h-5 flex-shrink-0 text-white" />
            <span className="text-sm font-medium text-white">{action.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions; 

