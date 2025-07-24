import React, { useState, useEffect } from 'react';
import { DashboardService, type DashboardNotification } from '../../services/dashboard/dashboard.service';

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboardService] = useState(new DashboardService());

  // Fetch notifications on component mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await dashboardService.getNotifications();
        console.log('Fetched notifications:', response);
        // Check if response data is valid
        console.log('Response data:', response.data);
        if (response.data) {
          setNotifications(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [dashboardService]);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-darktext mb-6 border-l-4 border-smblue-400 pl-4">
        Notifications
      </h3>
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-smblue-400"></div>
          <span className="ml-2 text-gray-600">Loading notifications...</span>
        </div>
      ) : notifications?.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No notifications
          </div>
        ) : (
          <div className="space-y-4">
            {notifications?.map((notification) => (
              <div key={notification.id} className="flex items-start justify-between py-3 border-b border-gray-100 last:border-b-0">
          <div className="flex items-start space-x-3">
            <div className={`w-2 h-2 rounded-full mt-2 ${
              notification.type === 'success' ? 'bg-green-500' : 
              notification.type === 'warning' ? 'bg-yellow-500' :
              notification.type === 'error' ? 'bg-red-500' :
              'bg-smblue-400'
            }`}></div>
            <p className="text-sm text-gray-700 flex-1">
              {notification.message}
            </p>
          </div>
          <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
            {notification.time}
          </span>
              </div>
            ))}
          </div>
        )}
    </div>
  );
};

export default Notifications; 

