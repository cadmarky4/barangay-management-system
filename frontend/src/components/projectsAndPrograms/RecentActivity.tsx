import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, FileText, Users, TrendingUp, ChevronRight, Filter } from 'lucide-react';
import { DashboardService } from '../../services/dashboard/dashboard.service';

interface ActivityItem {
  id: number;
  activity: string;
  time: string;
  type: 'completed' | 'submitted' | 'approved' | 'started' | 'updated';
  priority: 'high' | 'medium' | 'low';
  category: string;
}

const RecentActivity: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'completed' | 'submitted' | 'approved' | 'started' | 'updated'>('all');
  const [showAll, setShowAll] = useState(false);
  const [animateNewItems, setAnimateNewItems] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboardService] = useState(new DashboardService());

  // Static fallback data
  const staticActivities: ActivityItem[] = [
    { 
      id: 1, 
      activity: 'Street Lighting project milestone completed', 
      time: '2 hours ago',
      type: 'completed',
      priority: 'high',
      category: 'Infrastructure'
    },
    { 
      id: 2, 
      activity: 'New Project Proposal Submitted', 
      time: '1 day ago',
      type: 'submitted',
      priority: 'medium',
      category: 'General'
    },
    { 
      id: 3, 
      activity: 'Health Center renovation approved', 
      time: '3 days ago',
      type: 'approved',
      priority: 'high',
      category: 'Health'
    },
    { 
      id: 4, 
      activity: 'Waste Management project completed', 
      time: '1 week ago',
      type: 'completed',
      priority: 'medium',
      category: 'Environment'
    },
    { 
      id: 5, 
      activity: 'Community Center project started', 
      time: '2 weeks ago',
      type: 'started',
      priority: 'high',
      category: 'Community'
    },
    { 
      id: 6, 
      activity: 'Water System improvement approved', 
      time: '3 weeks ago',
      type: 'approved',
      priority: 'high',
      category: 'Infrastructure'
    },
    { 
      id: 7, 
      activity: 'Youth Development program updated', 
      time: '1 month ago',
      type: 'updated',
      priority: 'medium',
      category: 'Education'
    },
    { 
      id: 8, 
      activity: 'Emergency Response training completed', 
      time: '1 month ago',
      type: 'completed',
      priority: 'high',
      category: 'Safety'
    }
  ];
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await dashboardService.getRecentActivities();
        if (response.data && Array.isArray(response.data)) {
          // Map backend data to frontend format
          const mappedActivities: ActivityItem[] = response.data.map((item) => ({
            id: item.id,
            activity: item.description,
            time: item.time,
            type: mapActivityType(item.type),
            priority: mapActivityPriority(item.type),
            category: mapActivityCategory(item.type)
          }));
          setActivities(mappedActivities);
        } else {
          // Fallback to static data if API returns unexpected format
          setActivities(staticActivities);
        }
      } catch (error) {
        console.log('Recent activities API not available, using static data');
        // Fallback to static data if API fails
        setActivities(staticActivities);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [dashboardService]);

  // Helper functions to map backend types to frontend format
  const mapActivityType = (backendType: string): 'completed' | 'submitted' | 'approved' | 'started' | 'updated' => {
    switch (backendType) {
      case 'project': return 'updated';
      case 'resident': return 'submitted';
      case 'document': return 'approved';
      case 'blotter': return 'started';
      default: return 'updated';
    }
  };

  const mapActivityPriority = (backendType: string): 'high' | 'medium' | 'low' => {
    switch (backendType) {
      case 'project': return 'high';
      case 'blotter': return 'high';
      case 'document': return 'medium';
      case 'resident': return 'medium';
      default: return 'medium';
    }
  };

  const mapActivityCategory = (backendType: string): string => {
    switch (backendType) {
      case 'project': return 'Infrastructure';
      case 'resident': return 'Residents';
      case 'document': return 'Documents';
      case 'blotter': return 'Safety';
      default: return 'General';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'submitted':
        return <FileText className="w-4 h-4 text-smblue-400" />;
      case 'approved':
        return <TrendingUp className="w-4 h-4 text-purple-500" />;
      case 'started':
        return <Users className="w-4 h-4 text-orange-500" />;
      case 'updated':
        return <Clock className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'completed':
        return 'border-green-200 bg-green-50/30 hover:bg-green-50/50';
      case 'submitted':
        return 'border-smblue-200 bg-blue-50/30 hover:bg-blue-50/50';
      case 'approved':
        return 'border-purple-200 bg-purple-50/30 hover:bg-purple-50/50';
      case 'started':
        return 'border-orange-200 bg-orange-50/30 hover:bg-orange-50/50';
      case 'updated':
        return 'border-gray-200 bg-gray-50/30 hover:bg-gray-50/50';
      default:
        return 'border-gray-200 bg-gray-50/30 hover:bg-gray-50/50';
    }
  };

  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case 'high':
        return <div className="w-2 h-2 bg-red-300 rounded-full animate-pulse"></div>;
      case 'medium':
        return <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>;
      case 'low':
        return <div className="w-2 h-2 bg-green-300 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-300 rounded-full"></div>;
    }
  };

  const filteredActivities = activities.filter(activity => 
    filter === 'all' || activity.type === filter
  );

  const displayedActivities = showAll ? filteredActivities : filteredActivities.slice(0, 5);

  // Handle show more animation
  const handleShowMore = () => {
    if (!showAll) {
      setShowAll(true);
      setAnimateNewItems(true);
      // Reset animation state after animation completes
      setTimeout(() => setAnimateNewItems(false), 500);
    } else {
      // Animate out before hiding
      setAnimateOut(true);
      setTimeout(() => {
        setShowAll(false);
        setAnimateOut(false);
      }, 250); // Match the animation duration
    }
  };
  // Reset animation when filter changes
  useEffect(() => {
    setAnimateNewItems(true);
    setTimeout(() => setAnimateNewItems(false), 500);
  }, [filter]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in-up">
        <h3 className="text-lg font-semibold text-gray-900 border-l-4 border-smblue-400 pl-4 mb-4">
          Recent Activity
        </h3>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-smblue-400"></div>
          <span className="ml-2 text-gray-600">Loading activities...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeInUp {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideInFromBottom {
          from { transform: translateY(15px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideOutToBottom {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(15px); opacity: 0; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-slide-in-right { animation: slideInRight 0.4s ease-out; }
        .animate-fade-in-up { animation: fadeInUp 0.3s ease-out; }
        .animate-slide-in-bottom { animation: slideInFromBottom 0.3s ease-out; }
        .animate-slide-out-bottom { animation: slideOutToBottom 0.25s ease-in; }
        .animate-shimmer { 
          position: relative;
          overflow: hidden;
        }
        .animate-shimmer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: shimmer 2s infinite;
        }
      `}</style>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in-up">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 border-l-4 border-smblue-400 pl-4">
            Recent Activity
          </h3>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setFilter(filter === 'all' ? 'completed' : 'all')}
              className="p-2 hover:bg-gray-100 rounded-2xl transition-all duration-150"
              title="Filter activities"
            >
              <Filter className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Activity Type Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {['all', 'completed', 'submitted', 'approved', 'started', 'updated'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type as any)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 ${
                filter === type
                  ? 'bg-smblue-400 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
        
        <div className="space-y-3">
          {displayedActivities.map((activity, index) => {
            // Only animate initial items or new items when showing more
            const shouldAnimateIn = index < 5 || (showAll && animateNewItems && index >= 5);
            const shouldAnimateOut = showAll && animateOut && index >= 5;
            
            let animationClass = '';
            let delay = '0ms';
            
            if (shouldAnimateOut) {
              animationClass = 'animate-slide-out-bottom';
              delay = `${(index - 5) * 30}ms`;
            } else if (shouldAnimateIn) {
              animationClass = index < 5 ? 'animate-slide-in-right' : 'animate-slide-in-bottom';
              delay = index < 5 ? `${index * 100}ms` : `${(index - 5) * 50}ms`;
            }
            
            return (
              <div
                key={activity.id}
                className={`p-3 rounded-2xl border transition-all duration-200 transform hover:shadow-sm ${getActivityColor(activity.type)} ${animationClass}`}
                style={{animationDelay: delay}}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex items-center space-x-2 mt-0.5">
                      {getActivityIcon(activity.type)}
                      {getPriorityIndicator(activity.priority)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 mb-1 leading-tight">
                        {activity.activity}
                      </p>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {activity.time}
                        </p>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          {activity.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0 transform transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Show More/Less Button */}
        {filteredActivities.length > 5 && (
          <div className="text-center pt-4 mt-4 border-t border-gray-100">
            <button 
              onClick={handleShowMore}
              className="cursor-pointer text-smblue-400 hover:text-white text-sm font-medium flex items-center space-x-2 mx-auto transition-all duration-200 transform hover:scale-105 active:scale-95 px-4 py-2 rounded-2xl hover:bg-smblue-400"
            >
              <span>{showAll ? 'Show Less' : `Show ${filteredActivities.length - 5} More`}</span>
              <ChevronRight className={`w-4 h-4 transform transition-transform duration-200 ${showAll ? 'rotate-90' : ''}`} />
            </button>
          </div>
        )}

        {/* Empty State */}
        {filteredActivities.length === 0 && (
          <div className="text-center py-8 animate-fade-in-up">
            <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">No activities found for this filter</p>
            <button 
              onClick={() => setFilter('all')}
              className="text-smblue-200 hover:text-smblue-400 text-sm mt-2 transition-colors duration-200"
            >
              Show all activities
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default RecentActivity;

