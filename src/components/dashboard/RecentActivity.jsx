import { useState, useEffect } from 'react';
import Icon from '../ui/icons/Icon';

export default function RecentActivity({ userId }) {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();

    async function fetchActivities() {
      try {
        // In a real app, this would be an API call with proper error handling
        // For demo, simulating API call with reduced timeout
        await new Promise(resolve => setTimeout(resolve, 100));
        setActivities([
          {
            id: 1,
            type: 'completion',
            title: 'Completed Module 1',
            description: "You've completed the first module of Nutrition Basics",
            timestamp: '2 days ago',
            icon: 'mdi:check-circle',
            iconBg: 'bg-green-100 dark:bg-green-900/30',
            iconColor: 'text-green-600 dark:text-green-400'
          },
          {
            id: 2,
            type: 'join',
            title: 'Joined the Platform',
            description: 'Welcome to your learning journey!',
            timestamp: '1 week ago',
            icon: 'mdi:account-plus',
            iconBg: 'bg-blue-100 dark:bg-blue-900/30',
            iconColor: 'text-blue-600 dark:text-blue-400'
          }
        ]); // Replace with actual API call
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error('Error fetching activities:', error);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchActivities();

    return () => {
      abortController.abort();
    };
  }, [userId]);

  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <div className="animate-pulse text-gray-400">Loading activities...</div>
          </div>
        ) : activities.length > 0 ? (
          activities.map(activity => (
            <div key={activity.id} className="flex items-start gap-4">
              <div className={`p-2 ${activity.iconBg} rounded-lg`}>
                <Icon name={activity.icon} className={`w-5 h-5 ${activity.iconColor}`} />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{activity.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{activity.description}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{activity.timestamp}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-4 text-gray-500">
            No recent activity
          </div>
        )}
      </div>
    </div>
  );
} 