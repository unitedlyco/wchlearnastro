import { useState, useEffect } from 'react';
import Icon from '../ui/icons/Icon';

// Add loading skeleton component
const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
    <div className="space-y-3">
      <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  </div>
);

export default function UpcomingSessions({ userId }) {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();

    async function fetchSessions() {
      try {
        // In a real app, this would be an API call with proper error handling
        // For demo, simulating API call with reduced timeout
        await new Promise(resolve => setTimeout(resolve, 100));
        setSessions([
          {
            id: 1,
            title: 'Introduction to Nutrition',
            datetime: 'Tomorrow, 10:00 AM'
          }
        ]); // Replace with actual API call
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error('Error fetching sessions:', error);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchSessions();

    return () => {
      abortController.abort();
    };
  }, [userId]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Upcoming Sessions
      </h3>
      <div className="space-y-4">
        {sessions.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No upcoming sessions scheduled.</p>
        ) : (
          sessions.map(session => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {session.title}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {session.datetime}
                </p>
              </div>
              <button
                className="px-3 py-1 text-sm text-primary-600 bg-primary-100 hover:bg-primary-200 dark:text-primary-400 dark:bg-primary-900/30 dark:hover:bg-primary-900/50 rounded-full transition-colors"
                onClick={() => window.location.href = '/dashboard/sessions'}
              >
                View Details
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 