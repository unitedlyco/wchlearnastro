import { useState, useEffect } from 'react';
import Icon from '../ui/icons/Icon';

// Add loading skeleton component
const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

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

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Recent Activity
      </h3>
      {activities.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No recent activity to show.</p>
      ) : (
        <div className="flow-root">
          <ul className="-mb-8">
            {activities.map((activity, index) => (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {index < activities.length - 1 && (
                    <span
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className={`h-8 w-8 rounded-full ${activity.iconBg} flex items-center justify-center ring-8 ring-white dark:ring-gray-800`}>
                        <Icon name={activity.icon} className={`w-5 h-5 ${activity.iconColor}`} />
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.title}
                        </p>
                        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                          {activity.description}
                        </p>
                      </div>
                      <div className="whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                        {activity.timestamp}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 