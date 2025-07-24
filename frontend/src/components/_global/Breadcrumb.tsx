import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

interface BreadcrumbProps {
  className?: string;
  isLoaded?: boolean;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ className = '', isLoaded = true }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Route configuration for custom labels
  const routeConfig: { [key: string]: string } = {
    '': 'Dashboard',
    'dashboard': 'Dashboard',
    'projects': 'Projects and Programs',
    'projects/add': 'Add Project',
    'projects/edit': 'Edit Project',
    'residents': 'Residents Management',
    'residents/add': 'Add Resident',
    'residents/edit': 'Edit Resident',
    'blotter': 'Blotter Management',
    'blotter/add': 'Add Blotter Case',
    'blotter/edit': 'Edit Blotter Case',
    'clearance': 'Clearance Management',
    'clearance/add': 'Issue Clearance',
    'clearance/edit': 'Edit Clearance',
    'officials': 'Barangay Officials',
    'officials/add': 'Add Official',
    'officials/edit': 'Edit Official',
    'settings': 'Settings',
    'profile': 'Profile',
  };

  // Function to convert path segment to readable label
  const formatLabel = (segment: string, fullPath: string): string => {
    // Check if we have a custom label for the full path
    if (routeConfig[fullPath]) {
      return routeConfig[fullPath];
    }
    
    // Check if we have a custom label for just this segment
    if (routeConfig[segment]) {
      return routeConfig[segment];
    }
    
    // Default formatting: convert kebab-case to Title Case
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Generate breadcrumb items from current path
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(segment => segment !== '');
    
    // Always start with Dashboard
    const breadcrumbs = [
      { label: 'Dashboard', path: '/dashboard', isClickable: true }
    ];

    // If we're already on dashboard, return just dashboard
    if (pathSegments.length === 0 || (pathSegments.length === 1 && pathSegments[0] === 'dashboard')) {
      return [{ label: 'Dashboard', path: '/dashboard', isClickable: false }];
    }

    // Build breadcrumbs for nested paths
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const fullPathKey = pathSegments.slice(0, index + 1).join('/');
      
      // Skip dashboard if it's already added
      if (segment === 'dashboard') return;
      
      const isLast = index === pathSegments.length - 1;
      
      breadcrumbs.push({
        label: formatLabel(segment, fullPathKey),
        path: currentPath,
        isClickable: !isLast
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't render breadcrumbs if there's only one item (Dashboard)
  if (breadcrumbs.length <= 1 && breadcrumbs[0].label === 'Dashboard' && !breadcrumbs[0].isClickable) {
    return null;
  }

  const handleBreadcrumbClick = (path: string) => {
    navigate(path);
  };

  return (
    <nav 
      className={`flex items-center space-x-2 text-sm text-gray-600 mb-2 transition-all duration-700 ease-out ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      } ${className}`}
      aria-label="Breadcrumb"
    >
      {breadcrumbs.map((breadcrumb, index) => (
        <React.Fragment key={breadcrumb.path}>
          {breadcrumb.isClickable ? (
            <button
              onClick={() => handleBreadcrumbClick(breadcrumb.path)}
              className="text-smblue-400 hover:text-smblue-600 transition-colors duration-200 cursor-pointer"
            >
              {breadcrumb.label}
            </button>
          ) : (
            <span className="text-gray-900 font-medium">
              {breadcrumb.label}
            </span>
          )}
          
          {index < breadcrumbs.length - 1 && (
            <FiChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;