import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      id,
      duration: 5000, // Default 5 seconds
      persistent: false,
      ...notification,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove notification after duration (unless persistent)
    if (!newNotification.persistent) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      showNotification,
      removeNotification,
      clearAllNotifications,
    }}>
      {children}
      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />
    </NotificationContext.Provider>
  );
};

interface NotificationContainerProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({ notifications, onRemove }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onRemove: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onRemove }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <FiCheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <FiXCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <FiAlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <FiInfo className="w-5 h-5 text-blue-500" />;
      default:
        return <FiInfo className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTitleColor = () => {
    switch (notification.type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  const getMessageColor = () => {
    switch (notification.type) {
      case 'success':
        return 'text-green-700';
      case 'error':
        return 'text-red-700';
      case 'warning':
        return 'text-yellow-700';
      case 'info':
        return 'text-blue-700';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div className={`
      ${getBackgroundColor()}
      border rounded-lg shadow-lg p-4 
      transform transition-all duration-300 ease-in-out
      animate-in slide-in-from-right
    `}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${getTitleColor()}`}>
            {notification.title}
          </p>
          {notification.message && (
            <p className={`mt-1 text-sm ${getMessageColor()}`}>
              {notification.message}
            </p>
          )}
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => onRemove(notification.id)}
          >
            <span className="sr-only">Close</span>
            <FiX className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Utility hook for common notification patterns
export const useNotificationHelpers = () => {
  const { showNotification } = useNotifications();

  return {
    showSuccess: (title: string, message?: string) => 
      showNotification({ type: 'success', title, message }),
    
    showError: (title: string, message?: string) => 
      showNotification({ type: 'error', title, message, duration: 7000 }),
    
    showWarning: (title: string, message?: string) => 
      showNotification({ type: 'warning', title, message }),
    
    showInfo: (title: string, message?: string) => 
      showNotification({ type: 'info', title, message }),

    // Specific helpers for CRUD operations
    showCreateSuccess: (entity: string, name?: string) => 
      showNotification({
        type: 'success',
        title: `${entity} Created`,
        message: name ? `${name} has been successfully created.` : `${entity} has been successfully created.`
      }),

    showUpdateSuccess: (entity: string, name?: string) => 
      showNotification({
        type: 'success',
        title: `${entity} Updated`,
        message: name ? `${name} has been successfully updated.` : `${entity} has been successfully updated.`
      }),

    showDeleteSuccess: (entity: string, name?: string) => 
      showNotification({
        type: 'success',
        title: `${entity} Deleted`,
        message: name ? `${name} has been successfully deleted.` : `${entity} has been successfully deleted.`
      }),

    showCreateError: (entity: string, error?: string) => 
      showNotification({
        type: 'error',
        title: `Failed to Create ${entity}`,
        message: error || `An error occurred while creating the ${entity.toLowerCase()}. Please try again.`,
        duration: 7000
      }),

    showUpdateError: (entity: string, error?: string) => 
      showNotification({
        type: 'error',
        title: `Failed to Update ${entity}`,
        message: error || `An error occurred while updating the ${entity.toLowerCase()}. Please try again.`,
        duration: 7000
      }),

    showDeleteError: (entity: string, error?: string) => 
      showNotification({
        type: 'error',
        title: `Failed to Delete ${entity}`,
        message: error || `An error occurred while deleting the ${entity.toLowerCase()}. Please try again.`,
        duration: 7000
      }),
  };
};
